import { SEATS } from "../data/catalog.js";

// The three sounds that tell the seats apart, shown as three dots each.
const FINGERPRINT = ["cafe", "rain", "traffic"];
const dotsFor = (level) => Math.round(level * 3);

// Choosing where to sit; each seat has its own room tone. Picking a seat previews its
// picture (App swaps the backdrop) and its sound mix (useSoundscape follows the seat).
function SeatScene({ copy, lang, seat, onPickSeat, onBack, onNext }) {
  return (
    <section className="scene seat-scene" aria-labelledby="seat-title">
      <div className="wide-panel">
        <p className="eyebrow">{copy.seatEyebrow}</p>
        <h2 id="seat-title">{copy.seatTitle}</h2>
        <div className="choice-grid seats" role="group" aria-label={copy.seatEyebrow}>
          {SEATS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`choice-card seat-card ${seat === item.id ? "selected" : ""}`}
                key={item.id}
                type="button"
                aria-pressed={seat === item.id}
                onClick={() => onPickSeat(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.name[lang]}</span>
                <small>{item.label[lang]}</small>
                <p>{item.description[lang]}</p>
                <span className="fingerprint" aria-label={copy.fingerprintAria}>
                  {FINGERPRINT.map((layer) => {
                    const filled = dotsFor(item.layers[layer] ?? 0);
                    return (
                      <span className="fingerprint-item" key={layer} title={`${copy.fingerprint[layer]} ${filled}/3`}>
                        {copy.fingerprint[layer]}
                        {[0, 1, 2].map((dot) => (
                          <i className={dot < filled ? "on" : ""} key={dot} aria-hidden="true" />
                        ))}
                      </span>
                    );
                  })}
                </span>
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
