/**
 * Shared helpers for calculator logic. Every calculation module in this
 * folder returns plain data (numbers/strings), never JSX, so it can be
 * unit tested without a DOM and reused if a calculator's UI changes.
 */

/** True for a number that is safe to show to a user (not NaN, not ±Infinity). */
export function isDisplayable(n: number): boolean {
  return Number.isFinite(n);
}

/**
 * Formats a number for display with a fixed max number of decimals,
 * trimming trailing zeros, and using locale-aware thousands separators.
 * Returns "—" for anything that isn't finite so NaN/Infinity never reach
 * the screen.
 */
export function formatNumber(n: number, maxDecimals = 2): string {
  if (!isDisplayable(n)) return "—";
  // Avoid "-0"
  const value = Object.is(n, -0) ? 0 : n;
  return value.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}

/** Formats a number as a percentage string, e.g. 82.5 -> "82.5%". */
export function formatPercent(n: number, maxDecimals = 2): string {
  if (!isDisplayable(n)) return "—";
  return `${formatNumber(n, maxDecimals)}%`;
}

/** Parses a form input string into a finite number, or null if invalid/empty. */
export function parseNumberInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export interface FieldValidation {
  valid: boolean;
  error?: string;
}

export function validateRange(
  value: number | null,
  { min, max, label, required = true }: { min?: number; max?: number; label: string; required?: boolean }
): FieldValidation {
  if (value === null) {
    return required ? { valid: false, error: `Enter ${label}.` } : { valid: true };
  }
  if (!Number.isFinite(value)) {
    return { valid: false, error: `${label} must be a valid number.` };
  }
  if (min !== undefined && value < min) {
    return { valid: false, error: `${label} must be ${min} or more.` };
  }
  if (max !== undefined && value > max) {
    return { valid: false, error: `${label} must be ${max} or less.` };
  }
  return { valid: true };
}
