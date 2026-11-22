import { describe, expect, it } from "vitest";
import { calculateBmi, bmiCategory } from "./bmi";

describe("calculateBmi", () => {
  it("computes BMI in metric units", () => {
    // 70kg, 1.75m -> 70 / 1.75^2 = 22.857...
    const result = calculateBmi({ weight: 70, weightUnit: "kg", heightCm: 175, heightUnit: "cm" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.bmi).toBeCloseTo(22.857, 2);
      expect(result.result.category).toBe("Normal weight");
    }
  });

  it("converts imperial weight and height correctly", () => {
    // 154 lb ≈ 69.85 kg, 5'9" ≈ 1.7526 m -> BMI ≈ 22.74
    const result = calculateBmi({
      weight: 154,
      weightUnit: "lb",
      heightFeet: 5,
      heightInches: 9,
      heightUnit: "ft-in",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.bmi).toBeCloseTo(22.74, 1);
  });

  it("errors on zero or negative weight", () => {
    expect(calculateBmi({ weight: 0, weightUnit: "kg", heightCm: 170, heightUnit: "cm" }).ok).toBe(false);
    expect(calculateBmi({ weight: -5, weightUnit: "kg", heightCm: 170, heightUnit: "cm" }).ok).toBe(false);
  });

  it("errors on zero height", () => {
    const result = calculateBmi({ weight: 70, weightUnit: "kg", heightCm: 0, heightUnit: "cm" });
    expect(result.ok).toBe(false);
  });

  it("errors on an unrealistic height or weight", () => {
    expect(calculateBmi({ weight: 70, weightUnit: "kg", heightCm: 400, heightUnit: "cm" }).ok).toBe(false);
    expect(calculateBmi({ weight: 900, weightUnit: "kg", heightCm: 175, heightUnit: "cm" }).ok).toBe(false);
  });

  it("errors when feet and inches are both 0", () => {
    const result = calculateBmi({ weight: 70, weightUnit: "kg", heightFeet: 0, heightInches: 0, heightUnit: "ft-in" });
    expect(result.ok).toBe(false);
  });
});

describe("bmiCategory", () => {
  it("classifies each band correctly, including boundaries", () => {
    expect(bmiCategory(18.4)).toBe("Underweight");
    expect(bmiCategory(18.5)).toBe("Normal weight");
    expect(bmiCategory(24.9)).toBe("Normal weight");
    expect(bmiCategory(25)).toBe("Overweight");
    expect(bmiCategory(29.9)).toBe("Overweight");
    expect(bmiCategory(30)).toBe("Obesity");
    expect(bmiCategory(40)).toBe("Obesity");
  });
});
