// UI animation entry point. Import motion components and presets from here, not from
// "motion/react" directly, so the shared timing and reduced-motion rules stay in one place.
export { AnimatePresence, motion, useReducedMotion } from "motion/react";
export { default as MotionRoot } from "./MotionRoot.jsx";
export * from "./presets.js";
