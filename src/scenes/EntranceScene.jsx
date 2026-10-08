import { DoorOpen } from "lucide-react";
import StampCard from "../components/StampCard.jsx";

// Outside the café: the title, the door, and the stamp card for returning visitors. The
// door in the picture is a pointer-only hotspot for the same action as the button.
function EntranceScene({ copy, visits, onEnter }) {
  return (
    <section className="scene entrance-scene" aria-labelledby="entrance-title">
      <div className="hero-copy">
        <p className="eyebrow">
          {visits.length > 0 ? copy.visitEyebrow(visits.length + 1) : copy.entranceEyebrow}
        </p>
        <h1 id="entrance-title">{copy.entranceTitle}</h1>
        <p className="scene-lede">{copy.entranceLead}</p>
        <p className="presence-line" aria-label={copy.presenceAria}>
          {copy.presence.join(" · ")}
        </p>
        <button className="primary-action" type="button" onClick={onEnter}>
          <DoorOpen aria-hidden="true" />
          {copy.enterCafe}
        </button>
        {visits.length > 0 && <StampCard visits={visits} copy={copy} />}
        <p className="site-note">
          <span>{copy.siteNote}</span>
          <a href="/privacy.html">{copy.privacyLink}</a>
          <a
            href="https://github.com/yuqingxing22/virtual-cafe-focus-room/issues"
            target="_blank"
            rel="noreferrer"
          >
            {copy.feedbackLink}
          </a>
        </p>
      </div>
      <button
        className="door-hotspot"
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        title={copy.enterCafe}
        onClick={onEnter}
      />
    </section>
  );
}

export default EntranceScene;
