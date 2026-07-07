import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const audioBase = process.env.VITE_AUDIO_BASE_URL?.trim();

if (!audioBase) {
  throw new Error("VITE_AUDIO_BASE_URL is required for build:external-audio");
}

const distAudio = resolve("dist/audio");

if (existsSync(distAudio)) {
  rmSync(distAudio, { recursive: true, force: true });
  console.log(`Removed bundled audio from ${distAudio}`);
} else {
  console.log("No bundled dist/audio directory found");
}
