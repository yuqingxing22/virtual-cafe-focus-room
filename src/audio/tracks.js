import { audioPath } from "../lib/paths.js";

export const AMBIENT_TRACKS = [
  { key: "cafe", layerKey: "cafe", src: audioPath("audio/cafe-ambience.mp3"), maxVolume: 0.55 },
  { key: "rain", layerKey: "rain", src: audioPath("audio/rain.mp3"), maxVolume: 0.48 },
  { key: "keys", layerKey: "keys", src: audioPath("audio/typing.mp3"), maxVolume: 0.36 },
  { key: "cups", layerKey: "cups", src: audioPath("audio/coffee-stir.mp3"), maxVolume: 0.42 },
  {
    key: "trafficLight",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "light",
    src: audioPath("audio/light-traffic.m4a"),
    maxVolume: 0.38,
  },
  {
    key: "trafficHeavy",
    layerKey: "traffic",
    modeGroup: "traffic",
    mode: "heavy",
    src: audioPath("audio/heavy-traffic.m4a"),
    maxVolume: 0.34,
  },
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
