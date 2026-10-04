// Scene animation entry point. Wrap @pixi/react elements in <CanvasStage>; it loads Pixi
// lazily. Hooks from @pixi/react (useTick, useApplication) work inside its children.
export { useApplication, useTick } from "@pixi/react";
export { default as CanvasStage } from "./CanvasStage.jsx";
