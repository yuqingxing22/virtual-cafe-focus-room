import { Coffee } from "lucide-react";
import { DRINKS } from "../data/catalog.js";

// At the counter: the barista greets you and you pick a drink. The barista has one
// speech bubble; its line changes once a drink is chosen. The next step is always
// visible and only becomes active after a choice, so the panel never jumps.
function OrderScene({ copy, lang, drink, onPickDrink, onNext }) {
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
            <p className="quote" aria-live="polite" key={drink ? "reply" : "hello"}>
              {drink ? copy.baristaResponse : copy.baristaGreeting}
            </p>
          </div>
        </div>
        <div className="choice-grid drinks" role="group" aria-label={copy.orderEyebrow}>
          {DRINKS.map((item) => (
            <button
              className={`choice-card ${drink === item.id ? "selected" : ""}`}
              key={item.id}
              type="button"
              aria-pressed={drink === item.id}
              onClick={() => onPickDrink(item.id)}
            >
              <Coffee aria-hidden="true" />
              <span>{item.name[lang]}</span>
              <small>{item.note[lang]}</small>
            </button>
          ))}
        </div>
        <div className="scene-actions end">
          <button className="primary-action compact" type="button" disabled={!drink} onClick={onNext}>
            {copy.chooseSeat}
          </button>
        </div>
      </div>
    </section>
  );
}

export default OrderScene;
