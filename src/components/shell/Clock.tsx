"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { localTime } from "@/lib/clock";

/**
 * Live local time for the owner's timezone (Africa/Casablanca; DST/Ramadan-aware via Intl).
 * The server renders a neutral placeholder so hydration always matches; the ticking
 * value is hidden from assistive tech and an accessible static label replaces it.
 */
export function Clock() {
  const [value, setValue] = useState<{ time: string; offset: string } | null>(null);

  useEffect(() => {
    const tick = () => setValue(localTime());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span>
      <span className="sr-only">Local time in {site.location.country}</span>
      <time aria-hidden="true" dateTime={value?.time}>
        {value ? `${value.time} ${value.offset}` : "--:--"}
      </time>
    </span>
  );
}
