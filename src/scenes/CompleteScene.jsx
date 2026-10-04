import { TimerReset } from "lucide-react";
import StampCard from "../components/StampCard.jsx";

// After the session: what you stayed with, and the stamp card if the visit counted.
function CompleteScene({ copy, task, minutes, session, onVisitAgain }) {
  const { sessionResult, lastVisit } = session;
  return (
    <section className="scene complete-scene" aria-labelledby="complete-title">
      <div className="complete-panel">
        <p className="eyebrow">
          {sessionResult === "completed" ? copy.sessionComplete : copy.sessionEnded}
        </p>
        <h2 id="complete-title">{copy.stayedWith(task)}</h2>
        <p>{sessionResult === "completed" ? copy.completedLine(minutes) : copy.endedLine}</p>
        {lastVisit && (
          <StampCard
            visits={session.visits}
            copy={copy}
            highlightLast={lastVisit.stamp}
            note={lastVisit.stamp ? copy.stampEarned : copy.stampMissed}
          />
        )}
        <div className="scene-actions">
          <button className="primary-action compact" type="button" onClick={onVisitAgain}>
            <TimerReset aria-hidden="true" />
            {copy.visitAgain}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CompleteScene;
