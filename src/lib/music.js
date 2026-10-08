import { readStored } from "./storage.js";

// The old built-in jazz engine (three playlists in useAmbientAudio, three mode buttons in the
// mixer). Off since 2026-10-04 and replaced on 2026-10-08 by the six stations that MusicPlayer
// plays through useStationPlayer; `layerMix.jazz` is now that player's volume. The old
// playlists, their audio files and stored modes are kept; setting this back to true would
// play both engines at once, so leave it off unless the station player is removed.
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
