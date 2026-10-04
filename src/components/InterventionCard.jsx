// A short line from someone in the café plus the visitor's own thought, shown on the focus
// scene (pause nudge, break offer). `children` are the buttons.
function InterventionCard({ copy, speaker, line, thought, ariaLabel, children }) {
  return (
    <div className="intervention-card" role="status" aria-label={ariaLabel}>
      <p className="speaker">{speaker}</p>
      <p className="quote">{line}</p>
      <div className="thought-line">
        <span>{copy.innerThought}</span>
        <p>{thought}</p>
      </div>
      {children}
    </div>
  );
}

export default InterventionCard;
