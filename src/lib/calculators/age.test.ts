import { describe, expect, it } from "vitest";
import { calculateAge } from "./age";

describe("calculateAge", () => {
  it("computes an exact whole-year age on a birthday", () => {
    const result = calculateAge(new Date(2000, 0, 15), new Date(2024, 0, 15));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.age.years).toBe(24);
      expect(result.age.months).toBe(0);
      expect(result.age.days).toBe(0);
    }
  });

  it("computes years/months/days before the birthday this year", () => {
    // Born 2000-06-20, "today" 2024-06-10: hasn't had this year's birthday yet.
    const result = calculateAge(new Date(2000, 5, 20), new Date(2024, 5, 10));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.age.years).toBe(23);
      expect(result.age.months).toBe(11);
    }
  });

  it("handles leap-year February 29 birthdays", () => {
    const result = calculateAge(new Date(2000, 1, 29), new Date(2024, 1, 29));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.age.years).toBe(24);
      expect(result.age.months).toBe(0);
      expect(result.age.days).toBe(0);
    }
  });

  it("rejects a future date of birth", () => {
    const result = calculateAge(new Date(2999, 0, 1), new Date(2024, 0, 1));
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid date", () => {
    const result = calculateAge(new Date("not-a-date"));
    expect(result.ok).toBe(false);
  });

  it("returns 0/0/0 for a birth date equal to today", () => {
    const today = new Date(2024, 3, 1);
    const result = calculateAge(new Date(2024, 3, 1), today);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.age).toMatchObject({ years: 0, months: 0, days: 0, totalDays: 0 });
    }
  });
});
