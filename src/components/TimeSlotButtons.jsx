import { Moon, Sun, Sunrise } from "lucide-react";
import { TIME_SLOTS } from "../lib/timeSlot.js";

const TIME_SLOT_ICONS = { morning: Sunrise, day: Sun, night: Moon };

// Morning, daytime or night café. Shown on the setup scene and in the mixer.
function TimeSlotButtons({ copy, value, onChange }) {
  return (
    <div className="mode-buttons time-slots" role="group" aria-label={copy.timeSlotLabel}>
      {TIME_SLOTS.map((slot) => {
        const SlotIcon = TIME_SLOT_ICONS[slot];
        return (
          <button
            className={value === slot ? "active" : ""}
            key={slot}
            type="button"
            aria-pressed={value === slot}
            onClick={() => onChange(slot)}
          >
            <SlotIcon aria-hidden="true" />
            {copy.timeSlots[slot]}
          </button>
        );
      })}
    </div>
  );
}

export default TimeSlotButtons;
