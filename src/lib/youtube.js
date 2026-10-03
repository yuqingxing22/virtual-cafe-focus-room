// 24/7 live streams, verified to play inside an embedded player on 2026-10-02.
// Live stream IDs change when a channel restarts a stream; re-check if one stops working.
// Users can also paste any YouTube link.
export const YOUTUBE_STATIONS = [
  { id: "Dx5qFachd3A", name: { en: "Jazz piano", zh: "爵士钢琴" } },
  { id: "fEvM-OUbaKs", name: { en: "Coffee jazz", zh: "咖啡爵士" } },
  { id: "E2vONfzoyRI", name: { en: "Jazz lofi", zh: "爵士 lofi" } },
  { id: "5yx6BWlEVcY", name: { en: "Lofi beats", zh: "lofi 节拍" } },
];

// Old preset IDs that were saved in visitors' browsers but no longer play embedded.
export const RETIRED_YOUTUBE_IDS = {
  HuFYqnbVbzY: "E2vONfzoyRI",
  jfKfPfyJRdk: "5yx6BWlEVcY",
};

// IFrame API error codes: 2 bad id, 5 HTML5 error, 100 removed/private, 101/150 embedding blocked.
export const YOUTUBE_ERROR_CODES = [2, 5, 100, 101, 150];

// YouTube volume is 0-100 and much louder than the ambience beds, so cap it.
export const YOUTUBE_MAX_VOLUME = 55;

export const parseYouTubeId = (input) => {
  const value = input.trim();
  const isId = (id) => /^[\w-]{11}$/.test(id ?? "");
  if (isId(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname.endsWith("youtu.be")) {
      const id = url.pathname.slice(1, 12);
      return isId(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (isId(v)) return v;
    const match = url.pathname.match(/\/(?:live|embed|shorts)\/([\w-]{11})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

let youTubeApiPromise = null;
export const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youTubeApiPromise) {
    youTubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return youTubeApiPromise;
};
