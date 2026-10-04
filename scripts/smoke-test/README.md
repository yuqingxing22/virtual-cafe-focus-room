# Smoke test

`smoke.mjs` drives the café end to end in a fresh headless Chrome and prints one PASS or FAIL line per check: entrance to focus, the three time slots, countdown, pause and the Space shortcut, restoring a session after a refresh, letting the countdown run out and earning a stamp, the returning-visitor entrance, Chinese copy, and the phone drawer. It also checks what the page requested: audio only from R2, no removed files, no failed requests, no console errors, and (on the live site) that analytics and error reporting loaded.

Run it against the live site after every deploy. It is different from `scripts/visual-check/`, which compares two builds state by state to prove a refactor changed nothing.

Playwright is not a project dependency. Install it once in a scratch folder, copy the script there and run it from it:

```bash
mkdir -p /tmp/cafe-smoke && cd /tmp/cafe-smoke
npm init -y && npm i playwright-core
cp <repo>/scripts/smoke-test/smoke.mjs .
node smoke.mjs                         # live site
node smoke.mjs http://localhost:4173/  # a local `vite preview`
```

`CHROME_EXE` sets the browser; it defaults to Google Chrome on macOS. The script uses its own temporary profile, so it does not disturb a browser another session is driving.

Things to know:

- It loads the page with a query string, because GitHub Pages caches `index.html` for ten minutes.
- It adapts to the jazz switch: with `JAZZ_ENABLED = false` it expects the notice and no jazz requests, otherwise the slider and three playlists.
- Each run is one real visit in Web Analytics, and a genuine page error during a run would be reported to Sentry like any visitor's.
- When a feature's copy or structure changes on purpose, update the matching check in the same pull request.
