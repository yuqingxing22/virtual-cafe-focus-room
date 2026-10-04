import { useEffect, useMemo, useRef, useState } from "react";
import { useAmbientAudio } from "../audio/useAmbientAudio.js";
import { COUNTER_LAYERS } from "../data/catalog.js";
import {
  DEFAULT_MUSIC_LEVEL,
  JAZZ_ENABLED,
  JAZZ_MODES,
  applyMusicSource,
  readMusicSource,
} from "../lib/music.js";
import { readStored, writeStored } from "../lib/storage.js";
import { applyTimeSlot, readTimeSlot } from "../lib/timeSlot.js";
import { RETIRED_YOUTUBE_IDS, YOUTUBE_STATIONS, parseYouTubeId } from "../lib/youtube.js";

// A seat (or counter) preset as it should sound in a time slot, with music in the preferred slot.
const presetFor = (layers, slot, source) => applyMusicSource(applyTimeSlot(layers, slot), source);

// Everything you can hear: the layer mix, time slot, music source, the YouTube station and
// the ambience on/off switch. `restored` is a saved session (or null); `selectedSeat` sets the mix.
export function useSoundscape(restored, selectedSeat) {
  const [musicSource, setMusicSource] = useState(readMusicSource);
  const [layerMix, setLayerMix] = useState(
    () =>
      restored?.layerMix ??
      presetFor(COUNTER_LAYERS, restored?.timeSlot ?? readTimeSlot(), readMusicSource()),
  );
  // "off" means the visitor muted the café; then entering the door stays silent next time.
  const [ambiencePref, setAmbiencePref] = useState(() =>
    readStored("cafe-focus-ambience", "on", (value) => value === "on" || value === "off"),
  );
  // The seat effect below must not overwrite a restored mix on the first render.
  const skipSeatMixRef = useRef(Boolean(restored?.layerMix));
  // Morning, daytime or night café; chosen by the visitor and remembered.
  const [timeSlot, setTimeSlot] = useState(() => restored?.timeSlot ?? readTimeSlot());
  const [jazzMode, setJazzMode] = useState(() =>
    readStored("cafe-focus-jazz-mode", "cafe", (value) => JAZZ_MODES.includes(value)),
  );
  const [youtubeId, setYoutubeId] = useState(() => {
    const stored = readStored("cafe-focus-youtube-id", YOUTUBE_STATIONS[0].id, (value) =>
      /^[\w-]{11}$/.test(value),
    );
    return RETIRED_YOUTUBE_IDS[stored] ?? stored;
  });
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeError, setYoutubeError] = useState(false);
  const [youtubeUnavailableId, setYoutubeUnavailableId] = useState(null);

  const ambientModes = useMemo(
    () => ({ time: timeSlot, jazz: jazzMode }),
    [timeSlot, jazzMode],
  );
  // While jazz is switched off, any jazz level left in a preset, a saved session or a stored
  // preference must stay silent, so the layer is zeroed on its way to the audio engine.
  const audioLayers = useMemo(
    () => (JAZZ_ENABLED ? layerMix : { ...layerMix, jazz: 0 }),
    [layerMix],
  );
  const ambient = useAmbientAudio(audioLayers, ambientModes);

  useEffect(() => {
    writeStored("cafe-focus-jazz-mode", jazzMode);
  }, [jazzMode]);

  useEffect(() => {
    writeStored("cafe-focus-music-source", musicSource);
  }, [musicSource]);

  useEffect(() => {
    writeStored("cafe-focus-ambience", ambiencePref);
  }, [ambiencePref]);

  useEffect(() => {
    writeStored("cafe-focus-time-slot", timeSlot);
  }, [timeSlot]);

  useEffect(() => {
    writeStored("cafe-focus-youtube-id", youtubeId);
  }, [youtubeId]);

  useEffect(() => {
    if (!selectedSeat) return;
    if (skipSeatMixRef.current) {
      skipSeatMixRef.current = false;
      return;
    }
    // The seat preset puts music in the slot the user last preferred (jazz or YouTube).
    setLayerMix(presetFor(selectedSeat.layers, timeSlot, musicSource));
    // Changing the preferred source later should not reset the whole mix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeat, timeSlot]);

  const toggleAmbience = () => {
    if (ambient.enabled) {
      ambient.stopAudio();
      setAmbiencePref("off");
    } else {
      ambient.ensureAudio();
      setAmbiencePref("on");
    }
  };

  // Music has one slot: raising jazz silences YouTube and the other way round.
  const updateLayer = (key, value) => {
    const level = Number(value);
    setLayerMix((current) => {
      const next = { ...current, [key]: level };
      if (key === "youtube" && level > 0) next.jazz = 0;
      if (key === "jazz" && level > 0) next.youtube = 0;
      return next;
    });
    if (key === "youtube" && level > 0) setMusicSource("youtube");
    if (key === "jazz" && level > 0) setMusicSource("jazz");
  };

  const chooseJazzMode = (mode) => {
    setJazzMode(mode);
    if ((layerMix.jazz ?? 0) <= 0) updateLayer("jazz", DEFAULT_MUSIC_LEVEL);
  };

  const submitYoutubeLink = (event) => {
    event.preventDefault();
    const id = parseYouTubeId(youtubeInput);
    if (!id) {
      setYoutubeError(true);
      return;
    }
    setYoutubeError(false);
    setYoutubeInput("");
    setYoutubeId(id);
  };

  const changeYoutubeInput = (value) => {
    setYoutubeInput(value);
    setYoutubeError(false);
  };

  // Back at the door: the counter preset for the current time slot.
  const resetToCounter = () => setLayerMix(presetFor(COUNTER_LAYERS, timeSlot, musicSource));

  return {
    layerMix,
    updateLayer,
    resetToCounter,
    timeSlot,
    setTimeSlot,
    jazzMode,
    chooseJazzMode,
    enabled: ambient.enabled,
    ensureAudio: ambient.ensureAudio,
    stopAudio: ambient.stopAudio,
    ambiencePref,
    toggleAmbience,
    youtube: {
      id: youtubeId,
      setId: setYoutubeId,
      input: youtubeInput,
      changeInput: changeYoutubeInput,
      error: youtubeError,
      unavailableId: youtubeUnavailableId,
      setUnavailableId: setYoutubeUnavailableId,
      submitLink: submitYoutubeLink,
    },
  };
}
