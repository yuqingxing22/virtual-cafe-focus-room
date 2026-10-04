// Walk every scene and state of the café with a fake clock; save screenshots, DOM dumps,
// computed styles and a log of titles, audio requests and localStorage.
// Usage: PORT=4183 CHROME_EXE=... node walk.mjs <outdir>
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const BASE = `http://localhost:${process.env.PORT || 4183}/`;
const T0 = new Date("2026-10-03T20:00:00Z");
const log = [];

const viewports = [
  { name: "desk", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1100 },
  { name: "phone", width: 390, height: 844, isMobile: true, hasTouch: true },
];

// Every element's computed style, keyed by a DOM path, for the stylesheet refactor check.
const dumpStyles = () => {
  const rows = [];
  const walk = (el, path) => {
    const cs = getComputedStyle(el);
    const parts = [];
    for (const prop of cs) parts.push(`${prop}:${cs.getPropertyValue(prop)}`);
    for (const pseudo of ["::before", "::after", "::placeholder"]) {
      const ps = getComputedStyle(el, pseudo);
      if (pseudo === "::placeholder" ? el.tagName === "INPUT" : ps.content !== "none") {
        const pp = [];
        for (const prop of ps) pp.push(`${prop}:${ps.getPropertyValue(prop)}`);
        rows.push(`${path}${pseudo} {${pp.join(";")}}`);
      }
    }
    rows.push(`${path} {${parts.join(";")}}`);
    [...el.children].forEach((child, i) => {
      if (child.tagName === "SCRIPT") return;
      walk(child, `${path}>${child.tagName.toLowerCase()}${child.className && typeof child.className === "string" ? "." + child.className.trim().replace(/\s+/g, ".") : ""}[${i}]`);
    });
  };
  walk(document.documentElement, "html");
  return rows.join("\n");
};

async function run(vp, lang) {
  const tag = `${vp.name}-${lang}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXE });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    reducedMotion: vp.name === "tablet" ? "no-preference" : "reduce",
    locale: lang === "zh" ? "zh-CN" : "en-US",
  });
  // Block audio and YouTube so nothing depends on the network; requests are still logged.
  await context.route(/\.(mp3|m4a)(\?|$)|youtube/, (r) => r.abort());
  const page = await context.newPage();
  page.on("request", (r) => /\.(mp3|m4a)|youtube/.test(r.url()) && log.push(`${tag} request ${r.url().replace(BASE, "/")}`));
  page.on("pageerror", (e) => log.push(`${tag} pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource|ERR_FAILED/.test(m.text()) && log.push(`${tag} console: ${m.text()}`));
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(new Date(T0.getTime() + 5000));
  await page.addInitScript(() => { Math.random = () => 0.5; });
  let n = 0;
  const shot = async (label) => {
    await page.waitForTimeout(60);
    await page.clock.runFor(2500);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))));
    await page.waitForTimeout(150);
    await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }));
    await page.waitForTimeout(50);
    const stem = `${tag}-${String(++n).padStart(2, "0")}-${label}`;
    await page.screenshot({ path: `${out}/${stem}.png`, fullPage: true, animations: "disabled", style: ".scene-backdrop { visibility: hidden !important; }" });
    writeFileSync(`${out}/${stem}.html`, await page.evaluate(() => document.querySelector("#root").innerHTML.replace(/></g, ">\n<")));
    writeFileSync(`${out}/${stem}.css.txt`, (await page.evaluate(dumpStyles)).replaceAll(BASE, "/"));
    log.push(`${stem} title="${await page.title()}"`);
  };
  const click = (name) => page.getByRole("button", { name, exact: true }).first().click();
  const L = lang === "zh"
    ? { enter: "推门进入", drink: /冰拿铁/, drink2: /美式咖啡/, choose: "去选座位", seat: /窗边座位/, seat2: /吧台座位/, sit: "坐下来", back: "返回", phone: "把手机放远一点", laptop: "打开电脑", start: "开始专注", take: "休息 5 分钟", toTable: "回到座位", ret: "回到任务", again: "下次再来", mixer: /调整环境音/ }
    : { enter: "Enter the Café", drink: /Iced Latte/, drink2: /Americano/, choose: "Choose a seat", seat: /Window Seat/, seat2: /Bar Seat/, sit: "Sit down", back: "Back", phone: "Put my phone away", laptop: "Open my laptop", start: "Start Working", take: "Take a 5-minute break", toTable: "Back to my table", ret: "Return to task", again: "Visit again", mixer: /Adjust the room sound/ };
  const blur = () => page.evaluate(() => document.activeElement?.blur());
  const openMixer = async () => {
    if (vp.name !== "desk") await page.getByRole("button", { name: L.mixer }).click();
  };

  await page.goto(BASE);
  await shot("entrance");
  await click(L.enter);
  await shot("order");
  await page.getByRole("button", { name: L.drink }).click();
  await shot("order-picked");
  await click(L.choose);
  await shot("seat");
  await page.getByRole("button", { name: L.seat }).click();
  await shot("seat-picked");
  await click(L.sit);
  await shot("setup-empty");
  await click(L.back);
  await page.getByRole("button", { name: L.seat2 }).click();
  await click(L.sit);
  await page.locator(".task-field input").fill("write introduction");
  await page.locator(".setup-panel .time-slots button").first().click();
  await page.locator(".custom-duration input").fill("50");
  await click(L.phone);
  await click(L.laptop);
  await shot("setup");
  await click(L.start);
  await shot("focus");
  await openMixer();
  await shot("focus-mixer");
  await page.locator(".sound-slider input").nth(2).fill("0.7");
  await page.locator(".mixer .time-slots button").nth(2).click();
  await shot("focus-mixed-night");
  // YouTube station card: raise its slider (the last one), pick a station, try a bad link.
  await page.locator(".sound-slider input").last().fill("0.4");
  await shot("youtube-open");
  await page.locator(".station-list button").nth(1).click();
  await page.locator(".station-form input").fill("not a link");
  await page.locator(".station-form button").click();
  await shot("youtube-bad-link");
  await page.locator(".station-form input").fill("https://www.youtube.com/watch?v=jfKfPfyJRdk");
  await page.locator(".station-form button").click();
  await shot("youtube-custom");
  // Header controls: mute, then switch language and back.
  await page.locator(".ambience-switch").click();
  await shot("muted");
  await page.locator(".language-switch button").nth(lang === "zh" ? 0 : 1).click();
  await shot("other-language");
  await page.locator(".language-switch button").nth(lang === "zh" ? 1 : 0).click();
  await page.locator(".ambience-switch").click();
  await blur();
  await page.keyboard.press("Space");
  await shot("paused-key");
  await page.clock.runFor(91000);
  await shot("pause-nudge");
  await click(L.ret);
  await page.clock.runFor(26 * 60 * 1000);
  await shot("break-offer");
  await click(L.take);
  await shot("on-break");
  await page.clock.runFor(2 * 60 * 1000);
  await shot("on-break-2min");
  await click(L.toTable);
  await shot("after-break");
  await page.reload();
  await shot("restored");
  await blur();
  await page.keyboard.press("Space");
  await page.reload();
  await shot("restored-paused");
  await page.keyboard.press("Space");
  await page.clock.runFor(30 * 60 * 1000);
  await shot("complete");
  await click(L.again);
  await shot("entrance-return");
  // A second session: break left to run out by itself, then ended early with Esc twice.
  await click(L.enter);
  await page.getByRole("button", { name: L.drink2 }).click();
  await click(L.choose);
  await page.getByRole("button", { name: L.seat }).click();
  await click(L.sit);
  await page.locator(".task-field input").fill("read one paper");
  await page.locator(".duration-group button").nth(2).click();
  await click(L.phone);
  await click(L.laptop);
  await click(L.start);
  await page.clock.runFor(25.5 * 60 * 1000);
  await click(L.take);
  await page.clock.runFor(5.2 * 60 * 1000);
  await shot("break-ran-out");
  await blur();
  await page.keyboard.press("Escape");
  await shot("paused-esc");
  await page.keyboard.press("Escape");
  await shot("ended-early");
  // A third: under a minute, so no visit is recorded.
  await click(L.again);
  await click(L.enter);
  await page.getByRole("button", { name: L.drink }).click();
  await click(L.choose);
  await page.getByRole("button", { name: L.seat }).click();
  await click(L.sit);
  await page.locator(".task-field input").fill("x");
  await click(L.phone);
  await click(L.laptop);
  await click(L.start);
  await page.clock.runFor(20 * 1000);
  await page.locator(".icon-action.end").click();
  await shot("ended-under-a-minute");
  const ls = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort())));
  log.push(`${tag} localStorage ${ls}`);
  await browser.close();
}

const only = process.env.ONLY;
const jobs = [];
for (const vp of viewports) for (const lang of ["en", "zh"]) {
  if (only && only !== `${vp.name}-${lang}`) continue;
  jobs.push(run(vp, lang));
}
await Promise.all(jobs);
log.sort();
writeFileSync(`${out}/log.txt`, log.join("\n") + "\n");
console.log(`${log.filter((l) => /title=/.test(l)).length} shots; ${log.filter((l) => /pageerror|console:/.test(l)).length} errors`);
