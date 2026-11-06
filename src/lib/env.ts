/** Capability queries: never user-agent sniffing. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const MOTION_AND_POINTER = `${MOTION_OK} and ${FINE_POINTER}`;

const match = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const motionAllowed = () => match(MOTION_OK);
export const hasFinePointer = () => match(FINE_POINTER);

/** True when the head script enabled the animation gate (JS on + motion allowed). */
export const motionGateOpen = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("js-motion");
