import { Coffee } from "lucide-react";
import { formatMinutes } from "../lib/format.js";
import { STAMPS_PER_CARD, countStamps } from "../lib/visits.js";

function StampCard({ visits, copy, highlightLast = false, note = null }) {
  const stamps = countStamps(visits);
  const filled = stamps === 0 ? 0 : ((stamps - 1) % STAMPS_PER_CARD) + 1;
  const cardNumber = Math.max(1, Math.ceil(stamps / STAMPS_PER_CARD));
  const isFull = stamps > 0 && filled === STAMPS_PER_CARD;
  const totalMinutes = visits.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <section className="stamp-card" aria-label={copy.stampCard}>
      <div className="stamp-card-head">
        <span>
          {copy.stampCard} · {copy.cardNumber(cardNumber)}
        </span>
        <strong>
          {filled} / {STAMPS_PER_CARD}
        </strong>
      </div>
      <div className="stamp-row" role="img" aria-label={copy.stampsAria(filled, STAMPS_PER_CARD)}>
        {Array.from({ length: STAMPS_PER_CARD }, (_, index) => {
          const isFilled = index < filled;
          const isNew = highlightLast && isFilled && index === filled - 1;
          return (
            <span
              className={`stamp${isFilled ? " filled" : ""}${isNew ? " new" : ""}`}
              key={index}
            >
              {isFilled && <Coffee aria-hidden="true" />}
            </span>
          );
        })}
      </div>
      <p className="stamp-meta">
        {copy.visitTotal(visits.length)} · {copy.totalFocused(formatMinutes(totalMinutes, copy))}
      </p>
      {(note || isFull) && <p className="stamp-note">{isFull ? copy.cardFull : note}</p>}
    </section>
  );
}

export default StampCard;
