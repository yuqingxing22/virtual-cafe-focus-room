import { useEffect, useRef } from "react";
import { Check, Laptop, Play, Smartphone } from "lucide-react";
import TimeSlotButtons from "../components/TimeSlotButtons.jsx";
import { DURATIONS } from "../data/catalog.js";

const CUSTOM_MIN = 5;
const CUSTOM_MAX = 180;

// Sitting down: a receipt of what was chosen, then the task, how long, the time of day and
// two optional rituals. `plan` holds the form values and their setters (see App). The
// custom length is checked here and shown as a hint instead of being silently ignored.
function SetupScene({ copy, plan, seatName, drinkName, timeSlot, onTimeSlotChange, onBack, onStart }) {
  const { task, duration, customDuration, ritual } = plan;
  const taskRef = useRef(null);

  useEffect(() => {
    taskRef.current?.focus();
  }, []);

  const custom = Number(customDuration);
  const customValid =
    customDuration === "" || (Number.isFinite(custom) && custom >= CUSTOM_MIN && custom <= CUSTOM_MAX);
  const canStart = task.trim().length > 0 && customValid;
  const start = () => {
    if (canStart) onStart();
  };

  return (
    <section className="scene setup-scene" aria-labelledby="setup-title">
      <div className="setup-panel">
        <p className="receipt">
          <span>
            {seatName} · {drinkName} · {plan.minutes} {copy.minuteShort}
          </span>
          <button className="receipt-change" type="button" onClick={onBack}>
            {copy.changeChoice}
          </button>
        </p>
        <h2 id="setup-title">{copy.setupTitle}</h2>

        <label className="task-field">
          <span>{copy.taskLabel}</span>
          <input
            ref={taskRef}
            type="text"
            value={task}
            onChange={(event) => plan.setTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") start();
            }}
            placeholder={copy.taskPlaceholder}
          />
        </label>

        <div className="setup-field">
          <span className="field-label" id="duration-label">
            {copy.howLong}
          </span>
          <div className="duration-group" role="group" aria-labelledby="duration-label">
            {DURATIONS.map((minutes) => (
              <button
                className={duration === minutes && !customDuration ? "duration selected" : "duration"}
                key={minutes}
                type="button"
                aria-pressed={duration === minutes && !customDuration}
                onClick={() => {
                  plan.setDuration(minutes);
                  plan.setCustomDuration("");
                }}
              >
                {minutes} {copy.minuteShort}
              </button>
            ))}
            <label className="custom-duration">
              <input
                type="number"
                inputMode="numeric"
                min={CUSTOM_MIN}
                max={CUSTOM_MAX}
                value={customDuration}
                aria-invalid={!customValid}
                aria-describedby="duration-hint"
                onChange={(event) => plan.setCustomDuration(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") start();
                }}
                placeholder={copy.customDuration}
              />
              <span>{copy.minuteShort}</span>
            </label>
          </div>
          <p className={`field-hint${customValid ? "" : " bad"}`} id="duration-hint" aria-live="polite">
            {customValid ? "" : copy.durationHint(CUSTOM_MIN, CUSTOM_MAX)}
          </p>
        </div>

        <div className="setup-field">
          <span className="field-label">
            {copy.timeSlotLabel}
            <small>{copy.whenNote}</small>
          </span>
          <TimeSlotButtons copy={copy} value={timeSlot} onChange={onTimeSlotChange} />
        </div>

        <div className="setup-field">
          <span className="field-label">
            {copy.beforeSit}
            <small>{copy.optional}</small>
          </span>
          <div className="ritual-list">
            <button
              className={`ritual-item ${ritual.phone ? "done" : ""}`}
              type="button"
              aria-pressed={ritual.phone}
              onClick={() => plan.setRitual((current) => ({ ...current, phone: !current.phone }))}
            >
              {ritual.phone ? <Check aria-hidden="true" /> : <Smartphone aria-hidden="true" />}
              {copy.ritualPhone}
            </button>
            <button
              className={`ritual-item ${ritual.laptop ? "done" : ""}`}
              type="button"
              aria-pressed={ritual.laptop}
              onClick={() => plan.setRitual((current) => ({ ...current, laptop: !current.laptop }))}
            >
              {ritual.laptop ? <Check aria-hidden="true" /> : <Laptop aria-hidden="true" />}
              {copy.ritualLaptop}
            </button>
          </div>
        </div>

        <div className="scene-actions">
          <button className="ghost-action" type="button" onClick={onBack}>
            {copy.back}
          </button>
          <button className="primary-action compact" type="button" disabled={!canStart} onClick={start}>
            <Play aria-hidden="true" />
            {copy.startWorking}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SetupScene;
