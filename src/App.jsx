import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bean,
  Car,
  Check,
  ChevronDown,
  Clock3,
  CloudRain,
  Coffee,
  DoorOpen,
  Keyboard,
  Laptop,
  MessageCircle,
  Music,
  Pause,
  Play,
  Radio,
  Square,
  TimerReset,
  Utensils,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CUE_SOUNDS } from "./audio/tracks.js";
import { playCue, playDrinkCue, playTimedCue, useAmbientAudio } from "./audio/useAmbientAudio.js";
import SceneBackdrop from "./components/SceneBackdrop.jsx";
import SoundSlider from "./components/SoundSlider.jsx";
import StampCard from "./components/StampCard.jsx";
import YouTubeStation from "./components/YouTubeStation.jsx";
import { COUNTER_LAYERS, DRINKS, DURATIONS, SEATS } from "./data/catalog.js";
import { BREAK_INTERVENTIONS, COPY, PAUSE_INTERVENTIONS, STATUS_MESSAGES } from "./data/copy.js";
import { SCENE_MEDIA, getSceneMediaKey } from "./data/media.js";
import { formatTime } from "./lib/format.js";
import { DEFAULT_MUSIC_LEVEL, JAZZ_MODES, applyMusicSource, readMusicSource } from "./lib/music.js";
import { clearSavedSession, readSavedSession, writeSavedSession } from "./lib/session.js";
import { readStored, writeStored } from "./lib/storage.js";
import { STAMP_MINUTES, readVisits, writeVisits } from "./lib/visits.js";
import { RETIRED_YOUTUBE_IDS, YOUTUBE_STATIONS, parseYouTubeId } from "./lib/youtube.js";

// Break offer: after this much focused time, when at least this much is left, for this long.
const BREAK_AFTER_SECONDS = 25 * 60;
const BREAK_MIN_LEFT_SECONDS = 5 * 60;
const BREAK_LENGTH_SECONDS = 5 * 60;

function App() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("cafe-focus-language");
    if (saved === "en" || saved === "zh") return saved;
    return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  });
  // A focus session saved before a refresh or closed tab; null on a normal visit.
  const [restored] = useState(readSavedSession);
  const [scene, setScene] = useState(restored ? "focus" : "entrance");
  const [drink, setDrink] = useState(restored?.drink ?? null);
  const [seat, setSeat] = useState(restored?.seat ?? null);
  const [task, setTask] = useState(restored?.task ?? "");
  const [duration, setDuration] = useState(
    restored && DURATIONS.includes(restored.minutes) ? restored.minutes : 45,
  );
  const [customDuration, setCustomDuration] = useState(
    restored && !DURATIONS.includes(restored.minutes) ? String(restored.minutes) : "",
  );
  const [ritual, setRitual] = useState(
    restored ? { phone: true, laptop: true } : { phone: false, laptop: false },
  );
  const [remaining, setRemaining] = useState(restored ? restored.remaining : 45 * 60);
  const [isRunning, setIsRunning] = useState(Boolean(restored?.endAt));
  // Wall-clock end time of the running countdown; null while paused or idle.
  const endAtRef = useRef(restored?.endAt ?? null);
  const [restoredNotice, setRestoredNotice] = useState(Boolean(restored));
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);
  const [musicSource, setMusicSource] = useState(readMusicSource);
  const [layerMix, setLayerMix] = useState(
    () => restored?.layerMix ?? applyMusicSource(COUNTER_LAYERS, readMusicSource()),
  );
  // "off" means the visitor muted the café; then entering the door stays silent next time.
  const [ambiencePref, setAmbiencePref] = useState(() =>
    readStored("cafe-focus-ambience", "on", (value) => value === "on" || value === "off"),
  );
  // The seat effect below must not overwrite a restored mix on the first render.
  const skipSeatMixRef = useRef(Boolean(restored?.layerMix));
  const [trafficMode, setTrafficMode] = useState(restored?.trafficMode ?? "light");
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
  const [visits, setVisits] = useState(readVisits);
  // The visit recorded by the session that just ended, shown on the complete scene.
  const [lastVisit, setLastVisit] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [pauseNudgeSeen, setPauseNudgeSeen] = useState(false);
  // On narrow screens the mixer is a drawer under the timer; wide screens always show it.
  const [mixerOpen, setMixerOpen] = useState(false);
  // Break: offered once per session; breakEndAt is the wall-clock end while on a break.
  const [breakOffered, setBreakOffered] = useState(false);
  const [breakEndAt, setBreakEndAt] = useState(null);
  const [breakRemaining, setBreakRemaining] = useState(0);
  const [breakNotice, setBreakNotice] = useState(false);
  const onBreak = breakEndAt !== null;

  const copy = COPY[lang];
  const selectedDrink = DRINKS.find((item) => item.id === drink);
  const selectedSeat = SEATS.find((item) => item.id === seat);
  const selectedDrinkName = selectedDrink?.name[lang];
  const selectedSeatName = selectedSeat?.name[lang];
  const selectedSeatLabel = selectedSeat?.label[lang];
  const pauseIntervention = selectedSeat ? PAUSE_INTERVENTIONS[selectedSeat.id] : null;
  const breakIntervention = selectedSeat ? BREAK_INTERVENTIONS[selectedSeat.id] : null;
  const sceneMediaKey = getSceneMediaKey(scene, selectedSeat?.id);
  const sceneMedia = SCENE_MEDIA[sceneMediaKey] ?? SCENE_MEDIA.entrance;
  const effectiveDuration = useMemo(() => {
    const custom = Number(customDuration);
    if (customDuration && Number.isFinite(custom) && custom >= 5) return Math.min(custom, 180);
    return duration;
  }, [customDuration, duration]);

  const ambientModes = useMemo(
    () => ({ traffic: trafficMode, jazz: jazzMode }),
    [trafficMode, jazzMode],
  );
  const ambient = useAmbientAudio(layerMix, ambientModes);

  useEffect(() => {
    writeStored("cafe-focus-jazz-mode", jazzMode);
  }, [jazzMode]);

  useEffect(() => {
    writeStored("cafe-focus-music-source", musicSource);
  }, [musicSource]);

  useEffect(() => {
    writeStored("cafe-focus-ambience", ambiencePref);
  }, [ambiencePref]);

  const toggleAmbience = () => {
    if (ambient.enabled) {
      ambient.stopAudio();
      setAmbiencePref("off");
    } else {
      ambient.ensureAudio();
      setAmbiencePref("on");
    }
  };

  useEffect(() => {
    writeStored("cafe-focus-youtube-id", youtubeId);
  }, [youtubeId]);

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

  useEffect(() => {
    window.localStorage.setItem("cafe-focus-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = copy.appName;
  }, [copy.appName, lang]);

  useEffect(() => {
    if (scene !== "focus") return undefined;
    document.title = `${formatTime(remaining)} · ${task.trim() || copy.appName}`;
    return () => {
      document.title = copy.appName;
    };
  }, [scene, remaining, task, copy.appName]);

  useEffect(() => {
    if (!selectedSeat) return;
    if (skipSeatMixRef.current) {
      skipSeatMixRef.current = false;
      return;
    }
    // The seat preset puts music in the slot the user last preferred (jazz or YouTube).
    setLayerMix(applyMusicSource(selectedSeat.layers, musicSource));
    // Changing the preferred source later should not reset the whole mix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeat]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    if (endAtRef.current === null) {
      endAtRef.current = Date.now() + remaining * 1000;
    }

    // Derive remaining time from the wall clock so background-tab throttling cannot drift it.
    const tick = () => {
      if (endAtRef.current === null) return;
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(next);
      if (next <= 0) completeSession();
    };

    // Run once right away so a restored session that already ended completes immediately.
    tick();
    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // `remaining` only seeds endAt when the countdown (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isRunning]);

  // Keep the in-progress session on disk. While running, endAt is enough; while paused, remaining is.
  useEffect(() => {
    if (scene !== "focus") return;
    // Running with no end time only happens for one render while the session completes.
    if (isRunning && endAtRef.current === null) return;
    writeSavedSession({
      task,
      seat,
      drink,
      minutes: effectiveDuration,
      endAt: isRunning ? endAtRef.current : null,
      remaining: isRunning ? null : remaining,
      layerMix,
      trafficMode,
    });
    // `remaining` is read only when pausing, and pausing already changes isRunning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isRunning, task, seat, drink, effectiveDuration, layerMix, trafficMode]);

  useEffect(() => {
    if (scene !== "focus" || !isRunning) return undefined;
    const statusTimer = window.setInterval(() => {
      setRestoredNotice(false);
      setBreakNotice(false);
      setMessageIndex((index) => (index + 1) % STATUS_MESSAGES.length);
    }, 26000);

    return () => window.clearInterval(statusTimer);
  }, [scene, isRunning]);

  useEffect(() => {
    if (
      scene !== "focus" ||
      isRunning ||
      onBreak ||
      remaining <= 0 ||
      pauseNudgeSeen ||
      intervention
    ) {
      return undefined;
    }

    const pauseTimer = window.setTimeout(() => {
      setPauseNudgeSeen(true);
      setIntervention("pauseLong");
    }, 90000);

    return () => window.clearTimeout(pauseTimer);
  }, [intervention, isRunning, onBreak, pauseNudgeSeen, remaining, scene]);

  // Offer a break once, after 25 focused minutes, unless the session is nearly over.
  useEffect(() => {
    if (scene !== "focus" || !isRunning || onBreak || breakOffered || intervention) return;
    const elapsed = effectiveDuration * 60 - remaining;
    if (elapsed >= BREAK_AFTER_SECONDS && remaining >= BREAK_MIN_LEFT_SECONDS) {
      setBreakOffered(true);
      setIntervention("breakReady");
    }
  }, [scene, isRunning, onBreak, breakOffered, intervention, effectiveDuration, remaining]);

  const startFocus = () => {
    const seconds = effectiveDuration * 60;
    playCue(CUE_SOUNDS.cupSetDown, 0.4);
    endAtRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    setMessageIndex(0);
    setIsRunning(true);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setBreakOffered(false);
    setBreakEndAt(null);
    setBreakNotice(false);
    setScene("focus");
  };

  const pauseFocus = () => {
    if (endAtRef.current !== null) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setIsRunning(false);
  };

  const resumeFocus = () => {
    setIntervention(null);
    setIsRunning(true);
  };

  const currentRemaining = () =>
    endAtRef.current === null
      ? remaining
      : Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));

  const recordVisit = (completed, elapsedSeconds) => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 1) {
      setLastVisit(null);
      return;
    }
    const entry = {
      at: new Date().toISOString(),
      minutes,
      task: task.trim(),
      seat: selectedSeat?.id ?? null,
      drink: selectedDrink?.id ?? null,
      completed,
      stamp: completed || minutes >= STAMP_MINUTES,
    };
    setVisits((current) => {
      const next = [...current, entry];
      writeVisits(next);
      return next;
    });
    setLastVisit(entry);
  };

  const completeSession = () => {
    endAtRef.current = null;
    clearSavedSession();
    setBreakEndAt(null);
    setRemaining(0);
    setIsRunning(false);
    ambient.stopAudio();
    playCue(CUE_SOUNDS.door, 0.3);
    recordVisit(true, effectiveDuration * 60);
    setSessionResult("completed");
    setIntervention(null);
    setScene("complete");
  };

  const endSession = () => {
    const left = currentRemaining();
    endAtRef.current = null;
    clearSavedSession();
    setBreakEndAt(null);
    setIsRunning(false);
    ambient.stopAudio();
    recordVisit(left === 0, effectiveDuration * 60 - left);
    setSessionResult(left === 0 ? "completed" : "ended");
    setIntervention(null);
    setScene("complete");
  };

  const startBreak = () => {
    setIntervention(null);
    pauseFocus();
    setBreakRemaining(BREAK_LENGTH_SECONDS);
    setBreakEndAt(Date.now() + BREAK_LENGTH_SECONDS * 1000);
  };

  const finishBreak = () => {
    if (breakEndAt === null) return;
    setBreakEndAt(null);
    setBreakNotice(true);
    playCue(CUE_SOUNDS.cupSetDown, 0.3);
    resumeFocus();
  };

  // Break countdown on the wall clock; returns to the table by itself when it runs out.
  useEffect(() => {
    if (breakEndAt === null) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.ceil((breakEndAt - Date.now()) / 1000));
      setBreakRemaining(left);
      if (left <= 0) finishBreak();
    };
    tick();
    const timer = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
    // finishBreak only matters when the break ends, which re-runs this effect anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakEndAt]);

  // Keyboard: Space pauses or resumes; Esc pauses first, then ends on a second press.
  // During a break either key returns to the table.
  useEffect(() => {
    if (scene !== "focus") return undefined;
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName))
      ) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (onBreak) finishBreak();
        else if (isRunning) pauseFocus();
        else resumeFocus();
      } else if (event.key === "Escape") {
        if (onBreak) finishBreak();
        else if (isRunning) pauseFocus();
        else endSession();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [scene, isRunning, onBreak, pauseFocus, resumeFocus, endSession, finishBreak]);

  const resetCafe = () => {
    endAtRef.current = null;
    clearSavedSession();
    ambient.stopAudio();
    setLastVisit(null);
    setRestoredNotice(false);
    setLayerMix(applyMusicSource(COUNTER_LAYERS, musicSource));
    setScene("entrance");
    setDrink(null);
    setSeat(null);
    setTask("");
    setDuration(45);
    setCustomDuration("");
    setRitual({ phone: false, laptop: false });
    setRemaining(45 * 60);
    setIsRunning(false);
    setSessionResult(null);
    setIntervention(null);
    setPauseNudgeSeen(false);
    setBreakOffered(false);
    setBreakEndAt(null);
    setBreakNotice(false);
    setTrafficMode("light");
  };

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

  const renderScene = () => {
    if (scene === "entrance") {
      return (
        <section className="scene entrance-scene" aria-labelledby="entrance-title">
          <div className="hero-copy">
            <p className="eyebrow">
              {visits.length > 0 ? copy.visitEyebrow(visits.length + 1) : copy.entranceEyebrow}
            </p>
            <h1 id="entrance-title">{copy.entranceTitle}</h1>
            <p className="scene-lede">{copy.entranceLead}</p>
            <button
              className="primary-action"
              type="button"
              onClick={() => {
                // Inside the click so autoplay rules allow it; the room is audible from the door.
                if (ambiencePref === "on") ambient.ensureAudio();
                playTimedCue(CUE_SOUNDS.steps, 0.18, 3600);
                window.setTimeout(() => playCue(CUE_SOUNDS.woodenDoor, 0.36), 450);
                window.setTimeout(() => playCue(CUE_SOUNDS.door, 0.44), 800);
                setScene("order");
              }}
            >
              <DoorOpen aria-hidden="true" />
              {copy.enterCafe}
            </button>
            {visits.length > 0 && <StampCard visits={visits} copy={copy} />}
          </div>
          <div className="presence-strip" aria-label={copy.presenceAria}>
            {copy.presence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      );
    }

    if (scene === "order") {
      return (
        <section className="scene order-scene" aria-labelledby="order-title">
          <div className="dialogue-panel">
            <p className="eyebrow">{copy.orderEyebrow}</p>
            <h2 id="order-title">{copy.orderTitle}</h2>
            <div className="barista-row">
              <div className="avatar" aria-hidden="true">
                <Coffee />
              </div>
              <div>
                <p className="speaker">{copy.barista}</p>
                <p className="quote">{copy.baristaGreeting}</p>
              </div>
            </div>
            <div className="choice-grid drinks">
              {DRINKS.map((item) => (
                <button
                  className={`choice-card ${drink === item.id ? "selected" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDrink(item.id);
                    playDrinkCue(item.id);
                  }}
                >
                  <Coffee aria-hidden="true" />
                  <span>{item.name[lang]}</span>
                  <small>{item.note[lang]}</small>
                </button>
              ))}
            </div>
            {selectedDrink && (
              <div className="next-step" role="status">
                <MessageCircle aria-hidden="true" />
                <span>{copy.baristaResponse}</span>
                <button className="secondary-action" type="button" onClick={() => setScene("seat")}>
                  {copy.chooseSeat}
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (scene === "seat") {
      return (
        <section className="scene seat-scene" aria-labelledby="seat-title">
          <div className="wide-panel">
            <p className="eyebrow">{copy.seatEyebrow}</p>
            <h2 id="seat-title">{copy.seatTitle}</h2>
            <div className="choice-grid seats">
              {SEATS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`choice-card seat-card ${seat === item.id ? "selected" : ""}`}
                    key={item.id}
                    type="button"
                    onClick={() => setSeat(item.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.name[lang]}</span>
                    <small>{item.label[lang]}</small>
                    <p>{item.description[lang]}</p>
                  </button>
                );
              })}
            </div>
            <div className="scene-actions">
              <button className="ghost-action" type="button" onClick={() => setScene("order")}>
                {copy.back}
              </button>
              <button
                className="primary-action compact"
                type="button"
                disabled={!seat}
                onClick={() => setScene("setup")}
              >
                {copy.sitDown}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (scene === "setup") {
      return (
        <section className="scene setup-scene" aria-labelledby="setup-title">
          <div className="setup-panel">
            <p className="eyebrow">{copy.setupEyebrow(selectedSeatName)}</p>
            <h2 id="setup-title">{copy.setupTitle}</h2>
            <label className="task-field">
              <span>{copy.taskLabel}</span>
              <input
                type="text"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder={copy.taskPlaceholder}
              />
            </label>
            <div className="duration-group" aria-label={copy.durationAria}>
              {DURATIONS.map((minutes) => (
                <button
                  className={duration === minutes && !customDuration ? "duration selected" : "duration"}
                  key={minutes}
                  type="button"
                  onClick={() => {
                    setDuration(minutes);
                    setCustomDuration("");
                  }}
                >
                  {minutes} {copy.minuteShort}
                </button>
              ))}
              <label className="custom-duration">
                <Clock3 aria-hidden="true" />
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customDuration}
                  onChange={(event) => setCustomDuration(event.target.value)}
                  placeholder={copy.customDuration}
                />
              </label>
            </div>
            <div className="ritual-list">
              <button
                className={`ritual-item ${ritual.phone ? "done" : ""}`}
                type="button"
                onClick={() => setRitual((current) => ({ ...current, phone: !current.phone }))}
              >
                <Check aria-hidden="true" />
                {copy.ritualPhone}
              </button>
              <button
                className={`ritual-item ${ritual.laptop ? "done" : ""}`}
                type="button"
                onClick={() => setRitual((current) => ({ ...current, laptop: !current.laptop }))}
              >
                <Laptop aria-hidden="true" />
                {copy.ritualLaptop}
              </button>
            </div>
            <div className="session-summary" aria-live="polite">
              <span>{selectedDrinkName}</span>
              <span>{selectedSeatName}</span>
              <span>
                {effectiveDuration} {copy.minutes}
              </span>
            </div>
            <div className="scene-actions">
              <button className="ghost-action" type="button" onClick={() => setScene("seat")}>
                {copy.back}
              </button>
              <button
                className="primary-action compact"
                type="button"
                disabled={!task.trim() || !ritual.phone || !ritual.laptop}
                onClick={startFocus}
              >
                <Play aria-hidden="true" />
                {copy.startWorking}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (scene === "focus") {
      return (
        <section className="scene focus-scene" aria-labelledby="focus-title">
          <div className="focus-shell">
            <div className="focus-main">
              <p className="eyebrow">{onBreak ? copy.breakEyebrow : selectedSeatName}</p>
              <h2 id="focus-title">{onBreak ? copy.breakTitle : task}</h2>
              <div
                className={`timer-display${onBreak ? " break" : ""}`}
                aria-label={copy.remainingAria(formatTime(onBreak ? breakRemaining : remaining))}
              >
                {formatTime(onBreak ? breakRemaining : remaining)}
              </div>
              <p className="status-message">
                {onBreak
                  ? copy.breakHint(task)
                  : restoredNotice
                    ? copy.restoredLine
                    : breakNotice
                      ? copy.breakOverLine
                      : STATUS_MESSAGES[messageIndex][lang]}
              </p>
              {intervention === "breakReady" && breakIntervention && !onBreak && (
                <div className="intervention-card" role="status" aria-label={copy.breakOfferAria}>
                  <p className="speaker">{breakIntervention.speaker[lang]}</p>
                  <p className="quote">{breakIntervention.line[lang]}</p>
                  <div className="thought-line">
                    <span>{copy.innerThought}</span>
                    <p>
                      {breakIntervention.thought[lang](
                        task,
                        Math.floor((effectiveDuration * 60 - remaining) / 60),
                      )}
                    </p>
                  </div>
                  <div className="card-actions">
                    <button className="secondary-action" type="button" onClick={startBreak}>
                      {copy.breakTake}
                    </button>
                    <button
                      className="ghost-action"
                      type="button"
                      onClick={() => setIntervention(null)}
                    >
                      {copy.breakSkip}
                    </button>
                  </div>
                </div>
              )}
              {intervention === "pauseLong" && pauseIntervention && (
                <div className="intervention-card" role="status">
                  <p className="speaker">{pauseIntervention.speaker[lang]}</p>
                  <p className="quote">{pauseIntervention.line[lang]}</p>
                  <div className="thought-line">
                    <span>{copy.innerThought}</span>
                    <p>{pauseIntervention.thought[lang](task)}</p>
                  </div>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={resumeFocus}
                  >
                    {copy.returnToTask}
                  </button>
                </div>
              )}
              <div className="focus-actions">
                {onBreak ? (
                  <button className="icon-action" type="button" onClick={finishBreak}>
                    <Play aria-hidden="true" />
                    {copy.breakReturn}
                  </button>
                ) : isRunning ? (
                  <button className="icon-action" type="button" onClick={pauseFocus}>
                    <Pause aria-hidden="true" />
                    {copy.pause}
                  </button>
                ) : (
                  <button
                    className="icon-action"
                    type="button"
                    onClick={resumeFocus}
                  >
                    <Play aria-hidden="true" />
                    {copy.resume}
                  </button>
                )}
                <button className="icon-action end" type="button" onClick={endSession}>
                  <Square aria-hidden="true" />
                  {copy.end}
                </button>
              </div>
              <p className="keyboard-hint">{copy.keyboardHint}</p>
            </div>

            <aside
              className={`focus-side ${mixerOpen ? "" : "collapsed"}`}
              aria-label={copy.detailsAria}
            >
              <div className="detail-row">
                <span>{copy.drink}</span>
                <strong>{selectedDrinkName}</strong>
              </div>
              <div className="detail-row">
                <span>{copy.roomTone}</span>
                <strong>{selectedSeatLabel}</strong>
              </div>
              <button
                className="mixer-toggle"
                type="button"
                aria-expanded={mixerOpen}
                aria-controls="mixer-body"
                onClick={() => setMixerOpen((open) => !open)}
              >
                <span>{mixerOpen ? copy.mixerHide : copy.mixerShow}</span>
                <ChevronDown aria-hidden="true" />
              </button>
              <div className="mixer-body" id="mixer-body">
              <button
                className={`sound-toggle ${ambient.enabled ? "enabled" : ""}`}
                type="button"
                onClick={toggleAmbience}
              >
                {ambient.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
                {ambient.enabled ? copy.ambienceOn : copy.startAmbience}
              </button>
              <div className="mixer">
                <SoundSlider
                  icon={<Coffee aria-hidden="true" />}
                  label={copy.soundLabels.cafe}
                  value={layerMix.cafe}
                  onChange={(value) => updateLayer("cafe", value)}
                />
                <SoundSlider
                  icon={<CloudRain aria-hidden="true" />}
                  label={copy.soundLabels.rain}
                  value={layerMix.rain}
                  onChange={(value) => updateLayer("rain", value)}
                />
                <SoundSlider
                  icon={<Car aria-hidden="true" />}
                  label={copy.soundLabels.traffic}
                  value={layerMix.traffic}
                  onChange={(value) => updateLayer("traffic", value)}
                />
                <div className="traffic-mode" aria-label={copy.trafficModeLabel}>
                  <button
                    className={trafficMode === "light" ? "active" : ""}
                    type="button"
                    aria-pressed={trafficMode === "light"}
                    onClick={() => setTrafficMode("light")}
                  >
                    {copy.trafficModes.light}
                  </button>
                  <button
                    className={trafficMode === "heavy" ? "active" : ""}
                    type="button"
                    aria-pressed={trafficMode === "heavy"}
                    onClick={() => setTrafficMode("heavy")}
                  >
                    {copy.trafficModes.heavy}
                  </button>
                </div>
                <SoundSlider
                  icon={<Keyboard aria-hidden="true" />}
                  label={copy.soundLabels.keys}
                  value={layerMix.keys}
                  onChange={(value) => updateLayer("keys", value)}
                />
                <SoundSlider
                  icon={<Utensils aria-hidden="true" />}
                  label={copy.soundLabels.cups}
                  value={layerMix.cups}
                  onChange={(value) => updateLayer("cups", value)}
                />
                <SoundSlider
                  icon={<Bean aria-hidden="true" />}
                  label={copy.soundLabels.backCounter}
                  value={layerMix.backCounter}
                  onChange={(value) => updateLayer("backCounter", value)}
                />
                <SoundSlider
                  icon={<Music aria-hidden="true" />}
                  label={copy.soundLabels.jazz}
                  value={layerMix.jazz ?? 0}
                  onChange={(value) => updateLayer("jazz", value)}
                />
                <div className="mode-buttons jazz-modes" aria-label={copy.jazzModeLabel}>
                  {JAZZ_MODES.map((mode) => (
                    <button
                      className={jazzMode === mode ? "active" : ""}
                      key={mode}
                      type="button"
                      aria-pressed={jazzMode === mode}
                      onClick={() => chooseJazzMode(mode)}
                    >
                      {copy.jazzModes[mode]}
                    </button>
                  ))}
                </div>
                <SoundSlider
                  icon={<Radio aria-hidden="true" />}
                  label={copy.youtubeLabel}
                  value={layerMix.youtube ?? 0}
                  onChange={(value) => updateLayer("youtube", value)}
                />
                {(layerMix.youtube ?? 0) > 0 && (
                  <div className="youtube-station">
                    <div className="station-list" aria-label={copy.youtubeStationsAria}>
                      {YOUTUBE_STATIONS.map((station) => (
                        <button
                          className={youtubeId === station.id ? "active" : ""}
                          key={station.id}
                          type="button"
                          aria-pressed={youtubeId === station.id}
                          onClick={() => setYoutubeId(station.id)}
                        >
                          {station.name[lang]}
                        </button>
                      ))}
                      {!YOUTUBE_STATIONS.some((station) => station.id === youtubeId) && (
                        <button className="active" type="button" aria-pressed="true">
                          {copy.youtubeCustom}
                        </button>
                      )}
                    </div>
                    <form className="station-form" onSubmit={submitYoutubeLink}>
                      <input
                        type="url"
                        inputMode="url"
                        value={youtubeInput}
                        onChange={(event) => {
                          setYoutubeInput(event.target.value);
                          setYoutubeError(false);
                        }}
                        placeholder={copy.youtubePaste}
                        aria-label={copy.youtubePaste}
                        aria-invalid={youtubeError}
                      />
                      <button type="submit" disabled={!youtubeInput.trim()}>
                        {copy.youtubeUse}
                      </button>
                    </form>
                    {youtubeError && (
                      <p className="station-error" role="alert">
                        {copy.youtubeInvalid}
                      </p>
                    )}
                    <YouTubeStation
                      videoId={youtubeId}
                      volume={layerMix.youtube ?? 0}
                      playing={ambient.enabled}
                      onUnavailable={setYoutubeUnavailableId}
                    />
                    {youtubeUnavailableId === youtubeId ? (
                      <p className="station-error" role="alert">
                        {copy.youtubeUnavailable}
                      </p>
                    ) : (
                      <p className="station-note">
                        {ambient.enabled ? copy.youtubeNote : copy.youtubeIdle}
                      </p>
                    )}
                  </div>
                )}
              </div>
              </div>
            </aside>
          </div>
        </section>
      );
    }

    return (
      <section className="scene complete-scene" aria-labelledby="complete-title">
        <div className="complete-panel">
          <p className="eyebrow">{sessionResult === "completed" ? copy.sessionComplete : copy.sessionEnded}</p>
          <h2 id="complete-title">{copy.stayedWith(task)}</h2>
          <p>
            {sessionResult === "completed"
              ? copy.completedLine(effectiveDuration)
              : copy.endedLine}
          </p>
          {lastVisit && (
            <StampCard
              visits={visits}
              copy={copy}
              highlightLast={lastVisit.stamp}
              note={lastVisit.stamp ? copy.stampEarned : copy.stampMissed}
            />
          )}
          <div className="scene-actions">
            <button className="primary-action compact" type="button" onClick={resetCafe}>
              <TimerReset aria-hidden="true" />
              {copy.visitAgain}
            </button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className={`app scene-${scene}`}>
      <SceneBackdrop media={sceneMedia} />
      <div className="background-shade" aria-hidden="true" />
      <header className="app-header" aria-label={copy.appName}>
        <div className="brand">
          <Coffee aria-hidden="true" />
          <span>{copy.appName}</span>
        </div>
        <div className="header-controls">
          <div className="language-switch" aria-label={copy.languageLabel}>
            <button
              className={lang === "en" ? "active" : ""}
              type="button"
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={lang === "zh" ? "active" : ""}
              type="button"
              onClick={() => setLang("zh")}
            >
              中文
            </button>
          </div>
          {scene !== "entrance" && (
            <button
              className={`ambience-switch ${ambient.enabled ? "on" : ""}`}
              type="button"
              aria-pressed={ambient.enabled}
              aria-label={ambient.enabled ? copy.muteAmbience : copy.unmuteAmbience}
              title={ambient.enabled ? copy.muteAmbience : copy.unmuteAmbience}
              onClick={toggleAmbience}
            >
              {ambient.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            </button>
          )}
          <div
            className="progress-dots"
            role="img"
            aria-label={`${copy.currentScene}: ${copy.sceneNames[scene] ?? scene}`}
          >
            {["entrance", "order", "seat", "setup", "focus"].map((item) => (
              <span
                className={item === scene ? "active" : ""}
                key={item}
                title={copy.sceneNames[item]}
              />
            ))}
          </div>
        </div>
      </header>
      {renderScene()}
    </main>
  );
}

export default App;
