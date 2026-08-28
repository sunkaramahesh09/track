/**
 * All persistence is keyed by a calendar day ("YYYY-MM-DD").
 *
 * Two rules keep this correct in a serverless deployment:
 *
 * 1. **The clock is consulted in one fixed zone.** Vercel functions run in UTC,
 *    but "today" must mean today where the user actually is — otherwise an IST
 *    user sees yesterday's board between midnight and 05:30. Only `todayKey`
 *    and `formatTime` touch the real clock, and both pin the zone.
 *
 * 2. **Calendar arithmetic is zone-free.** Day-keys are anchored to UTC
 *    midnight and read back with UTC getters, so adding a day or asking for a
 *    weekday produces the same answer on any machine.
 */

/** The zone the app's calendar runs in. Override per environment. */
export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Kolkata";

export type DayKey = string;

export const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDayKey(value: string): value is DayKey {
  return DAY_KEY_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * The calendar day an instant falls on, in the app's zone.
 * `en-CA` formats as YYYY-MM-DD, which is exactly the day-key shape.
 */
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDayKey(instant: Date): DayKey {
  return dayKeyFormatter.format(instant);
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

/** A day-key as a UTC-anchored Date — a calendar position, not an instant. */
export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a UTC-anchored calendar Date back to a day-key. */
function calendarToKey(date: Date): DayKey {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MS_PER_DAY = 86_400_000;

export function addDays(key: DayKey, days: number): DayKey {
  return calendarToKey(new Date(fromDayKey(key).getTime() + days * MS_PER_DAY));
}

export function diffInDays(a: DayKey, b: DayKey): number {
  return Math.round((fromDayKey(a).getTime() - fromDayKey(b).getTime()) / MS_PER_DAY);
}

/** Inclusive range of day-keys, oldest first. */
export function rangeOfDays(from: DayKey, to: DayKey): DayKey[] {
  const out: DayKey[] = [];
  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard++ < 5000) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** The last `count` days ending today (oldest first). */
export function lastNDays(count: number, end: DayKey = todayKey()): DayKey[] {
  return rangeOfDays(addDays(end, -(count - 1)), end);
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(key: DayKey): number {
  return fromDayKey(key).getUTCDay();
}

/** Monday-anchored week start for a given day. */
export function startOfWeek(key: DayKey): DayKey {
  const dow = weekdayOf(key);
  return addDays(key, dow === 0 ? -6 : 1 - dow);
}

export function startOfMonth(key: DayKey): DayKey {
  return `${key.slice(0, 7)}-01`;
}

/** Last calendar day of the month containing `key`. */
export function endOfMonth(key: DayKey): DayKey {
  const date = fromDayKey(key);
  return calendarToKey(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export function monthIndexOf(key: DayKey): number {
  return fromDayKey(key).getUTCMonth();
}

export function dayOfMonth(key: DayKey): number {
  return fromDayKey(key).getUTCDate();
}

export function formatDayShort(key: DayKey) {
  const d = fromDayKey(key);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function formatDayLong(key: DayKey) {
  const d = fromDayKey(key);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatMonth(key: DayKey) {
  const d = fromDayKey(key);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function weekdayName(key: DayKey) {
  return WEEKDAYS[weekdayOf(key)];
}

/**
 * A completion timestamp, rendered in the app's zone.
 *
 * Locale and zone are both pinned: an unpinned `toLocaleTimeString` resolves
 * differently on the server than in the browser (19:23 vs 7:23 pm) and fails
 * hydration, and an unpinned zone would show UTC once deployed.
 */
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return timeFormatter.format(d).toLowerCase();
}
