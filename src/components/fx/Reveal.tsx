"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { motionGateOpen } from "@/lib/env";
import { EASE, GLYPHS, flickerWindow, scrambleDuration } from "@/lib/motion";
import { useMotion } from "@/components/shell/MotionProvider";

type Mode = "scramble" | "flicker" | "fade";

type Props = {
  as?: ElementType;
  /**
   * scramble: text resolves out of code glyphs (headings, labels)
   * flicker : words power on in random order (paragraphs)
   * fade    : opacity + rise for any content (blocks, figures)
   * scramble / flicker require `children` to be a plain string.
   */
  mode?: Mode;
  delay?: number;
  /**
   * hold (default true): the element is hidden until its animation starts.
   * hold={false}: it stays visible from first paint and animates in place. Use for the
   * above-the-fold headline so the Largest Contentful Paint never waits for JavaScript.
   */
  hold?: boolean;
  /** ScrollTrigger start, default: when the top enters the bottom 4% of the viewport. */
  start?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

/**
 * Scroll-triggered reveal. Progressive enhancement: content is fully visible in the
 * HTML; it is hidden only under `html.js-motion` (JS on, motion allowed) and
 * revealed here. Text modes keep the real string in a screen-reader-only node and
 * animate an aria-hidden copy, so assistive tech never hears glyph noise.
 */
export function Reveal({ as = "div", mode = "fade", delay = 0, hold = true, start = "top 96%", className, children, ...rest }: Props) {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement>(null);
  const played = useRef(false);
  const { ready } = useMotion();
  const text = typeof children === "string" ? children : null;
  const textMode = mode !== "fade" && text !== null;

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el || !ready || played.current || !contextSafe) return;
      if (!motionGateOpen()) return; // motion disabled: leave the rendered content untouched
      played.current = true;
      let dead = false;

      const when = (play: () => void) =>
        ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });

      if (textMode && mode === "scramble" && text) {
        const target = el.querySelector<HTMLElement>("[data-rt]");
        if (target) {
          const play = () => {
            gsap
              .timeline({ delay })
              .set(target, { opacity: 1 })
              .to(target, {
                duration: scrambleDuration(text.length),
                ease: "none",
                scrambleText: { text, chars: GLYPHS, speed: 0.55, revealDelay: 0.06, tweenLength: false },
              });
          };
          if (hold) {
            gsap.set(target, { opacity: 0 });
            el.setAttribute("data-revealed", "");
            when(play);
          } else {
            play(); // visible from first paint, scrambles in place
          }
        }
      } else if (textMode && mode === "flicker") {
        const target = el.querySelector<HTMLElement>("[data-rt]");
        const start$ = contextSafe(() => {
          if (dead || !target) return;
          const split = SplitText.create(target, { type: "words", aria: "none" });
          gsap.set(split.words, { opacity: 0 });
          el.setAttribute("data-revealed", "");
          // Binary blinks (stepped, never a half-transparent frame): each word stutters
          // on/off a few times at its own pace, then stays on.
          const play = () =>
            gsap.to(split.words, {
              keyframes: { opacity: [0, 1, 0, 1, 0, 1], easeEach: "steps(1)" },
              duration: () => 0.4 + Math.random() * 0.5,
              delay,
              stagger: { amount: flickerWindow(split.words.length), from: "random" },
              onComplete: () => split.revert(),
            });
          if (hold) when(play);
          else play();
        });
        // Split only after web fonts are ready so line breaks are measured with the final glyphs.
        void (document.fonts?.ready ?? Promise.resolve()).then(start$);
      } else {
        gsap.set(el, { opacity: 0, y: 18 });
        el.setAttribute("data-revealed", "");
        when(() => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: EASE.out, delay, clearProps: "transform" });
        });
      }

      return () => {
        dead = true;
      };
    },
    { scope: ref, dependencies: [ready] },
  );

  if (textMode) {
    return (
      <Tag ref={ref} {...(hold ? { "data-reveal": mode } : { "data-reveal-live": mode })} className={className} {...rest}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true" data-rt="">
          {text}
        </span>
      </Tag>
    );
  }
  return (
    <Tag ref={ref} data-reveal="fade" className={className} {...rest}>
      {children}
    </Tag>
  );
}
