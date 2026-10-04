import { useRef } from "react";
import { Application, extend } from "@pixi/react";
import { AnimatedSprite, Container, Graphics, Sprite, Text } from "pixi.js";

// Register the Pixi classes scenes may use as JSX: <pixiContainer>, <pixiSprite>, ...
// Add more here when a scene needs them; unregistered classes cannot be rendered.
extend({ AnimatedSprite, Container, Graphics, Sprite, Text });

// The Pixi canvas itself. Loaded lazily by CanvasStage; do not import it directly.
function PixiStage({ children, paused }) {
  const hostRef = useRef(null);
  return (
    <div className="canvas-stage-host" ref={hostRef}>
      <Application
        resizeTo={hostRef}
        backgroundAlpha={0}
        antialias
        autoDensity
        resolution={Math.min(window.devicePixelRatio || 1, 2)}
        autoStart={!paused}
        sharedTicker={false}
      >
        {children}
      </Application>
    </div>
  );
}

export default PixiStage;
