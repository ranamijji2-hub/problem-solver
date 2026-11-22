/**
 * BMI Calculator logic.
 *
 * BMI is computed in metric (kg, m) internally; imperial input is
 * converted to metric first so there is a single calculation path. This
 * is a general screening indicator, not a diagnosis — the category labels
 * and copy throughout intentionally avoid medical claims (see the
 * "note" field and the tool's page copy).
 */

export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft-in";

export interface BmiInput {
  weight: number;
  weightUnit: WeightUnit;
  // For "cm": height in centimeters. For "ft-in": use heightFeet + heightInches instead.
  heightCm?: number;
  heightFeet?: number;
  heightInches?: number;
  heightUnit: HeightUnit;
}

export type BmiCategory = "Underweight" | "Normal weight" | "Overweight" | "Obesity";

export interface BmiOutput {
  bmi: number;
  category: BmiCategory;
}

export type BmiCalcResult = { ok: true; result: BmiOutput } | { ok: false; error: string };

const LB_TO_KG = 0.45359237;
const IN_TO_M = 0.0254;

export function calculateBmi(input: BmiInput): BmiCalcResult {
  const { weight, weightUnit, heightUnit } = input;

  if (!Number.isFinite(weight) || weight <= 0) {
    return { ok: false, error: "Enter a weight greater than 0." };
  }

  const weightKg = weightUnit === "kg" ? weight : weight * LB_TO_KG;
  if (weightKg <= 0 || weightKg > 500) {
    return { ok: false, error: "Enter a realistic weight." };
  }

  let heightM: number;
  if (heightUnit === "cm") {
    const heightCm = input.heightCm;
    if (!Number.isFinite(heightCm) || (heightCm as number) <= 0) {
      return { ok: false, error: "Enter a height greater than 0." };
    }
    heightM = (heightCm as number) / 100;
  } else {
    const feet = input.heightFeet ?? 0;
    const inches = input.heightInches ?? 0;
    if (!Number.isFinite(feet) || !Number.isFinite(inches) || feet < 0 || inches < 0) {
      return { ok: false, error: "Enter a valid height in feet and inches." };
    }
    if (feet === 0 && inches === 0) {
      return { ok: false, error: "Enter a height greater than 0." };
    }
    heightM = (feet * 12 + inches) * IN_TO_M;
  }

  if (heightM <= 0 || heightM > 2.75) {
    return { ok: false, error: "Enter a realistic height." };
  }

  const bmi = weightKg / (heightM * heightM);

  if (!Number.isFinite(bmi)) {
    return { ok: false, error: "Couldn't calculate BMI from those values — double-check them." };
  }

  return { ok: true, result: { bmi, category: bmiCategory(bmi) } };
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}
