/**
 * Age Calculator logic. Computes a calendar-accurate breakdown (years,
 * months, days) between a date of birth and a reference date — not a
 * simple day-count divided by 365, which drifts against real calendar
 * months and leap years.
 */

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export type AgeResult = { ok: true; age: AgeBreakdown } | { ok: false; error: string };

/**
 * @param dob Date of birth.
 * @param today Reference date to calculate age as of (defaults to now).
 */
export function calculateAge(dob: Date, today: Date = new Date()): AgeResult {
  if (Number.isNaN(dob.getTime())) {
    return { ok: false, error: "Enter a valid date of birth." };
  }
  if (Number.isNaN(today.getTime())) {
    return { ok: false, error: "Enter a valid reference date." };
  }
  if (dob.getTime() > today.getTime()) {
    return { ok: false, error: "Date of birth can't be in the future." };
  }

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the month before `today`'s month.
    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((today.getTime() - dob.getTime()) / msPerDay);

  return { ok: true, age: { years, months, days, totalDays } };
}
