import { DRINKS, SEATS } from "../data/catalog.js";

// An in-progress focus session, so a refresh or a closed tab does not lose it.
const SESSION_KEY = "cafe-focus-session";
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export const readSavedSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || saved.v !== 1) return null;
    if (!Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > SESSION_MAX_AGE_MS) return null;
    if (!SEATS.some((seat) => seat.id === saved.seat)) return null;
    if (saved.drink !== null && !DRINKS.some((drink) => drink.id === saved.drink)) return null;
    if (typeof saved.task !== "string" || !saved.task.trim()) return null;
    if (!Number.isFinite(saved.minutes) || saved.minutes < 5 || saved.minutes > 180) return null;
    const running = Number.isFinite(saved.endAt);
    if (!running && !Number.isFinite(saved.remaining)) return null;
    if (saved.layerMix !== null && typeof saved.layerMix !== "object") return null;

    return {
      task: saved.task,
      seat: saved.seat,
      drink: saved.drink,
      minutes: saved.minutes,
      endAt: running ? saved.endAt : null,
      remaining: running
        ? Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000))
        : Math.max(0, Math.floor(saved.remaining)),
      layerMix: saved.layerMix ?? null,
      timeSlot: ["morning", "day", "night"].includes(saved.timeSlot) ? saved.timeSlot : "day",
    };
  } catch {
    return null;
  }
};

export const writeSavedSession = (session) => {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ v: 1, savedAt: Date.now(), ...session }));
  } catch {
    // Storage unavailable; the session simply won't survive a refresh.
  }
};

export const clearSavedSession = () => {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
};
