/**
 * GPA Calculator logic.
 *
 * Uses the common US-style 4.0 letter-grade scale. This is a simplifying
 * choice — many institutions use their own scale — called out in the
 * tool's FAQ rather than hidden. A custom/editable scale is a reasonable
 * future enhancement, not required for Phase 2.
 */

export const GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
} as const;

export type Grade = keyof typeof GRADE_POINTS;

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS) as Grade[];

export interface GpaSubject {
  id: string;
  name: string;
  creditHours: number;
  grade: Grade;
}

export type GpaResult =
  | { ok: true; gpa: number; totalCreditHours: number; totalQualityPoints: number }
  | { ok: false; error: string };

export function calculateGpa(subjects: GpaSubject[]): GpaResult {
  if (subjects.length === 0) {
    return { ok: false, error: "Add at least one subject." };
  }

  let totalCreditHours = 0;
  let totalQualityPoints = 0;

  for (const subject of subjects) {
    if (!Number.isFinite(subject.creditHours) || subject.creditHours <= 0) {
      return {
        ok: false,
        error: `"${subject.name || "A subject"}" needs credit hours greater than 0.`,
      };
    }
    const points = GRADE_POINTS[subject.grade];
    if (points === undefined) {
      return { ok: false, error: `"${subject.name || "A subject"}" has an invalid grade.` };
    }
    totalCreditHours += subject.creditHours;
    totalQualityPoints += subject.creditHours * points;
  }

  if (totalCreditHours === 0) {
    return { ok: false, error: "Total credit hours must be greater than 0." };
  }

  return {
    ok: true,
    gpa: totalQualityPoints / totalCreditHours,
    totalCreditHours,
    totalQualityPoints,
  };
}
