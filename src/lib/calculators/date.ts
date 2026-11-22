/**
 * Date Calculator logic: the three modes named in the brief. Reuses the
 * same calendar-accurate year/month/day breakdown approach as age.ts for
 * the "difference" mode, since it's the same underlying problem (a
 * calendar-aware span between two dates).
 */

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  /** True when the second date is before the first (span is reported as a positive magnitude either way). */
  reversed: boolean;
}

export type DateDiffCalcResult = { ok: true; diff: DateDiffResult } | { ok: false; error: string };

export function dateDifference(dateA: Date, dateB: Date): DateDiffCalcResult {
  if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
    return { ok: false, error: "Enter two valid dates." };
  }

  const reversed = dateB.getTime() < dateA.getTime();
  const [start, end] = reversed ? [dateB, dateA] : [dateA, dateB];

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

  return { ok: true, diff: { years, months, days, totalDays, reversed } };
}

export type DateShiftCalcResult = { ok: true; result: Date } | { ok: false; error: string };

/** Adds `days` (may be negative) to `date`, returning a new Date. */
export function addDaysToDate(date: Date, days: number): DateShiftCalcResult {
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Enter a valid date." };
  }
  if (!Number.isFinite(days)) {
    return { ok: false, error: "Enter a valid number of days." };
  }
  const result = new Date(date);
  result.setDate(result.getDate() + Math.trunc(days));
  return { ok: true, result };
}

/** Subtracts `days` from `date` — a thin, explicit wrapper over addDaysToDate for UI clarity. */
export function subtractDaysFromDate(date: Date, days: number): DateShiftCalcResult {
  return addDaysToDate(date, -Math.trunc(days));
}
