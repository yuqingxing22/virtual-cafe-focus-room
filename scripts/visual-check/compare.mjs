// Compare two walkthrough folders: pixels, DOM, computed styles and the log.
// Usage: node compare.mjs <dirA> <dirB>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [a, b] = process.argv.slice(2);
const names = readdirSync(a).sort();
let bad = 0;
const counts = { png: 0, html: 0, css: 0 };
for (const name of names) {
  if (!existsSync(`${b}/${name}`)) {
    console.log(`MISSING in ${b}: ${name}`);
    bad++;
    continue;
  }
  // Custom properties enumerate in no fixed order, so sort each element's declarations.
  const norm = (buf) => name.endsWith(".css.txt")
    ? Buffer.from(buf.toString().split("\n").map((line) => { const at = line.indexOf(" {"); return line.slice(0, at) + " {" + line.slice(at + 2, -1).split(";").sort().join(";") + "}"; }).join("\n"))
    : buf;
  const fa = norm(readFileSync(`${a}/${name}`));
  const fb = norm(readFileSync(`${b}/${name}`));
  if (name.endsWith(".png")) {
    counts.png++;
    const pa = PNG.sync.read(fa);
    const pb = PNG.sync.read(fb);
    if (pa.width !== pb.width || pa.height !== pb.height) {
      console.log(`SIZE ${name}: ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}`);
      bad++;
      continue;
    }
    const diff = pixelmatch(pa.data, pb.data, null, pa.width, pa.height, { threshold: 0.1 });
    if (diff > 0) {
      console.log(`PIXELS ${name}: ${diff} differ`);
      bad++;
    }
  } else if (!fa.equals(fb)) {
    const la = fa.toString().split("\n");
    const lb = fb.toString().split("\n");
    const i = la.findIndex((line, idx) => line !== lb[idx]);
    console.log(`TEXT ${name}: line ${i + 1}\n  A: ${(la[i] ?? "").slice(0, 300)}\n  B: ${(lb[i] ?? "").slice(0, 300)}`);
    bad++;
  } else if (name.endsWith(".html")) counts.html++;
  else if (name.endsWith(".css.txt")) counts.css++;
}
for (const name of readdirSync(b)) if (!existsSync(`${a}/${name}`)) { console.log(`EXTRA in ${b}: ${name}`); bad++; }
console.log(`${counts.png} screenshots, ${counts.html} DOM dumps, ${counts.css} style dumps compared; ${bad} differences`);
process.exit(bad ? 1 : 0);
