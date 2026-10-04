import { MotionConfig } from "motion/react";
import { DURATION, EASE } from "./presets.js";

// Wrap the app once. reducedMotion="user" makes every motion component drop movement
// (keeping opacity fades) when the visitor's system asks for reduced motion.
function MotionRoot({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE.settle }}>
      {children}
    </MotionConfig>
  );
}

export default MotionRoot;
