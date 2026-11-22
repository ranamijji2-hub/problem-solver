import { describe, expect, it } from "vitest";
import { calculateGpa, type GpaSubject } from "./gpa";

function subject(overrides: Partial<GpaSubject> = {}): GpaSubject {
  return { id: "1", name: "Test", creditHours: 3, grade: "A", ...overrides };
}

describe("calculateGpa", () => {
  it("computes a weighted GPA across subjects", () => {
    const result = calculateGpa([
      subject({ id: "1", creditHours: 3, grade: "A" }), // 3 * 4.0 = 12
      subject({ id: "2", creditHours: 4, grade: "B" }), // 4 * 3.0 = 12
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.totalCreditHours).toBe(7);
      expect(result.gpa).toBeCloseTo(24 / 7, 5);
    }
  });

  it("handles a single F grade", () => {
    const result = calculateGpa([subject({ grade: "F" })]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.gpa).toBe(0);
  });

  it("errors on an empty subject list", () => {
    const result = calculateGpa([]);
    expect(result.ok).toBe(false);
  });

  it("errors when credit hours are 0 or negative", () => {
    const result = calculateGpa([subject({ creditHours: 0 })]);
    expect(result.ok).toBe(false);
  });

  it("errors on a non-finite credit hours value", () => {
    const result = calculateGpa([subject({ creditHours: NaN })]);
    expect(result.ok).toBe(false);
  });

  it("computes a perfect 4.0 GPA", () => {
    const result = calculateGpa([subject({ grade: "A", creditHours: 3 }), subject({ id: "2", grade: "A+", creditHours: 3 })]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.gpa).toBe(4.0);
  });
});
