import { Suspense, lazy } from "react";
import { usePrefersReducedMotion } from "../lib/reducedMotion.js";
import "./canvas.css";

// Pixi is large (about 200 KB gzipped), so it loads in its own chunk only when a scene
// actually renders a CanvasStage. Pages without one never download it.
const PixiStage = lazy(() => import("./PixiStage.jsx"));

// A transparent canvas layer that fills its positioned parent, for scene animation
// (steam, rain on the window, people moving). Children are @pixi/react elements.
//
// - interactive=false (default) lets clicks pass through to the page underneath.
// - With reduced motion, the stage renders its first frame and then stops ticking;
//   scenes should also check usePrefersReducedMotion() and skip looping effects.
// - fallback shows while Pixi loads, and stays if it fails (keep it a still image or null).
function CanvasStage({ children, interactive = false, fallback = null, className = "" }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className={`canvas-stage ${interactive ? "interactive" : ""} ${className}`.trim()}
      aria-hidden={interactive ? undefined : "true"}
    >
      <Suspense fallback={fallback}>
        <PixiStage paused={reduced}>{children}</PixiStage>
      </Suspense>
    </div>
  );
}

export default CanvasStage;
