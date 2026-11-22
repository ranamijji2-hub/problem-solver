import { describe, expect, it } from "vitest";
import { calculateCgpa, type CgpaSemester } from "./cgpa";

function semester(overrides: Partial<CgpaSemester> = {}): CgpaSemester {
  return { id: "1", label: "Semester 1", gpa: 3.5, creditHours: 15, ...overrides };
}

describe("calculateCgpa", () => {
  it("computes a credit-hour-weighted CGPA across semesters", () => {
    const result = calculateCgpa([
      semester({ id: "1", gpa: 4.0, creditHours: 15 }), // 60
      semester({ id: "2", gpa: 3.0, creditHours: 15 }), // 45
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.totalCreditHours).toBe(30);
      expect(result.cgpa).toBeCloseTo(3.5, 5);
    }
  });

  it("weights a semester with more credit hours more heavily", () => {
    const result = calculateCgpa([
      semester({ id: "1", gpa: 4.0, creditHours: 30 }),
      semester({ id: "2", gpa: 2.0, creditHours: 6 }),
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cgpa).toBeGreaterThan(3.5);
  });

  it("errors on an empty semester list", () => {
    const result = calculateCgpa([]);
    expect(result.ok).toBe(false);
  });

  it("errors when a GPA is out of the 0-4.0 range", () => {
    const result = calculateCgpa([semester({ gpa: 4.5 })]);
    expect(result.ok).toBe(false);
  });

  it("errors when credit hours are 0", () => {
    const result = calculateCgpa([semester({ creditHours: 0 })]);
    expect(result.ok).toBe(false);
  });

  it("accepts a boundary GPA of exactly 4.0", () => {
    const result = calculateCgpa([semester({ gpa: 4.0 })]);
    expect(result.ok).toBe(true);
  });
});
