import { readStored } from "./storage.js";

export const JAZZ_MODES = ["cafe", "swing", "club"];

// Jazz and the YouTube station share one music slot: raising one silences the other.
export const DEFAULT_MUSIC_LEVEL = 0.3;

export const readMusicSource = () => {
  // Earlier builds stored "youtube" as a jazz mode; carry that preference over.
  const legacy = readStored("cafe-focus-jazz-mode", "", () => true);
  return readStored(
    "cafe-focus-music-source",
    legacy === "youtube" ? "youtube" : "jazz",
    (value) => value === "jazz" || value === "youtube",
  );
};

export const applyMusicSource = (layers, source) =>
  source === "youtube"
    ? { ...layers, youtube: layers.jazz ?? 0, jazz: 0 }
    : { ...layers, youtube: 0 };
