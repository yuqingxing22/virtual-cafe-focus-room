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

## Deployment

The app is served by GitHub Pages at `https://cafe.tempomyplanner.com/` (custom domain, see `public/CNAME`). Audio is served from Cloudflare R2 at `https://audio.tempomyplanner.com/`, so site deploys stay small and audio bandwidth is unmetered.

- Pushing to `main` runs `.github/workflows/pages.yml`. It builds with `npm run build:external-audio` and the repository variable `VITE_AUDIO_BASE_URL`, then force-pushes `dist/` to the `gh-pages` branch. The build fails on purpose if the variable is missing.
- Audio is uploaded separately with `npm run upload:audio:r2 -- virtual-cafe-focus-room-audio`.
- Local development ignores the variable and falls back to `public/audio/`.

One-time setup and troubleshooting: `docs/cloudflare-pages-r2.md`.

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

Still images can be used before video assets are ready. Add `01.webp`, `02.webp`, and `03.webp` to these folders:

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

Every sound is a real recording with a licence that allows use on a public site (CC0 or the Pixabay licence). Sources, authors and licences are in `docs/audio-credits.md`.

The ambience changes with a time-of-day switch (morning, daytime, night) that the visitor chooses on the setup page or in the mixer. Café chatter, rain and street each have a fuller and a sparser recording; birdsong only plays in the morning. Seat presets are multiplied by per-slot factors in `src/lib/timeSlot.js`, and the track table is in `src/audio/tracks.js`.

- Source recordings live locally in `freesound/` and `pixabay/` (not in git), each with a `SOURCES.md`. Older source material is in `sound-effect/`.
- `python3 scripts/process-ambience.py` builds the nine ambience tracks into `public/audio/`: it trims each source, matches its loudness to the track it replaced, and crossfades the loop point. It needs ffmpeg.
- `public/audio/` is not in git either. Production audio is served from Cloudflare R2; see `docs/cloudflare-pages-r2.md`.

Jazz is an optional layer with three hosted playlists (Cafe, Swing, Club). A YouTube station is a separate slider; turning either up silences the other.
