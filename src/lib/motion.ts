/**
 * Motion tokens. The language is a "boot sequence": text powers on in random
 * order (flicker), headings resolve out of code glyphs (scramble), pages are
 * covered and revealed by a sweeping panel. Values are this site's own.
 */
export const GLYPHS = "01{}[]<>/#_+=";

export const DURATION = {
  fast: 0.3,
  base: 0.85,
  curtainCover: 0.55,
  curtainReveal: 0.75,
  bootMin: 0.9,
} as const;

export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  expo: "expo.out",
} as const;

/** Scramble duration grows with text length but stays snappy. */
export const scrambleDuration = (length: number) => Math.min(1.5, 0.45 + length * 0.035);

/** Total stagger window for a block of words. */
export const flickerWindow = (words: number) => Math.min(1.6, 0.25 + words * 0.055);

export const normalizePath = (p: string) => (p.endsWith("/") ? p : `${p}/`);
