/**
 * CGPA Calculator logic: cumulative weighted average of per-semester GPAs,
 * weighted by each semester's credit hours. Deliberately separate from
 * gpa.ts (which computes one semester's GPA from individual subjects) —
 * a CGPA calculation only needs each semester's already-known GPA and
 * credit-hour total, not its subject breakdown.
 */

export interface CgpaSemester {
  id: string;
  label: string;
  gpa: number;
  creditHours: number;
}

export type CgpaResult =
  | { ok: true; cgpa: number; totalCreditHours: number }
  | { ok: false; error: string };

export function calculateCgpa(semesters: CgpaSemester[]): CgpaResult {
  if (semesters.length === 0) {
    return { ok: false, error: "Add at least one semester." };
  }

  let totalCreditHours = 0;
  let totalQualityPoints = 0;

  for (const semester of semesters) {
    const label = semester.label || "A semester";
    if (!Number.isFinite(semester.gpa) || semester.gpa < 0 || semester.gpa > 4.0) {
      return { ok: false, error: `${label} needs a GPA between 0 and 4.0.` };
    }
    if (!Number.isFinite(semester.creditHours) || semester.creditHours <= 0) {
      return { ok: false, error: `${label} needs credit hours greater than 0.` };
    }
    totalCreditHours += semester.creditHours;
    totalQualityPoints += semester.gpa * semester.creditHours;
  }

  return { ok: true, cgpa: totalQualityPoints / totalCreditHours, totalCreditHours };
}
