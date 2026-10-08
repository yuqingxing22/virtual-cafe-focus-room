import { useEffect, useState } from "react";
import { Moon, Music, Pause, Play, SlidersHorizontal, Square, Sun, Sunrise, Volume2, VolumeX, X } from "lucide-react";
import InterventionCard from "../components/InterventionCard.jsx";
import Mixer from "../components/Mixer.jsx";
import MusicPlayer from "../components/MusicPlayer.jsx";
import { BREAK_INTERVENTIONS, PAUSE_INTERVENTIONS, STATUS_MESSAGES } from "../data/copy.js";
import { formatTime } from "../lib/format.js";
import { TIME_SLOTS } from "../lib/timeSlot.js";

// Without any input for this long the header and rail fade and the timer card dims.
const QUIET_AFTER_MS = 20000;
// The end button stays armed for this long after the first press.
const END_CONFIRM_MS = 4000;
const SLOT_ICONS = { morning: Sunrise, day: Sun, night: Moon };

// At the table. The room is the page: a timer card bottom-left, a control rail on the
// right and the mixer as an overlay the rail opens. On phones the card sits at the top,
// pause and end live in a bottom bar, the rail is a strip above it and the mixer is a
// bottom sheet. `session` comes from useFocusSession, `sound` from useSoundscape.
function FocusScene({ copy, lang, plan, seat, drinkName, session, sound, mixerOpen, onToggleMixer }) {
  const { task } = plan;
  const { onBreak, remaining, breakRemaining, isRunning, intervention } = session;
  const pauseIntervention = seat ? PAUSE_INTERVENTIONS[seat.id] : null;
  const breakIntervention = seat ? BREAK_INTERVENTIONS[seat.id] : null;

  // The music player card: open by hand, or kept open while YouTube plays (its video has
  // to stay on screen), in which case closing it pauses the station. Jazz keeps playing
  // behind a collapsed card.
  const [playerOpen, setPlayerOpen] = useState(false);
  const youtubePlaying = sound.enabled && (sound.layerMix.youtube ?? 0) > 0;
  const musicPlaying = youtubePlaying || (sound.enabled && (sound.layerMix.jazz ?? 0) > 0);
  const playerExpanded = playerOpen || youtubePlaying;
  const togglePlayer = () => {
    if (playerExpanded) {
      if (youtubePlaying) sound.updateLayer("youtube", 0);
      setPlayerOpen(false);
    } else {
      setPlayerOpen(true);
    }
  };

  // Ending takes two presses: the first arms the button for a few seconds.
  const [endArmed, setEndArmed] = useState(false);
  useEffect(() => {
    if (!endArmed) return undefined;
    const timer = window.setTimeout(() => setEndArmed(false), END_CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [endArmed]);
  const pressEnd = () => {
    if (endArmed) {
      setEndArmed(false);
      session.end();
    } else {
      setEndArmed(true);
    }
  };

  // Let the interface step back: after a quiet spell the header and rail fade and the card
  // dims; any pointer, key or touch brings everything back.
  useEffect(() => {
    let timer;
    const wake = () => {
      document.body.classList.remove("is-quiet");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => document.body.classList.add("is-quiet"), QUIET_AFTER_MS);
    };
    const events = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"];
    events.forEach((name) => window.addEventListener(name, wake, { passive: true }));
    wake();
    return () => {
      events.forEach((name) => window.removeEventListener(name, wake));
      window.clearTimeout(timer);
      document.body.classList.remove("is-quiet");
    };
  }, []);

  // Esc closes the mixer first; the session hook ignores the event once it is handled here.
  useEffect(() => {
    if (!mixerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onToggleMixer(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [mixerOpen, onToggleMixer]);

  const SlotIcon = SLOT_ICONS[sound.timeSlot] ?? Sun;
  const nextSlot = () =>
    sound.setTimeSlot(TIME_SLOTS[(TIME_SLOTS.indexOf(sound.timeSlot) + 1) % TIME_SLOTS.length]);
  const shownTime = formatTime(onBreak ? breakRemaining : remaining);
  const timerState = onBreak
    ? copy.mainTimerPaused(formatTime(remaining))
    : !isRunning
      ? copy.pausedLabel
      : "";

  return (
    <section className="scene focus-scene" aria-labelledby="focus-title">
      <div className="timer-card">
        <p className="eyebrow">{onBreak ? copy.breakEyebrow : seat?.name[lang]}</p>
        <h2 id="focus-title" title={onBreak ? undefined : task}>
          {onBreak ? copy.breakTitle : task}
        </h2>
        <div className="timer-row">
          <div
            className={`timer-display${onBreak ? " break" : !isRunning ? " paused" : ""}`}
            aria-label={copy.remainingAria(shownTime)}
          >
            {shownTime}
          </div>
          {timerState && <span className="timer-state">{timerState}</span>}
        </div>
        <p className="status-message" aria-live="polite">
          {onBreak
            ? copy.breakHint(task)
            : session.restoredNotice
              ? copy.restoredLine
              : session.breakNotice
                ? copy.breakOverLine
                : STATUS_MESSAGES[session.messageIndex][lang]}
        </p>
        <div className="focus-actions">
          {onBreak ? (
            <button className="primary-action compact" type="button" onClick={session.finishBreak}>
              <Play aria-hidden="true" />
              {copy.breakReturn}
            </button>
          ) : isRunning ? (
            <button className="icon-action" type="button" onClick={session.pause}>
              <Pause aria-hidden="true" />
              {copy.pause}
            </button>
          ) : (
            <button className="primary-action compact" type="button" onClick={session.resume}>
              <Play aria-hidden="true" />
              {copy.resume}
            </button>
          )}
          <button
            className={`icon-action end${endArmed ? " armed" : ""}`}
            type="button"
            aria-live="polite"
            onClick={pressEnd}
          >
            {endArmed ? (
              copy.endConfirm
            ) : (
              <>
                <Square aria-hidden="true" />
                {copy.end}
              </>
            )}
          </button>
        </div>
        <p className="keyboard-hint">{copy.keyboardHint}</p>
      </div>

      <div className="intervention-slot">
        {intervention === "breakReady" && breakIntervention && !onBreak && (
          <InterventionCard
            copy={copy}
            ariaLabel={copy.breakOfferAria}
            speaker={breakIntervention.speaker[lang]}
            line={breakIntervention.line[lang]}
            thought={breakIntervention.thought[lang](
              task,
              Math.floor((plan.minutes * 60 - remaining) / 60),
            )}
          >
            <div className="card-actions">
              <button className="secondary-action" type="button" onClick={session.startBreak}>
                {copy.breakTake}
              </button>
              <button className="ghost-action" type="button" onClick={session.dismissIntervention}>
                {copy.breakSkip}
              </button>
            </div>
          </InterventionCard>
        )}
        {intervention === "pauseLong" && pauseIntervention && (
          <InterventionCard
            copy={copy}
            speaker={pauseIntervention.speaker[lang]}
            line={pauseIntervention.line[lang]}
            thought={pauseIntervention.thought[lang](task)}
          >
            <button className="secondary-action" type="button" onClick={session.resume}>
              {copy.returnToTask}
            </button>
          </InterventionCard>
        )}
      </div>

      <div className="focus-rail" role="group" aria-label={copy.roomControls}>
        <button
          className={`rail-button${sound.enabled ? " on" : ""}`}
          type="button"
          aria-pressed={sound.enabled}
          aria-label={sound.enabled ? copy.muteAmbience : copy.unmuteAmbience}
          title={sound.enabled ? copy.muteAmbience : copy.unmuteAmbience}
          onClick={sound.toggleAmbience}
        >
          {sound.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
        <button
          className="rail-button"
          type="button"
          aria-label={copy.slotCycle}
          title={`${copy.timeSlotLabel}: ${copy.timeSlots[sound.timeSlot]}`}
          onClick={nextSlot}
        >
          <SlotIcon aria-hidden="true" />
        </button>
        <button
          className="rail-button mixer-toggle"
          type="button"
          aria-expanded={mixerOpen}
          aria-controls="mixer-body"
          aria-label={mixerOpen ? copy.mixerHide : copy.mixerShow}
          title={mixerOpen ? copy.mixerHide : copy.mixerShow}
          onClick={() => onToggleMixer()}
        >
          <SlidersHorizontal aria-hidden="true" />
          <span className="mixer-toggle-label">{mixerOpen ? copy.mixerHide : copy.mixerShow}</span>
        </button>
        <button
          className="rail-button"
          type="button"
          aria-pressed={playerExpanded}
          aria-label={playerExpanded ? copy.playerCollapse : copy.playerExpand}
          title={copy.playerTitle}
          onClick={togglePlayer}
        >
          <Music aria-hidden="true" />
          <span className={`rail-beat${musicPlaying ? " on" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <aside className={`focus-side${mixerOpen ? " open" : ""}`} aria-label={copy.detailsAria}>
        <div className="side-header">
          <span className="side-title">{copy.mixerTitle}</span>
          <button className="side-close" type="button" aria-label={copy.closeMixer} onClick={() => onToggleMixer(false)}>
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="detail-row">
          <span>{copy.drink}</span>
          <strong>{drinkName}</strong>
        </div>
        <div className="detail-row">
          <span>{copy.roomTone}</span>
          <strong>{seat?.label[lang]}</strong>
        </div>
        <div className="mixer-body" id="mixer-body">
          <Mixer copy={copy} sound={sound} />
        </div>
      </aside>
      <MusicPlayer copy={copy} lang={lang} sound={sound} open={playerOpen} onOpenChange={setPlayerOpen} />
    </section>
  );
}

export default FocusScene;
