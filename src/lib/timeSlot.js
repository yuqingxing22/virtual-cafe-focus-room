import { readStored } from "./storage.js";

// The café at three times of day. The visitor picks one; it is never chosen from the clock.
export const TIME_SLOTS = ["morning", "day", "night"];

// Multipliers applied on top of a seat preset. "day" is the baseline the seats were tuned for.
// Which recording plays for café chatter, rain and street also changes with the slot
// (see AMBIENT_TRACKS): the quieter slots use sparser recordings, not just lower volume.
const SLOT_MIX = {
  morning: { cafe: 0.8, rain: 0.5, keys: 0.6, cups: 1.3, traffic: 0.8, backCounter: 1.5 },
  day: {},
  night: { cafe: 0.6, rain: 0.8, keys: 0.6, cups: 0.5, traffic: 0.7, backCounter: 0.15 },
};

export const readTimeSlot = () =>
  readStored("cafe-focus-time-slot", "day", (value) => TIME_SLOTS.includes(value));

export const applyTimeSlot = (layers, slot) => {
  const mix = SLOT_MIX[slot] ?? {};
  const out = {};
  for (const [key, level] of Object.entries(layers)) {
    out[key] = Math.min(1, Math.round(level * (mix[key] ?? 1) * 100) / 100);
  }
  // Birdsong exists only in the morning; each seat's `birds` value is its morning level.
  out.birds = slot === "morning" ? (layers.birds ?? 0) : 0;
  return out;
};
