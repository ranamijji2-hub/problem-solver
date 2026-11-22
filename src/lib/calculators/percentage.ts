/**
 * Percentage Calculator logic.
 *
 * Supports the five modes named in the brief. Each function is pure and
 * takes plain numbers so the UI layer only has to parse input and format
 * output — see src/lib/calculators/format.ts for both.
 */

export interface PercentResult {
  value: number;
  label: string;
}

/** X% of Y, e.g. 20% of 150 = 30. */
export function percentOf(percent: number, of: number): PercentResult {
  return { value: (percent / 100) * of, label: `${percent}% of ${of}` };
}

/** X is what percent of Y, e.g. 30 is 20% of 150. Y must not be 0. */
export function whatPercentIs(x: number, y: number): PercentResult | { error: string } {
  if (y === 0) return { error: "The second number can't be 0 — there's nothing to compare against." };
  return { value: (x / y) * 100, label: `${x} is what % of ${y}` };
}

export interface PercentChangeResult {
  percent: number; // always non-negative
  direction: "increase" | "decrease" | "no change";
}

/**
 * Percentage increase or decrease from `from` to `to`. `from` must not be
 * 0 (a percentage change from zero is undefined — there is no baseline to
 * measure against).
 */
export function percentageChange(from: number, to: number): PercentChangeResult | { error: string } {
  if (from === 0) {
    return { error: "The starting value can't be 0 — percentage change needs a non-zero baseline." };
  }
  const change = ((to - from) / Math.abs(from)) * 100;
  if (change === 0) return { percent: 0, direction: "no change" };
  return { percent: Math.abs(change), direction: change > 0 ? "increase" : "decrease" };
}

/**
 * Percentage difference between two values, a symmetric measure (order of
 * the arguments doesn't matter) defined relative to the average of the two
 * values. Both values being 0 is undefined.
 */
export function percentageDifference(a: number, b: number): PercentResult | { error: string } {
  if (a === 0 && b === 0) {
    return { error: "Both values are 0 — there's no difference to express as a percentage." };
  }
  const diff = (Math.abs(a - b) / ((Math.abs(a) + Math.abs(b)) / 2)) * 100;
  return { value: diff, label: `Difference between ${a} and ${b}` };
}
