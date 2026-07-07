# Cloudflare Pages + R2 Deployment

This is the recommended production setup for public sharing:

- Cloudflare Pages hosts the React/Vite app.
- Cloudflare R2 hosts audio files under the same object keys used locally, such as `audio/rain.mp3`.
- `VITE_AUDIO_BASE_URL` points the app at the public R2 bucket or custom asset domain.
- `npm run build:external-audio` removes `dist/audio` after Vite builds, so Pages does not upload the large audio files.

## Why this setup

The app is static, but the audio bundle is large. Keeping the UI on Pages and the audio on R2 avoids pushing long audio files through every site deployment.

## R2 bucket

Create an R2 bucket, for example:

```bash
npx wrangler r2 bucket create virtual-cafe-focus-room-audio
```

Upload local audio while preserving the `audio/...` keys:

```bash
npm run upload:audio:r2 -- virtual-cafe-focus-room-audio
```

Make the bucket publicly readable in the Cloudflare dashboard, then copy its public bucket URL or attach a custom domain such as `https://assets.example.com/`.

Verify at least these files return `200`:

```bash
curl -I https://YOUR_PUBLIC_AUDIO_BASE/audio/cafe-ambience.mp3
curl -I https://YOUR_PUBLIC_AUDIO_BASE/audio/rain.mp3
```

## Cloudflare Pages

Create a Pages project from the GitHub repository.

Use these build settings:

```text
Framework preset: Vite
Build command: npm run build:external-audio
Build output directory: dist
Root directory: /
```

Set this environment variable in Pages for production and preview:

```text
VITE_AUDIO_BASE_URL=https://YOUR_PUBLIC_AUDIO_BASE/
```

Then deploy. The app should load from:

```text
https://virtual-cafe-focus-room.pages.dev/
```

or your custom Cloudflare Pages domain.

## Direct upload option

If you do not want Git integration, build and deploy from this machine:

```bash
VITE_AUDIO_BASE_URL=https://YOUR_PUBLIC_AUDIO_BASE/ npm run deploy:cloudflare
```

Wrangler will ask you to log in if needed.

## Keep GitHub Pages working

The existing GitHub Pages setup still uses bundled `public/audio` through `npm run build`.
Do not change that workflow to `build:external-audio` unless `gh-pages` also points to the R2 audio base.
