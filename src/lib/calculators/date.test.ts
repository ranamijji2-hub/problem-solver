import { describe, expect, it } from "vitest";
import { dateDifference, addDaysToDate, subtractDaysFromDate } from "./date";

describe("dateDifference", () => {
  it("computes a simple whole-year difference", () => {
    const result = dateDifference(new Date(2020, 0, 1), new Date(2024, 0, 1));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diff.years).toBe(4);
      expect(result.diff.months).toBe(0);
      expect(result.diff.days).toBe(0);
      expect(result.diff.reversed).toBe(false);
    }
  });

  it("handles the second date being before the first", () => {
    const result = dateDifference(new Date(2024, 0, 1), new Date(2020, 0, 1));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diff.years).toBe(4);
      expect(result.diff.reversed).toBe(true);
    }
  });

  it("computes total days across a leap year correctly", () => {
    const result = dateDifference(new Date(2024, 0, 1), new Date(2024, 2, 1));
    expect(result.ok).toBe(true);
    // Jan (31) + Feb (29, 2024 is a leap year) = 60 days
    if (result.ok) expect(result.diff.totalDays).toBe(60);
  });

  it("returns zero for identical dates", () => {
    const result = dateDifference(new Date(2024, 5, 15), new Date(2024, 5, 15));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diff).toMatchObject({ years: 0, months: 0, days: 0, totalDays: 0 });
    }
  });

  it("errors on an invalid date", () => {
    const result = dateDifference(new Date("invalid"), new Date());
    expect(result.ok).toBe(false);
  });
});

describe("addDaysToDate", () => {
  it("adds days within the same month", () => {
    const result = addDaysToDate(new Date(2024, 0, 1), 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.getDate()).toBe(11);
  });

  it("rolls over into the next month correctly", () => {
    const result = addDaysToDate(new Date(2024, 0, 25), 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.getMonth()).toBe(1); // February
      expect(result.result.getDate()).toBe(4);
    }
  });

  it("supports negative day counts (equivalent to subtracting)", () => {
    const result = addDaysToDate(new Date(2024, 0, 10), -5);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.getDate()).toBe(5);
  });

  it("errors on an invalid date", () => {
    const result = addDaysToDate(new Date("invalid"), 5);
    expect(result.ok).toBe(false);
  });
});

describe("subtractDaysFromDate", () => {
  it("subtracts days correctly", () => {
    const result = subtractDaysFromDate(new Date(2024, 0, 10), 5);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.getDate()).toBe(5);
  });

  it("rolls back into the previous month", () => {
    const result = subtractDaysFromDate(new Date(2024, 1, 3), 5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.getMonth()).toBe(0); // January
      expect(result.result.getDate()).toBe(29);
    }
  });
});
