import { ChevronDown, Pause, Play, Square } from "lucide-react";
import InterventionCard from "../components/InterventionCard.jsx";
import Mixer from "../components/Mixer.jsx";
import { BREAK_INTERVENTIONS, PAUSE_INTERVENTIONS, STATUS_MESSAGES } from "../data/copy.js";
import { formatTime } from "../lib/format.js";

// At the table: the task, the countdown (or the break countdown), pause and break cards,
// and the side panel with the mixer. `session` comes from useFocusSession, `sound` from
// useSoundscape. On narrow screens the mixer is a drawer under the timer; wide screens
// always show it.
function FocusScene({ copy, lang, plan, seat, drinkName, session, sound, mixerOpen, onToggleMixer }) {
  const { task } = plan;
  const { onBreak, remaining, breakRemaining, isRunning, intervention } = session;
  const pauseIntervention = seat ? PAUSE_INTERVENTIONS[seat.id] : null;
  const breakIntervention = seat ? BREAK_INTERVENTIONS[seat.id] : null;

  return (
    <section className="scene focus-scene" aria-labelledby="focus-title">
      <div className="focus-shell">
        <div className="focus-main">
          <p className="eyebrow">{onBreak ? copy.breakEyebrow : seat?.name[lang]}</p>
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
              : session.restoredNotice
                ? copy.restoredLine
                : session.breakNotice
                  ? copy.breakOverLine
                  : STATUS_MESSAGES[session.messageIndex][lang]}
          </p>
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
          <div className="focus-actions">
            {onBreak ? (
              <button className="icon-action" type="button" onClick={session.finishBreak}>
                <Play aria-hidden="true" />
                {copy.breakReturn}
              </button>
            ) : isRunning ? (
              <button className="icon-action" type="button" onClick={session.pause}>
                <Pause aria-hidden="true" />
                {copy.pause}
              </button>
            ) : (
              <button className="icon-action" type="button" onClick={session.resume}>
                <Play aria-hidden="true" />
                {copy.resume}
              </button>
            )}
            <button className="icon-action end" type="button" onClick={session.end}>
              <Square aria-hidden="true" />
              {copy.end}
            </button>
          </div>
          <p className="keyboard-hint">{copy.keyboardHint}</p>
        </div>

        <aside className={`focus-side ${mixerOpen ? "" : "collapsed"}`} aria-label={copy.detailsAria}>
          <div className="detail-row">
            <span>{copy.drink}</span>
            <strong>{drinkName}</strong>
          </div>
          <div className="detail-row">
            <span>{copy.roomTone}</span>
            <strong>{seat?.label[lang]}</strong>
          </div>
          <button
            className="mixer-toggle"
            type="button"
            aria-expanded={mixerOpen}
            aria-controls="mixer-body"
            onClick={onToggleMixer}
          >
            <span>{mixerOpen ? copy.mixerHide : copy.mixerShow}</span>
            <ChevronDown aria-hidden="true" />
          </button>
          <div className="mixer-body" id="mixer-body">
            <Mixer copy={copy} lang={lang} sound={sound} />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default FocusScene;
