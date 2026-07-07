# Virtual Café Focus Room

A responsive React/Vite MVP that simulates the ritual of going to a café to focus:
enter the café, order a drink, choose a seat, set a task, and start a timed focus session.

Includes English and Chinese UI copy with a language switch in the header.

## Run locally

```bash
npm install
npm run dev
```

If `npm` is not installed on your Mac, use the project-local launcher instead:

```bash
./scripts/dev.sh
```

It downloads Node.js into `.local/` for this project and starts the app at
`http://127.0.0.1:5173/`.

## Publish on GitHub Pages

This project is ready for GitHub Pages through `.github/workflows/pages.yml`.

Create a GitHub repository named `virtual-cafe-focus-room` under `yuqingxing22`,
then push the local `main` branch:

```bash
git remote add origin git@github.com:yuqingxing22/virtual-cafe-focus-room.git
git push -u origin main
```

After the deploy workflow finishes, the page URL will be:

```text
https://yuqingxing22.github.io/virtual-cafe-focus-room/
```

## Features

- Five-scene café flow: entrance, ordering, seat selection, setup, focus room.
- Ritual actions before starting: put phone away and open laptop.
- Countdown timer with pause, resume, and end controls.
- Subtle public-space status messages.
- First scripted intentional intervention: if the user pauses too long, a seat-specific café moment and inner thought gently return them to the current task.
- Scene backdrops support either full video assets or multiple still images that rotate with a subtle drift effect.
- Real ambient sound layers: café ambience, rain, typing, cup/stir sounds, back-counter coffee making, light/heavy street traffic, and optional soft jazz.
- Short ritual sound effects for entering, ordering, and starting work.
- Project-local café background image in `public/assets/cafe-room.png`.

## Product direction

- `docs/visual-asset-guidelines.md` keeps the visual asset pipeline, fixed character prompts, scene video rules, and Chinese terminology for 即梦 generation.
- `docs/interaction-roadmap.md` outlines the next immersive layer: third-person entrance/order/seat transitions, seat-specific scripted interventions, pause reminders, and rest moments.

## Scene images

Still images can be used before video assets are ready. Add `01.png`, `02.png`, and `03.png` to these folders:

- `public/assets/scenes/entrance/`
- `public/assets/scenes/order/`
- `public/assets/scenes/seat-selection/`
- `public/assets/scenes/setup/`
- `public/assets/scenes/focus-window/`
- `public/assets/scenes/focus-bar/`
- `public/assets/scenes/focus-corner/`
- `public/assets/scenes/focus-quiet/`
- `public/assets/scenes/complete/`

If a scene image is missing, the app falls back to `public/assets/cafe-room.png`.

## Audio

Original uploaded audio lives locally in `sound-effect/`. That folder is
intentionally gitignored because it contains very large source recordings that
are not needed for GitHub Pages.

The web app serves the copied browser assets from `public/audio/`:

- `cafe-ambience.mp3`
- `rain.mp3`
- `typing.mp3`
- `coffee-stir.mp3`
- `light-traffic.m4a`
- `heavy-traffic.m4a`
- `back-counter-coffee.mp3`
- `jazz/cafe/*.mp3`
- `jazz/swing/*.mp3`
- `jazz/club/*.mp3`
- `steps-to-cafe.mp3`
- `door-open.mp3`
- `door-bell.mp3`
- `espresso.mp3`
- `drip-coffee.mp3`
- `cup-set-down.mp3`

The original traffic ambience files in `sound-effect/` are kept as source material.
The app uses 2-minute `.m4a` web clips in `public/audio/` so the page does not load the full original recordings.

`sound-effect/back-counter-coffee-source.mp3` is copied into the app as `public/audio/back-counter-coffee.mp3`.
It is strongest by default on the bar seat, where the user is closest to the counter and back-of-house sounds.

Jazz is wired as an optional ambience layer with three ordered playlists:
Cafe, Swing, and Club. It defaults on for the bar seat, lightly on for the window seat, and off for corner/deep-work and quiet-zone seats.
