/**
 * Attendance Calculator logic.
 *
 * Two independent projections, both derived without needing to know how
 * many classes remain in the term (a number students rarely know
 * precisely):
 *
 * - "classes needed to reach target": assumes every future class is
 *   attended (never missed) and finds the smallest number of additional
 *   classes needed to push the percentage up to the target.
 * - "max classes that can still be missed": assumes every future class
 *   *except* the missed ones is attended, and finds how many can be
 *   missed before the percentage would drop below the target — this is
 *   independent of how many classes remain, because both "held" and
 *   "total" grow together as classes happen; see calculation below.
 */

export interface AttendanceInput {
  totalClasses: number;
  attendedClasses: number;
  targetPercent: number;
}

export interface AttendanceResult {
  currentPercent: number;
  missedClasses: number;
  meetsTarget: boolean;
  /** Additional classes (attended, none missed) needed to reach the target. Null if already met or impossible. */
  classesNeededToReachTarget: number | null;
  /** Impossible-to-reach-target message, e.g. target is 100% but a class has already been missed. */
  targetImpossible: string | null;
  /** Classes that can still be missed going forward while staying at/above target. Null if already below target. */
  maxClassesCanMiss: number | null;
}

export type AttendanceCalcResult = { ok: true; result: AttendanceResult } | { ok: false; error: string };

export function calculateAttendance(input: AttendanceInput): AttendanceCalcResult {
  const { totalClasses, attendedClasses, targetPercent } = input;

  if (!Number.isFinite(totalClasses) || totalClasses <= 0) {
    return { ok: false, error: "Total classes held must be greater than 0." };
  }
  if (!Number.isFinite(attendedClasses) || attendedClasses < 0) {
    return { ok: false, error: "Classes attended can't be negative." };
  }
  if (attendedClasses > totalClasses) {
    return { ok: false, error: "Classes attended can't be more than total classes held." };
  }
  if (!Number.isFinite(targetPercent) || targetPercent <= 0 || targetPercent > 100) {
    return { ok: false, error: "Required attendance percentage must be between 1 and 100." };
  }

  const currentPercent = (attendedClasses / totalClasses) * 100;
  const missedClasses = totalClasses - attendedClasses;
  const meetsTarget = currentPercent >= targetPercent - 1e-9;

  let classesNeededToReachTarget: number | null = null;
  let targetImpossible: string | null = null;
  let maxClassesCanMiss: number | null = null;

  if (meetsTarget) {
    if (targetPercent === 100) {
      // Exactly meeting a 100% target means there have been no misses at all.
      maxClassesCanMiss = missedClasses === 0 ? 0 : null;
    } else {
      // attended / (total + m) = target/100  =>  m = attended*100/target - total
      const rawMax = (attendedClasses * 100) / targetPercent - totalClasses;
      maxClassesCanMiss = Math.max(0, Math.floor(rawMax + 1e-9));
    }
  } else {
    if (targetPercent === 100) {
      targetImpossible =
        "100% attendance is no longer reachable — at least one class has already been missed.";
    } else {
      // attended + x >= (target/100) * (total + x)  =>  x >= (target*total - 100*attended) / (100 - target)
      const rawNeeded =
        (targetPercent * totalClasses - 100 * attendedClasses) / (100 - targetPercent);
      classesNeededToReachTarget = Math.max(0, Math.ceil(rawNeeded - 1e-9));
    }
  }

  return {
    ok: true,
    result: {
      currentPercent,
      missedClasses,
      meetsTarget,
      classesNeededToReachTarget,
      targetImpossible,
      maxClassesCanMiss,
    },
  };
}
