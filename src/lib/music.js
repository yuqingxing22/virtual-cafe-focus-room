import { readStored } from "./storage.js";

// Temporary switch (2026-10-04): the jazz playlists are being reworked, so the jazz layer is
// silenced and its controls are replaced by a notice. The playlists, audio files and stored
// preferences are all kept; set this back to true to restore the feature as it was.
export const JAZZ_ENABLED = false;

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
