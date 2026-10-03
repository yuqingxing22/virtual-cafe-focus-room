import { DEFAULT_BACKDROP, assetPath } from "../lib/paths.js";

export const SCENE_MEDIA = {
  entrance: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/entrance/01.png"),
      assetPath("assets/scenes/entrance/02.png"),
      assetPath("assets/scenes/entrance/03.png"),
    ],
  },
  order: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/order/01.png"),
      assetPath("assets/scenes/order/02.png"),
      assetPath("assets/scenes/order/03.png"),
    ],
  },
  seat: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/seat-selection/01.png"),
      assetPath("assets/scenes/seat-selection/02.png"),
      assetPath("assets/scenes/seat-selection/03.png"),
    ],
  },
  setup: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/setup/01.png"),
      assetPath("assets/scenes/setup/02.png"),
      assetPath("assets/scenes/setup/03.png"),
    ],
  },
  focus_window: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-window/01.png"),
      assetPath("assets/scenes/focus-window/02.png"),
      assetPath("assets/scenes/focus-window/03.png"),
    ],
  },
  focus_bar: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-bar/01.png"),
      assetPath("assets/scenes/focus-bar/02.png"),
      assetPath("assets/scenes/focus-bar/03.png"),
    ],
  },
  focus_corner: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-corner/01.png"),
      assetPath("assets/scenes/focus-corner/02.png"),
      assetPath("assets/scenes/focus-corner/03.png"),
    ],
  },
  focus_quiet: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/focus-quiet/01.png"),
      assetPath("assets/scenes/focus-quiet/02.png"),
      assetPath("assets/scenes/focus-quiet/03.png"),
    ],
  },
  complete: {
    fallback: DEFAULT_BACKDROP,
    images: [
      assetPath("assets/scenes/complete/01.png"),
      assetPath("assets/scenes/complete/02.png"),
      assetPath("assets/scenes/complete/03.png"),
    ],
  },
};

export const getSceneMediaKey = (scene, seatId) => {
  if (scene === "focus") return `focus_${seatId ?? "corner"}`;
  if (SCENE_MEDIA[scene]) return scene;
  return "entrance";
};
