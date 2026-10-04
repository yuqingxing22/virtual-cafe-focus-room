import { useCallback, useEffect, useRef, useState } from "react";

const PRELOAD_LEAD_SECONDS = 30;
const clamp01 = (value) => Math.max(0, Math.min(1, value));

// One audio element that plays a station's tracks in order and loops back to the first.
export function useStationPlayer(stations, initialVolume = 0.6) {
  const audioRef = useRef(null);
  const positionRef = useRef(null);
  const playTrackRef = useRef(null);
  const stationsRef = useRef(stations);
  const preloadRef = useRef(null);
  stationsRef.current = stations;
  const [stationIndex, setStationIndex] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(initialVolume);

  const playTrack = useCallback(
    (nextStation, nextTrack) => {
      const audio = audioRef.current;
      const tracks = stations[nextStation]?.tracks;
      if (!audio || !tracks?.length) return;
      const index = ((nextTrack % tracks.length) + tracks.length) % tracks.length;
      positionRef.current = { station: nextStation, track: index };
      setStationIndex(nextStation);
      setTrackIndex(index);
      setFailed(false);
      setTime({ current: 0, duration: 0 });
      audio.src = tracks[index].src;
      void audio.play().catch(() => {});
    },
    [stations],
  );
  playTrackRef.current = playTrack;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = initialVolume;
    audioRef.current = audio;

    const onTime = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setTime({ current: audio.currentTime, duration });
      // Fetch the next track into the browser cache shortly before this one ends, so the
      // change-over doesn't stall on a slow connection.
      const position = positionRef.current;
      if (!position || duration <= 0 || duration - audio.currentTime > PRELOAD_LEAD_SECONDS) return;
      const tracks = stationsRef.current[position.station]?.tracks ?? [];
      const nextSrc = tracks[(position.track + 1) % tracks.length]?.src;
      if (!nextSrc || tracks.length < 2 || preloadRef.current?.src === nextSrc) return;
      const warm = new Audio();
      warm.preload = "auto";
      warm.src = nextSrc;
      warm.load();
      preloadRef.current = { src: nextSrc, audio: warm };
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const position = positionRef.current;
      if (position) playTrackRef.current(position.station, position.track + 1);
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      preloadRef.current = null;
    };
    // The element lives for the life of the player; the starting volume is only read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !positionRef.current) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const skip = useCallback((direction) => {
    const audio = audioRef.current;
    const position = positionRef.current;
    if (!audio || !position) return;
    // Like the real thing: "previous" restarts the track unless it has only just begun.
    if (direction < 0 && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    playTrackRef.current(position.station, position.track + direction);
  }, []);

  const setVolume = useCallback((next) => {
    setVolumeState((previous) => {
      const value = clamp01(typeof next === "function" ? next(previous) : next);
      if (audioRef.current) audioRef.current.volume = value;
      return value;
    });
  }, []);

  return { stationIndex, trackIndex, playing, failed, time, volume, playTrack, toggle, skip, setVolume };
}
