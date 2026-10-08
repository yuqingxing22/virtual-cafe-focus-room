// Shared motion vocabulary, so every animated piece of the café moves the same way.
// Use with the `motion` library: <motion.div variants={rise} initial="hidden" animate="shown" />.

export const DURATION = { quick: 0.18, base: 0.32, slow: 0.6, scene: 0.9 };

// Soft ease-out: things settle like a cup set on a table, never bounce hard.
export const EASE = {
  settle: [0.22, 1, 0.36, 1],
  gentle: [0.4, 0, 0.2, 1],
};

export const SPRING = {
  soft: { type: "spring", stiffness: 220, damping: 26 },
  press: { type: "spring", stiffness: 520, damping: 30 },
};

export const fade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: DURATION.base, ease: EASE.gentle } },
  exit: { opacity: 0, transition: { duration: DURATION.quick, ease: EASE.gentle } },
};

// Panels and cards: a short rise into place.
export const rise = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.settle } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.quick, ease: EASE.gentle } },
};

// Whole-scene change: a slow cross-fade with a slight drift, like the camera moving on.
export const sceneChange = {
  hidden: { opacity: 0, scale: 1.01 },
  shown: { opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE.settle } },
  exit: { opacity: 0, transition: { duration: DURATION.base, ease: EASE.gentle } },
};

// Scene wrapper: opacity only, so the wrapper never carries a transform (a transform would
// become the containing block of the fixed bars inside the scenes on phones).
export const sceneFade = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE.gentle } },
  exit: { opacity: 0, transition: { duration: DURATION.base, ease: EASE.gentle } },
};

// Parent of a list (drinks, seats): children rise one after another.
export const stagger = (step = 0.05, delay = 0) => ({
  hidden: {},
  shown: { transition: { staggerChildren: step, delayChildren: delay } },
});

// Hover and press feedback for buttons and choice cards.
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: SPRING.press,
};
