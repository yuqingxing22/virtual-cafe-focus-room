import { useEffect, useRef, useState } from "react";
import { AMBIENT_TRACKS, CUE_SOUNDS, getJazzPlaylist } from "./tracks.js";

const createAudioElement = (src, loop = false) => {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "none";
  audio.volume = 0;
  return audio;
};

const LONG_TRACK_SECONDS = 300;

// Long field recordings start from a random point so sessions do not all open on the same sound.
const randomizeStart = (audio) => {
  const seek = () => {
    if (!Number.isFinite(audio.duration) || audio.duration < LONG_TRACK_SECONDS) return;
    audio.currentTime = Math.random() * (audio.duration - 60);
  };
  if (audio.readyState >= 1) {
    seek();
    return;
  }
  audio.addEventListener("loadedmetadata", seek, { once: true });
};

// Sets volumes, and only loads/plays a track once its volume is above zero.
const syncAmbientTracks = (setup, layers, ambientModes) => {
  AMBIENT_TRACKS.forEach(({ key, layerKey, modeGroup, modes, maxVolume }) => {
    const audio = setup.tracks[key];
    if (!audio) return;
    const level = layers[layerKey] ?? 0;
    const modeMultiplier = !modes || modes.includes(ambientModes[modeGroup]) ? 1 : 0;
    const volume = Math.max(0, Math.min(1, level * maxVolume * modeMultiplier));
    audio.volume = volume;
    if (!setup.enabled) return;
    if (volume <= 0) {
      if (!audio.paused) audio.pause();
      return;
    }
    if (!setup.started.has(key)) {
      setup.started.add(key);
      audio.load();
      randomizeStart(audio);
    }
    if (audio.paused) {
      void audio.play().catch(() => {});
    }
  });
};

const applyJazzVolume = (jazz, layers) => {
  if (!jazz?.audio) return;
  const volume = Math.max(0, Math.min(1, (layers.jazz ?? 0) * 0.32));
  jazz.audio.volume = volume;
  if (volume <= 0 && !jazz.audio.paused) jazz.audio.pause();
};

const setJazzPlaylist = (setup, mode) => {
  const playlist = getJazzPlaylist(mode);
  const jazz = setup.jazz;

  if (jazz.mode === mode && playlist.includes(jazz.audio.src.replace(window.location.origin, ""))) {
    return;
  }

  jazz.mode = mode;
  jazz.index = 0;
  jazz.audio.pause();
  jazz.audio.src = playlist[0];
  jazz.audio.load();
};

const playJazzIfNeeded = (setup, layers) => {
  if (!setup?.jazz?.audio || (layers.jazz ?? 0) <= 0) return;
  void setup.jazz.audio.play().catch(() => {});
};

export const playCue = (src, volume = 0.45) => {
  const audio = createAudioElement(src);
  audio.preload = "auto";
  audio.volume = volume;
  void audio.play().catch(() => {});
  return audio;
};

export const playTimedCue = (src, volume = 0.35, durationMs = 3500) => {
  const audio = playCue(src, volume);
  window.setTimeout(() => {
    audio.pause();
    audio.src = "";
  }, durationMs);
};

export const playDrinkCue = (drinkId) => {
  if (drinkId === "americano") {
    playCue(CUE_SOUNDS.drip, 0.34);
    return;
  }
  if (drinkId === "matcha") {
    playCue(CUE_SOUNDS.stir, 0.32);
    return;
  }
  if (drinkId !== "water") {
    playCue(CUE_SOUNDS.espresso, 0.28);
  }
};

export const useAmbientAudio = (layers, ambientModes) => {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const tracks = AMBIENT_TRACKS.reduce((items, track) => {
        items[track.key] = createAudioElement(track.src, true);
        return items;
      }, {});
      const jazzAudio = createAudioElement(getJazzPlaylist(ambientModes.jazz)[0], false);
      const created = {
        enabled: false,
        tracks,
        started: new Set(),
        jazz: {
          audio: jazzAudio,
          index: 0,
          mode: ambientModes.jazz,
        },
      };

      const advanceJazz = () => {
        const playlist = getJazzPlaylist(created.jazz.mode);
        created.jazz.index = (created.jazz.index + 1) % playlist.length;
        created.jazz.audio.src = playlist[created.jazz.index];
        created.jazz.audio.load();
        if (created.enabled && created.jazz.audio.volume > 0) {
          void created.jazz.audio.play().catch(() => {});
        }
      };

      jazzAudio.onended = advanceJazz;

      audioRef.current = created;
    }

    const setup = audioRef.current;
    setup.enabled = true;
    setJazzPlaylist(setup, ambientModes.jazz);
    applyJazzVolume(setup.jazz, layers);
    syncAmbientTracks(setup, layers, ambientModes);
    if ((layers.jazz ?? 0) > 0) {
      setup.jazz.audio.load();
      void setup.jazz.audio.play().catch(() => {});
    }
    setEnabled(true);
  };

  const stopAudio = () => {
    const setup = audioRef.current;
    if (!setup) return;
    setup.enabled = false;
    Object.values(setup.tracks).forEach((audio) => {
      audio.pause();
    });
    setup.jazz.audio.pause();
    setEnabled(false);
  };

  useEffect(() => {
    const setup = audioRef.current;
    if (!setup) return;
    setJazzPlaylist(setup, ambientModes.jazz);
    applyJazzVolume(setup.jazz, layers);
    syncAmbientTracks(setup, layers, ambientModes);
    if (setup.enabled) {
      playJazzIfNeeded(setup, layers);
    }
  }, [layers, ambientModes]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        Object.values(audioRef.current.tracks).forEach((audio) => {
          audio.pause();
          audio.src = "";
        });
        audioRef.current.jazz.audio.pause();
        audioRef.current.jazz.audio.src = "";
      }
    };
  }, []);

  return { enabled, ensureAudio, stopAudio };
};
