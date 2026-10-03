// Visit history for the stamp card. One entry per session that lasted at least a minute.
export const VISITS_KEY = "cafe-focus-visits";
export const STAMPS_PER_CARD = 10;
export const STAMP_MINUTES = 10;
export const MAX_STORED_VISITS = 500;

export const readVisits = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(VISITS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.at === "string" && Number.isFinite(item.minutes),
    );
  } catch {
    return [];
  }
};

export const writeVisits = (visits) => {
  try {
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(visits.slice(-MAX_STORED_VISITS)));
  } catch {
    // Storage unavailable; the card just won't persist.
  }
};

export const countStamps = (visits) => visits.filter((item) => item.stamp).length;
