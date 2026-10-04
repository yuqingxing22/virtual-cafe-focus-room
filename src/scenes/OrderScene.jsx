import { Coffee, MessageCircle } from "lucide-react";
import { DRINKS } from "../data/catalog.js";

// At the counter: the barista greets you and you pick a drink.
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
            <p className="quote">{copy.baristaGreeting}</p>
          </div>
        </div>
        <div className="choice-grid drinks">
          {DRINKS.map((item) => (
            <button
              className={`choice-card ${drink === item.id ? "selected" : ""}`}
              key={item.id}
              type="button"
              onClick={() => onPickDrink(item.id)}
            >
              <Coffee aria-hidden="true" />
              <span>{item.name[lang]}</span>
              <small>{item.note[lang]}</small>
            </button>
          ))}
        </div>
        {drink && (
          <div className="next-step" role="status">
            <MessageCircle aria-hidden="true" />
            <span>{copy.baristaResponse}</span>
            <button className="secondary-action" type="button" onClick={onNext}>
              {copy.chooseSeat}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrderScene;
