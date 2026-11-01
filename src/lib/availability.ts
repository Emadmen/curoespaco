/**
 * Pure scheduling helpers shared by the client calendar and server validation.
 *
 * REQUEST mode: visitors pick a *preferred* time inside opening hours.
 * LIVE mode: visitors pick a real slot derived from a professional's working
 * hours minus existing requests (computed and re-verified on the server).
 */
import { addDays, getISODay } from "date-fns";
import type { OpeningHoursEntry, TimeRange, WorkingHours } from "@/types";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getOpeningForDate(hours: OpeningHoursEntry[], date: string) {
  const day = getISODay(parseDateOnly(date));
  const entry = hours.find((h) => h.day === day);
  if (!entry || entry.closed || !entry.open || !entry.close) return null;
  return { open: entry.open, close: entry.close };
}

export function isWithinHorizon(date: string, today: string, horizonDays: number) {
  return date >= today && date <= toDateOnly(addDays(parseDateOnly(today), horizonDays));
}

/** Whether a date can be requested at all (open day, not past, within horizon). */
export function isRequestableDate(
  hours: OpeningHoursEntry[],
  date: string,
  today: string,
  horizonDays: number,
) {
  return isWithinHorizon(date, today, horizonDays) && getOpeningForDate(hours, date) !== null;
}

/** Minimum notice before a same-day preferred time can be requested. */
export const SAME_DAY_NOTICE_MINUTES = 60;

/**
 * Preferred-time options for REQUEST mode: hourly, from opening time until
 * one hour before closing. On "today" only times with enough notice remain.
 */
export function getRequestTimeOptions(
  hours: OpeningHoursEntry[],
  date: string,
  now: { today: string; minutes: number },
): string[] {
  const opening = getOpeningForDate(hours, date);
  if (!opening) return [];
  const start = timeToMinutes(opening.open);
  const lastStart = timeToMinutes(opening.close) - 60;
  const options: string[] = [];
  for (let m = start; m <= lastStart; m += 60) {
    if (date === now.today && m < now.minutes + SAME_DAY_NOTICE_MINUTES) continue;
    options.push(minutesToTime(m));
  }
  return options;
}

export function parseWorkingHours(value: unknown): WorkingHours {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: WorkingHours = {};
  for (const [day, ranges] of Object.entries(value as Record<string, unknown>)) {
    if (!/^[1-7]$/.test(day) || !Array.isArray(ranges)) continue;
    const valid = ranges.filter(
      (r): r is TimeRange =>
        !!r &&
        typeof r === "object" &&
        typeof (r as TimeRange).start === "string" &&
        typeof (r as TimeRange).end === "string" &&
        /^\d{2}:\d{2}$/.test((r as TimeRange).start) &&
        /^\d{2}:\d{2}$/.test((r as TimeRange).end) &&
        timeToMinutes((r as TimeRange).start) < timeToMinutes((r as TimeRange).end),
    );
    if (valid.length) result[day] = valid;
  }
  return result;
}

/** Slot length rounded up to the next half hour (e.g. 50 min session → 60 min slot). */
export function slotStepMinutes(durationMinutes: number) {
  return Math.max(30, Math.ceil(durationMinutes / 30) * 30);
}

/**
 * LIVE mode slots for one professional on one date.
 * `busy` are occupied intervals in clinic-local minutes since midnight.
 */
export function computeLiveSlots(params: {
  workingHours: WorkingHours;
  date: string;
  durationMinutes: number;
  busy: { start: number; end: number }[];
  now: { today: string; minutes: number };
}): string[] {
  const { workingHours, date, durationMinutes, busy, now } = params;
  const day = String(getISODay(parseDateOnly(date)));
  const ranges = workingHours[day] ?? [];
  const step = slotStepMinutes(durationMinutes);
  const slots: string[] = [];

  for (const range of ranges) {
    const end = timeToMinutes(range.end);
    for (let s = timeToMinutes(range.start); s + durationMinutes <= end; s += step) {
      if (date === now.today && s < now.minutes + SAME_DAY_NOTICE_MINUTES) continue;
      const e = s + durationMinutes;
      const overlaps = busy.some((b) => s < b.end && b.start < e);
      if (!overlaps) slots.push(minutesToTime(s));
    }
  }
  return slots;
}
