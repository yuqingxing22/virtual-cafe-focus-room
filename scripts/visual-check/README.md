# Visual check

Used to confirm a refactor did not change behaviour. `walk.mjs` drives the built site through every scene with a frozen clock and saves, for each of 174 states, a screenshot, the DOM and every element's computed style, plus a log of tab titles, localStorage and audio requests. `compare.mjs` compares two such folders.

Playwright, pngjs and pixelmatch are not project dependencies. Install them in a scratch folder, copy the two scripts there and run them from it. Full instructions (in Chinese) are in `docs/progress.md` under 工作约定.
