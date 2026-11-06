"use client";

import { useEffect, useRef, useState } from "react";

/** Copies the address to the clipboard; announces the result politely for screen readers. */
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <>
      <button type="button" className={`mono ${className}`} onClick={copy}>
        {state === "copied" ? "Copied ✓" : state === "failed" ? "Copy failed" : "Copy address"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Email address copied to clipboard" : state === "failed" ? "Could not copy" : ""}
      </span>
    </>
  );
}
