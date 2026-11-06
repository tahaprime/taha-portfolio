import type Lenis from "lenis";

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Scroll to a hash (`#about`) or Y offset, through Lenis when active, natively otherwise. */
export function scrollToTarget(target: string | number, immediate = false) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : null;
  if (typeof target === "string" && !el) return;
  const l = instance;
  if (l) {
    l.scrollTo(el ?? (target as number), { immediate, offset: el ? -72 : 0, duration: 1.1, force: true });
  } else if (el) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  } else {
    window.scrollTo({ top: target as number, behavior: "auto" });
  }
}
