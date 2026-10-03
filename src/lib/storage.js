export const readStored = (key, fallback, isValid) => {
  try {
    const value = window.localStorage.getItem(key);
    return value && isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

export const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist.
  }
};
