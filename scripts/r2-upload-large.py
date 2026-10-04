#!/usr/bin/env python3
"""Upload audio files from public/audio/ to the R2 bucket when ordinary uploads keep failing.

Usage (from the project root, after `npx wrangler login`):
    python3 scripts/r2-upload-large.py cafe-day.mp3 rain-day.mp3

Why this exists: on the owner's network, uploads of more than a few megabytes fail at random
(wrangler reports "fetch failed", curl reports a TLS "bad record mac"). So each file is cut
into 6 MiB parts, every part is uploaded with retries, and a temporary Cloudflare Worker with
an R2 binding stitches the parts together inside Cloudflare using a multipart upload. The
result is checked by downloading it from the public audio domain and comparing MD5 checksums.
The Worker is deployed at the start and deleted at the end; its URL carries a random secret.

Files are stored as audio/<name> with a one-year immutable cache header, so a changed file
should get a new name (and the path in src/audio/tracks.js updated) rather than be overwritten.
"""
import hashlib
import json
import os
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

BUCKET = "virtual-cafe-focus-room-audio"
PUBLIC_BASE = "https://audio.tempomyplanner.com/audio"
AUDIO_DIR = "public/audio"
WORKER_NAME = "cafe-audio-assemble"
PART_BYTES = 6 * 1024 * 1024  # multipart parts must be at least 5 MiB and all the same size
CONTENT_TYPES = {".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav"}

WORKER_JS = """
const SECRET = "__SECRET__";
const partKey = (prefix, i) => prefix + "/" + String(i).padStart(3, "0");
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname !== "/" + SECRET) return new Response("not found", { status: 404 });
    const key = url.searchParams.get("key") || "";
    const prefix = url.searchParams.get("prefix") || "";
    const type = url.searchParams.get("type") || "application/octet-stream";
    const n = Number(url.searchParams.get("parts"));
    const step = url.searchParams.get("step");
    if (step === "ping") return Response.json({ ok: true });
    if (!key.startsWith("audio/") || !prefix.startsWith("tmp-parts/") || !(n >= 1 && n <= 200)) {
      return new Response("bad args", { status: 400 });
    }
    if (step === "check") {
      const sizes = [];
      for (let i = 1; i <= n; i++) { const h = await env.B.head(partKey(prefix, i)); sizes.push(h ? h.size : null); }
      return Response.json({ sizes });
    }
    if (step === "assemble") {
      const meta = { contentType: type, cacheControl: "public, max-age=31536000, immutable" };
      const upload = await env.B.createMultipartUpload(key, { httpMetadata: meta });
      try {
        const done = [];
        for (let i = 1; i <= n; i++) {
          const part = await env.B.get(partKey(prefix, i));
          if (!part) throw new Error("missing part " + i);
          done.push(await upload.uploadPart(i, part.body));
        }
        const final = await upload.complete(done);
        return Response.json({ size: final.size });
      } catch (err) {
        await upload.abort();
        return Response.json({ error: String(err) }, { status: 500 });
      }
    }
    if (step === "cleanup") {
      const keys = [];
      for (let i = 1; i <= n; i++) keys.push(partKey(prefix, i));
      await env.B.delete(keys);
      return Response.json({ deleted: keys.length });
    }
    return new Response("bad step", { status: 400 });
  },
};
"""

WRANGLER_TOML = f"""name = "{WORKER_NAME}"
main = "index.js"
compatibility_date = "2026-09-01"
workers_dev = true

[[r2_buckets]]
binding = "B"
bucket_name = "{BUCKET}"
"""


def md5(path):
    digest = hashlib.md5()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def wrangler(args, cwd):
    return subprocess.run(["npx", "wrangler", *args], capture_output=True, text=True, cwd=cwd)


class Worker:
    def __init__(self, workdir):
        self.dir = workdir
        self.secret = secrets.token_hex(16)
        self.url = None

    def deploy(self):
        open(f"{self.dir}/index.js", "w").write(WORKER_JS.replace("__SECRET__", self.secret))
        open(f"{self.dir}/wrangler.toml", "w").write(WRANGLER_TOML)
        result = wrangler(["deploy"], self.dir)
        host = next((w for w in result.stdout.split() if w.startswith("https://") and "workers.dev" in w), None)
        if result.returncode != 0 or not host:
            sys.exit(f"Could not deploy the helper Worker:\n{result.stdout[-600:]}{result.stderr[-600:]}")
        self.url = f"{host}/{self.secret}"
        for _ in range(30):  # a new workers.dev route takes a little while to answer
            if self.call({"step": "ping"}, tries=1).get("ok"):
                return
            time.sleep(5)
        sys.exit("The helper Worker never became reachable.")

    def call(self, params, tries=6):
        query = "&".join(f"{k}={urllib.request.quote(str(v), safe='')}" for k, v in params.items())
        request = urllib.request.Request(f"{self.url}?{query}", headers={"User-Agent": "curl/8"})
        error = "unreachable"
        for _ in range(tries):
            try:
                with urllib.request.urlopen(request, timeout=900) as response:
                    return json.loads(response.read())
            except urllib.error.HTTPError as exc:
                error = f"{exc.code} {exc.read().decode()[:200]}"
            except Exception as exc:  # network hiccup
                error = str(exc)
            time.sleep(5)
        return {"error": error}

    def delete(self):
        wrangler(["delete", "--name", WORKER_NAME, "--force"], self.dir)


def remote_matches(name, source, scratch):
    tmp = f"{scratch}/download"
    try:
        for _ in range(3):
            result = subprocess.run(["curl", "-s", "-f", "-o", tmp, f"{PUBLIC_BASE}/{name}?verify={int(time.time())}"])
            if result.returncode == 22:  # HTTP error such as 404: not there yet
                return False
            if result.returncode == 0 and os.path.getsize(tmp) == os.path.getsize(source) and md5(tmp) == md5(source):
                return True
            time.sleep(3)
        return False
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def put_part(key, path, cwd):
    for attempt in range(1, 9):
        result = wrangler(["r2", "object", "put", f"{BUCKET}/{key}", "--file", path, "--remote"], cwd)
        if result.returncode == 0 and "Upload complete" in result.stdout:
            return attempt
        time.sleep(2)
    return None


def upload(name, worker, scratch):
    source = f"{AUDIO_DIR}/{name}"
    size = os.path.getsize(source)
    parts = -(-size // PART_BYTES)
    prefix = f"tmp-parts/{name}"
    args = {"key": f"audio/{name}", "prefix": prefix, "parts": parts}
    if remote_matches(name, source, scratch):
        print(f"{name}: already on R2 with a matching checksum, skipped", flush=True)
        return True
    started, retries = time.time(), 0
    with open(source, "rb") as handle:
        for index in range(1, parts + 1):
            part_path = f"{scratch}/part"
            open(part_path, "wb").write(handle.read(PART_BYTES))
            attempts = put_part(f"{prefix}/{index:03d}", part_path, scratch)
            os.remove(part_path)
            if attempts is None:
                print(f"{name}: part {index} of {parts} failed 8 times, giving up", flush=True)
                return False
            retries += attempts - 1
    check = worker.call({"step": "check", **args})
    if None in check.get("sizes", [None]) or sum(check["sizes"]) != size:
        print(f"{name}: uploaded parts do not add up: {check}", flush=True)
        return False
    content_type = CONTENT_TYPES.get(os.path.splitext(name)[1], "application/octet-stream")
    result = worker.call({"step": "assemble", "type": content_type, **args})
    if result.get("size") != size:
        print(f"{name}: assembling failed: {result}", flush=True)
        return False
    if not remote_matches(name, source, scratch):
        print(f"{name}: checksum of the assembled file does not match the local file", flush=True)
        return False
    worker.call({"step": "cleanup", **args})
    print(f"{name}: {size / 1e6:.1f} MB in {parts} parts, {retries} retries, {time.time() - started:.0f}s, checksum OK", flush=True)
    return True


def main():
    names = sys.argv[1:]
    if not names:
        sys.exit(__doc__)
    missing = [n for n in names if not os.path.isfile(f"{AUDIO_DIR}/{n}")]
    if missing:
        sys.exit(f"Not found in {AUDIO_DIR}/: {', '.join(missing)}")
    scratch = tempfile.mkdtemp(prefix="r2-upload-")
    worker = Worker(scratch)
    failed = []
    try:
        worker.deploy()
        for name in names:
            if not upload(name, worker, scratch):
                failed.append(name)
    finally:
        worker.delete()
        shutil.rmtree(scratch, ignore_errors=True)
    if failed:
        sys.exit(f"Failed: {', '.join(failed)}")
    print("All files uploaded and verified.")


if __name__ == "__main__":
    main()
