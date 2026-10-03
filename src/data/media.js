import { DEFAULT_BACKDROP, assetPath } from "../lib/paths.js";

export const SCENE_MEDIA = {
  entrance: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/entrance/01.webp"),
      assetPath("assets/scenes/entrance/02.webp"),
      assetPath("assets/scenes/entrance/03.webp"),
    ],
  },
  order: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/order/01.webp"),
      assetPath("assets/scenes/order/02.webp"),
      assetPath("assets/scenes/order/03.webp"),
    ],
  },
  seat: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/seat-selection/01.webp"),
      assetPath("assets/scenes/seat-selection/02.webp"),
      assetPath("assets/scenes/seat-selection/03.webp"),
    ],
  },
  setup: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/setup/01.webp"),
      assetPath("assets/scenes/setup/02.webp"),
      assetPath("assets/scenes/setup/03.webp"),
    ],
  },
  focus_window: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-window/01.webp"),
      assetPath("assets/scenes/focus-window/02.webp"),
      assetPath("assets/scenes/focus-window/03.webp"),
    ],
  },
  focus_bar: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-bar/01.webp"),
      assetPath("assets/scenes/focus-bar/02.webp"),
      assetPath("assets/scenes/focus-bar/03.webp"),
    ],
  },
  focus_corner: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-corner/01.webp"),
      assetPath("assets/scenes/focus-corner/02.webp"),
      assetPath("assets/scenes/focus-corner/03.webp"),
    ],
  },
  focus_quiet: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-quiet/01.webp"),
      assetPath("assets/scenes/focus-quiet/02.webp"),
      assetPath("assets/scenes/focus-quiet/03.webp"),
    ],
  },
  complete: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/complete/01.webp"),
      assetPath("assets/scenes/complete/02.webp"),
      assetPath("assets/scenes/complete/03.webp"),
    ],
  },
};

export const getSceneMediaKey = (scene, seatId) => {
  if (scene === "focus") return `focus_${seatId ?? "corner"}`;
  if (SCENE_MEDIA[scene]) return scene;
  return "entrance";
};
