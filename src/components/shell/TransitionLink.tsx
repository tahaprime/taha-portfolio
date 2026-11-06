"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useMotion } from "./MotionProvider";

/**
 * A real <a> (works without JS, opens in new tabs, is crawlable) that plays the
 * route curtain for ordinary left-clicks. Modified clicks, new-tab targets and
 * reduced-motion all fall through to the browser/Next defaults.
 */
export function TransitionLink({ href, onClick, target, ...rest }: ComponentProps<typeof Link>) {
  const { navigate } = useMotion();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (target && target !== "_self") return;
    const raw = typeof href === "string" ? href : (href.pathname ?? "");
    if (!raw) return;
    e.preventDefault();
    navigate(raw);
  };

  return <Link href={href} target={target} onClick={handle} {...rest} />;
}
