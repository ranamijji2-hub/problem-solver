import { describe, expect, it } from "vitest";
import { calculateAttendance } from "./attendance";

describe("calculateAttendance", () => {
  it("computes current percentage and missed classes", () => {
    const result = calculateAttendance({ totalClasses: 40, attendedClasses: 34, targetPercent: 75 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.currentPercent).toBe(85);
      expect(result.result.missedClasses).toBe(6);
      expect(result.result.meetsTarget).toBe(true);
    }
  });

  it("computes classes needed to reach an unmet target", () => {
    // 6/10 = 60%, target 75% -> classic textbook answer is 6 more classes attended.
    const result = calculateAttendance({ totalClasses: 10, attendedClasses: 6, targetPercent: 75 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.meetsTarget).toBe(false);
      expect(result.result.classesNeededToReachTarget).toBe(6);
      expect(result.result.maxClassesCanMiss).toBeNull();
    }
  });

  it("computes max classes that can still be missed while meeting target", () => {
    // 9/10 = 90%, target 75% -> can miss 2 more classes going forward.
    const result = calculateAttendance({ totalClasses: 10, attendedClasses: 9, targetPercent: 75 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.meetsTarget).toBe(true);
      expect(result.result.maxClassesCanMiss).toBe(2);
      expect(result.result.classesNeededToReachTarget).toBeNull();
    }
  });

  it("flags a 100% target as impossible once any class has been missed", () => {
    const result = calculateAttendance({ totalClasses: 10, attendedClasses: 9, targetPercent: 100 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.targetImpossible).toBeTruthy();
    }
  });

  it("allows a 100% target when attendance is currently perfect", () => {
    const result = calculateAttendance({ totalClasses: 10, attendedClasses: 10, targetPercent: 100 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.meetsTarget).toBe(true);
      expect(result.result.maxClassesCanMiss).toBe(0);
    }
  });

  it("errors when attended exceeds total", () => {
    const result = calculateAttendance({ totalClasses: 5, attendedClasses: 6, targetPercent: 75 });
    expect(result.ok).toBe(false);
  });

  it("errors when total classes is 0", () => {
    const result = calculateAttendance({ totalClasses: 0, attendedClasses: 0, targetPercent: 75 });
    expect(result.ok).toBe(false);
  });

  it("errors when target percent is out of range", () => {
    expect(calculateAttendance({ totalClasses: 10, attendedClasses: 5, targetPercent: 0 }).ok).toBe(false);
    expect(calculateAttendance({ totalClasses: 10, attendedClasses: 5, targetPercent: 101 }).ok).toBe(false);
  });

  it("treats an exact match to target as meeting it, not needing more classes", () => {
    const result = calculateAttendance({ totalClasses: 4, attendedClasses: 3, targetPercent: 75 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.meetsTarget).toBe(true);
      expect(result.result.maxClassesCanMiss).toBe(0);
    }
  });
});
