import { STORY_START } from "./story";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Fixed UTC-3 is the timezone of the couple's story (Goiás).
// Calendar months are counted by anniversaries, not by blocks of 30 days.
export function timeTogether(now: number) {
  const start = Date.UTC(STORY_START.year, STORY_START.month - 1, STORY_START.day, 3);
  const safeNow = Math.max(start, now);
  const local = new Date(safeNow - 3 * HOUR);
  let months = (local.getUTCFullYear() - STORY_START.year) * 12 + local.getUTCMonth() - (STORY_START.month - 1);
  const anniversary = (offset: number) => Date.UTC(STORY_START.year, STORY_START.month - 1 + offset, STORY_START.day, 3);
  if (safeNow < anniversary(months)) months--;
  const remainder = safeNow - anniversary(months);
  return {
    years: Math.floor(months / 12), months: months % 12,
    days: Math.floor(remainder / DAY), hours: Math.floor(remainder / HOUR) % 24,
    minutes: Math.floor(remainder / 60_000) % 60, seconds: Math.floor(remainder / 1000) % 60,
  };
}
