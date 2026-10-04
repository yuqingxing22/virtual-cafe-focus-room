import { audioPath } from "../lib/paths.js";

// Tracks with `modes` only sound in those time slots (ambientModes.time); the rest play in every slot.
// Sources and licences: docs/audio-credits.md. Built by scripts/process-ambience.py.
const timed = (key, layerKey, modes, file, maxVolume) => ({
  key,
  layerKey,
  modeGroup: "time",
  modes,
  src: audioPath(`audio/${file}`),
  maxVolume,
});

export const AMBIENT_TRACKS = [
  timed("cafeMorning", "cafe", ["morning"], "cafe-morning.mp3", 0.55),
  timed("cafeDay", "cafe", ["day"], "cafe-day.mp3", 0.55),
  timed("cafeNight", "cafe", ["night"], "cafe-night.mp3", 0.55),
  timed("rainDay", "rain", ["day"], "rain-day.mp3", 0.48),
  timed("rainLight", "rain", ["morning", "night"], "rain-light.mp3", 0.48),
  timed("streetDay", "traffic", ["day"], "street-day.mp3", 0.36),
  timed("streetLight", "traffic", ["morning", "night"], "street-light.mp3", 0.36),
  timed("birds", "birds", ["morning"], "birds-morning.mp3", 0.5),
  { key: "keys", layerKey: "keys", src: audioPath("audio/typing-keys.mp3"), maxVolume: 0.36 },
  { key: "cups", layerKey: "cups", src: audioPath("audio/coffee-stir.mp3"), maxVolume: 0.42 },
  {
    key: "backCounter",
    layerKey: "backCounter",
    src: audioPath("audio/back-counter-coffee.mp3"),
    maxVolume: 0.36,
  },
];

export const JAZZ_PLAYLISTS = {
  cafe: [
    audioPath("audio/jazz/cafe/01-jazz-cafe.mp3"),
    audioPath("audio/jazz/cafe/02-jazz-elegant.mp3"),
    audioPath("audio/jazz/cafe/03-jazz-4.mp3"),
  ],
  swing: [
    audioPath("audio/jazz/swing/01-jazz-cafe-2.mp3"),
    audioPath("audio/jazz/swing/02-jazz-music-3.mp3"),
    audioPath("audio/jazz/swing/03-jazz.mp3"),
    audioPath("audio/jazz/swing/04-jazz-2.mp3"),
    audioPath("audio/jazz/swing/05-jazz-music-2.mp3"),
  ],
  club: [
    audioPath("audio/jazz/club/01-jazz-club.mp3"),
    audioPath("audio/jazz/club/02-west-coast-jazz.mp3"),
    audioPath("audio/jazz/club/03-jazz-4.mp3"),
  ],
};

export const getJazzPlaylist = (mode) => JAZZ_PLAYLISTS[mode] ?? JAZZ_PLAYLISTS.cafe;

export const CUE_SOUNDS = {
  steps: audioPath("audio/steps-to-cafe.mp3"),
  woodenDoor: audioPath("audio/door-open.mp3"),
  door: audioPath("audio/door-bell.mp3"),
  espresso: audioPath("audio/espresso.mp3"),
  drip: audioPath("audio/drip-coffee.mp3"),
  stir: audioPath("audio/coffee-stir.mp3"),
  cupSetDown: audioPath("audio/cup-set-down.mp3"),
};
