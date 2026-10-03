const joinUrlPath = (base, path) => {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
};

export const assetPath = (path) => joinUrlPath(import.meta.env.BASE_URL, path);
export const audioPath = (path) => {
  const audioBase = import.meta.env.VITE_AUDIO_BASE_URL?.trim();
  return audioBase ? joinUrlPath(audioBase, path) : assetPath(path);
};
export const DEFAULT_BACKDROP = assetPath("assets/cafe-room.webp");
