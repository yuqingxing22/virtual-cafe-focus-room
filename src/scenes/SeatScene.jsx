import { SEATS } from "../data/catalog.js";

// Choosing where to sit; each seat has its own room tone.
function SeatScene({ copy, lang, seat, onPickSeat, onBack, onNext }) {
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
                onClick={() => onPickSeat(item.id)}
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
          <button className="ghost-action" type="button" onClick={onBack}>
            {copy.back}
          </button>
          <button className="primary-action compact" type="button" disabled={!seat} onClick={onNext}>
            {copy.sitDown}
          </button>
        </div>
      </div>
    </section>
  );
}

export default SeatScene;
