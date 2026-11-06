import { site } from "@/content/site";

const time = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.location.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const zone = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.location.timeZone,
  timeZoneName: "shortOffset",
});

/** Current time in the owner's timezone (DST/Ramadan-aware via Intl), e.g. "16:56" + "GMT+1". */
export function localTime(now: Date = new Date()) {
  const offset = zone.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time: time.format(now), offset };
}
