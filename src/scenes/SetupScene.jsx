import { Check, Clock3, Laptop, Play } from "lucide-react";
import TimeSlotButtons from "../components/TimeSlotButtons.jsx";
import { DURATIONS } from "../data/catalog.js";

// Sitting down: name the task, pick a length and time of day, put the phone away.
// `plan` holds the form values and their setters (see App).
function SetupScene({ copy, plan, seatName, drinkName, timeSlot, onTimeSlotChange, onBack, onStart }) {
  const { task, duration, customDuration, ritual } = plan;
  return (
    <section className="scene setup-scene" aria-labelledby="setup-title">
      <div className="setup-panel">
        <p className="eyebrow">{copy.setupEyebrow(seatName)}</p>
        <h2 id="setup-title">{copy.setupTitle}</h2>
        <label className="task-field">
          <span>{copy.taskLabel}</span>
          <input
            type="text"
            value={task}
            onChange={(event) => plan.setTask(event.target.value)}
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
                plan.setDuration(minutes);
                plan.setCustomDuration("");
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
              onChange={(event) => plan.setCustomDuration(event.target.value)}
              placeholder={copy.customDuration}
            />
          </label>
        </div>
        <TimeSlotButtons copy={copy} value={timeSlot} onChange={onTimeSlotChange} />
        <div className="ritual-list">
          <button
            className={`ritual-item ${ritual.phone ? "done" : ""}`}
            type="button"
            onClick={() => plan.setRitual((current) => ({ ...current, phone: !current.phone }))}
          >
            <Check aria-hidden="true" />
            {copy.ritualPhone}
          </button>
          <button
            className={`ritual-item ${ritual.laptop ? "done" : ""}`}
            type="button"
            onClick={() => plan.setRitual((current) => ({ ...current, laptop: !current.laptop }))}
          >
            <Laptop aria-hidden="true" />
            {copy.ritualLaptop}
          </button>
        </div>
        <div className="session-summary" aria-live="polite">
          <span>{drinkName}</span>
          <span>{seatName}</span>
          <span>
            {plan.minutes} {copy.minutes}
          </span>
        </div>
        <div className="scene-actions">
          <button className="ghost-action" type="button" onClick={onBack}>
            {copy.back}
          </button>
          <button
            className="primary-action compact"
            type="button"
            disabled={!task.trim() || !ritual.phone || !ritual.laptop}
            onClick={onStart}
          >
            <Play aria-hidden="true" />
            {copy.startWorking}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SetupScene;
