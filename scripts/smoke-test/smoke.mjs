// Smoke test: drive the café end to end in a fresh headless Chrome and report pass/fail per check.
// Run it against the live site after a deploy, or against a local `vite preview`.
// Usage: CHROME_EXE=<path to Chrome> node smoke.mjs [baseUrl]
// See README.md for setup. Exit code is 0 when every check passes.
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  ({ chromium } = await import("playwright"));
}

const BASE = process.argv[2] || "https://cafe.tempomyplanner.com/";
const CHROME = process.env.CHROME_EXE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LIVE_AUDIO_HOST = "audio.tempomyplanner.com";
const isLive = new URL(BASE).host === "cafe.tempomyplanner.com";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail: String(detail) });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 840 }, locale: "en-US" });
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
const requests = [];
const failed = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
});
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 300)));
page.on("request", (r) => requests.push(r.url()));
page.on("response", (r) => {
  if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 120)}`);
});

const btn = (label, scope = page) => scope.locator("button", { hasText: label }).first();
const text = async (selector) => ((await page.locator(selector).first().textContent().catch(() => null)) || "").trim();
const sliderValue = (label) =>
  page.evaluate((wanted) => {
    const row = [...document.querySelectorAll(".sound-slider")].find((el) => el.querySelector("span").textContent.includes(wanted));
    return row ? row.querySelector("input").value : null;
  }, label);

try {
  // A query string sidesteps the 10-minute cache GitHub Pages puts on index.html.
  await page.goto(`${BASE}?fresh=${Date.now()}`, { waitUntil: "load" });
  const bundle = await page.evaluate(() =>
    [...document.scripts].map((s) => s.src).find((s) => s.includes("/assets/index-"))?.split("/").pop(),
  );
  check("page loads", (await text("h1")).length > 0, `h1 "${await text("h1")}", bundle ${bundle}`);
  check("privacy and feedback links", (await page.locator(".site-note a").count()) === 2);

  // Entrance to focus, choosing the morning slot.
  await btn("Step inside").click();
  await sleep(2500);
  check("order scene", (await text("#order-title")).length > 0);
  check("ambience starts at the door", (await page.locator(".ambience-switch.on").count()) === 1);
  await btn("Americano").click();
  await btn("Choose a seat").click();
  await btn("Window seat").click();
  await btn("Sit down").click();
  await page.locator(".task-field input").fill("smoke test");
  check("setup has three time slots", (await page.locator(".setup-panel .time-slots button").count()) === 3);
  await page.locator(".custom-duration input").fill("3");
  check("custom length out of range: hint and no start", (await text(".field-hint")).length > 0 && (await btn("Start working").isDisabled()), await text(".field-hint"));
  await page.locator(".custom-duration input").fill("");
  await btn("Morning", page.locator(".setup-panel")).click();
  await btn("Put my phone away").click();
  await btn("Open my laptop").click();
  await btn("Start working").click();
  await sleep(2200);

  const first = await text(".timer-display");
  await sleep(2100);
  const second = await text(".timer-display");
  check("countdown runs", first !== second && /^4[45]:/.test(second), `${first} -> ${second}`);
  check("tab title shows countdown", (await page.title()).includes("smoke test"), await page.title());
  check("morning: birdsong slider", (await sliderValue("Birdsong")) === "0.4", `value ${await sliderValue("Birdsong")}`);
  check("YouTube slider present", (await sliderValue("YouTube")) !== null);

  // Jazz is either paused (notice, no controls, no jazz requests) or on (slider and three playlists).
  const jazzPaused = (await page.locator(".layer-paused").count()) === 1;
  if (jazzPaused) {
    check("jazz paused: notice instead of controls", (await sliderValue("Soft jazz")) === null && (await page.locator(".jazz-modes button").count()) === 0, await text(".layer-paused p"));
  } else {
    check("jazz on: slider and three playlists", (await sliderValue("Soft jazz")) !== null && (await page.locator(".jazz-modes button").count()) === 3);
  }

  await btn("Pause").click();
  const paused = await text(".timer-display");
  await sleep(1600);
  check("pause freezes the timer", paused === (await text(".timer-display")) && (await btn("Resume").count()) === 1, paused);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press("Space");
  await sleep(400);
  check("Space resumes", (await btn("Pause").count()) === 1);

  // The mixer is an overlay; open it from the rail first.
  await page.locator(".mixer-toggle").click();
  check("mixer opens from the rail", await page.locator(".mixer-body").isVisible());
  await btn("Night", page.locator(".mixer")).click();
  await sleep(2500);
  check("night: no birdsong slider", (await sliderValue("Birdsong")) === null);
  await page.locator(".side-close").click();
  check("mixer closes", !(await page.locator(".mixer-body").isVisible()));

  // A refresh must bring the session back.
  await page.reload({ waitUntil: "load" });
  await sleep(1500);
  check("refresh restores the session", (await text("#focus-title")) === "smoke test", await text("#focus-title"));
  check("restored notice", (await text(".status-message")).startsWith("Your table was kept"), await text(".status-message"));
  check("restored slot is night", (await text(".mixer .time-slots button.active")) === "Night", await text(".mixer .time-slots button.active"));

  // Let the countdown run out by moving the page clock forward.
  await page.evaluate(() => {
    const real = Date.now.bind(Date);
    Date.now = () => real() + 46 * 60 * 1000;
  });
  await sleep(1800);
  check("countdown completes on its own", (await text(".complete-panel .eyebrow")) === "Session complete", await text(".complete-panel .eyebrow"));
  check("stamp earned", (await page.locator(".complete-panel .stamp.filled").count()) === 1 && (await page.locator(".stamp.new").count()) === 1);
  check("saved session cleared", (await page.evaluate(() => localStorage.getItem("cafe-focus-session"))) === null);
  check("stay-another button carries the length", (await btn("Stay another 45 minutes").count()) === 1);
  await btn("Stay another 45 minutes").click();
  await sleep(1200);
  check("stay another: back at the same table", (await text("#focus-title")) === "smoke test" && /^4[45]:/.test(await text(".timer-display")), `${await text("#focus-title")} ${await text(".timer-display")}`);
  await page.locator(".mixer-toggle").click();
  check("stay another: seat sound kept", (await sliderValue("Birdsong")) === null && (await text(".mixer .time-slots button.active")) === "Night", await text(".mixer .time-slots button.active"));
  await page.locator(".side-close").click();
  await page.evaluate(() => {
    const real = Date.now.bind(Date);
    Date.now = () => real() + 92 * 60 * 1000;
  });
  await sleep(1800);
  check("second session completes too", (await text(".complete-panel .eyebrow")) === "Session complete", await text(".complete-panel .eyebrow"));
  await btn("Visit again").click();
  // Leaving goes through the door (800 ms) and the entrance fades up.
  await sleep(2000);
  check("returning visitor at the entrance", (await text(".eyebrow")).includes("visit 3"), await text(".eyebrow"));

  // Chinese copy and the phone layout.
  await btn("中文").click();
  await sleep(300);
  check("Chinese copy", /[一-鿿]/.test(await text("h1")), await text("h1"));
  await page.setViewportSize({ width: 390, height: 844 });
  await btn("推门进去").click();
  await btn("美式").click();
  await btn("去挑座位").click();
  await btn("吧台").click();
  await btn("坐下来").click();
  await page.locator(".task-field input").fill("手机");
  await btn("把手机").click();
  await btn("打开电脑").click();
  await btn("开始专注").click();
  await sleep(800);
  check("phone: mixer is a closed drawer", (await page.locator(".mixer-toggle").isVisible()) && !(await page.locator(".mixer-body").isVisible()));
  await page.locator(".mixer-toggle").click();
  check("phone: drawer opens", await page.locator(".mixer-body").isVisible());
  await page.locator(".side-close").click();
  // Ending takes two presses: the first arms the button.
  await btn("结束").click();
  check("end asks once", (await text(".icon-action.end")) === "确定结束？", await text(".icon-action.end"));
  await btn("确定结束").click();
  await sleep(400);
  check("second press ends", (await page.locator(".complete-panel").count()) === 1);

  // What the page asked the network for.
  const audio = requests.filter((u) => u.includes("/audio/"));
  const hosts = [...new Set(audio.map((u) => new URL(u).host))];
  const names = [...new Set(audio.map((u) => u.split("/audio/")[1].split("?")[0]))];
  if (isLive) {
    check("audio comes only from R2", hosts.length === 1 && hosts[0] === LIVE_AUDIO_HOST, hosts.join(","));
    check("analytics beacon loaded", requests.some((u) => u.includes("cloudflareinsights.com/beacon")));
    check("error reporting chunk loaded", requests.some((u) => /errorReporting-.*\.js/.test(u)));
  }
  if (jazzPaused) check("no jazz file requested", !names.some((n) => n.startsWith("jazz/")));
  check("slot recordings requested", ["cafe-morning.mp3", "birds-morning.mp3", "rain-light.mp3", "street-light.mp3", "cafe-night.mp3"].every((n) => names.includes(n)), names.join(" "));
  check("no error reports sent", !requests.some((u) => u.includes("ingest.us.sentry.io")));
  check("no failed requests", failed.length === 0, failed.slice(0, 4).join(" | "));
  check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
} catch (err) {
  check("script ran to the end", false, String(err).slice(0, 300));
} finally {
  await browser.close();
}

const bad = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  [" + r.detail + "]" : ""}`);
console.log(`\n${results.length - bad.length} of ${results.length} checks passed`);
process.exit(bad.length ? 1 : 0);
