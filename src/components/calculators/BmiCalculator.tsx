"use client";

import { useMemo, useState } from "react";
import { calculateBmi, type HeightUnit, type WeightUnit } from "@/lib/calculators/bmi";
import { formatNumber, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
];
const HEIGHT_UNIT_OPTIONS: { value: HeightUnit; label: string }[] = [
  { value: "cm", label: "cm" },
  { value: "ft-in", label: "ft / in" },
];

const CATEGORY_TONE = {
  Underweight: "amber",
  "Normal weight": "teal",
  Overweight: "amber",
  Obesity: "amber",
} as const;

export function BmiCalculator() {
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  const { display, error } = useMemo(() => {
    const w = parseNumberInput(weight);
    if (w === null) return { display: null, error: null };

    if (heightUnit === "cm") {
      const h = parseNumberInput(heightCm);
      if (h === null) return { display: null, error: null };
      const result = calculateBmi({ weight: w, weightUnit, heightCm: h, heightUnit });
      if (!result.ok) return { display: null, error: result.error };
      return {
        display: { value: formatNumber(result.result.bmi, 1), category: result.result.category },
        error: null,
      };
    }

    const ft = parseNumberInput(heightFeet) ?? 0;
    const inches = parseNumberInput(heightInches) ?? 0;
    if (heightFeet === "" && heightInches === "") return { display: null, error: null };
    const result = calculateBmi({ weight: w, weightUnit, heightFeet: ft, heightInches: inches, heightUnit });
    if (!result.ok) return { display: null, error: result.error };
    return {
      display: { value: formatNumber(result.result.bmi, 1), category: result.result.category },
      error: null,
    };
  }, [weight, weightUnit, heightUnit, heightCm, heightFeet, heightInches]);

  function handleReset() {
    setWeight("");
    setHeightCm("");
    setHeightFeet("");
    setHeightInches("");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        <SegmentedControl label="Weight unit" options={WEIGHT_UNIT_OPTIONS} value={weightUnit} onChange={setWeightUnit} />
        <SegmentedControl label="Height unit" options={HEIGHT_UNIT_OPTIONS} value={heightUnit} onChange={setHeightUnit} />
      </div>

      <CalculatorFrame
        fields={
          <>
            <NumberField id="bmi-weight" label="Weight" value={weight} onChange={setWeight} suffix={weightUnit} />
            {heightUnit === "cm" ? (
              <NumberField id="bmi-height-cm" label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <NumberField id="bmi-height-ft" label="Height (feet)" value={heightFeet} onChange={setHeightFeet} suffix="ft" />
                <NumberField id="bmi-height-in" label="Height (inches)" value={heightInches} onChange={setHeightInches} suffix="in" />
              </div>
            )}
          </>
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <ResultCard
              label="BMI"
              value={display.value}
              description={`Category: ${display.category}`}
              copyText={`${display.value} (${display.category})`}
              tone={CATEGORY_TONE[display.category]}
            />
          ) : (
            <p className="text-sm text-ink/45">Enter your weight and height to see your BMI.</p>
          )
        }
      />

      <p className="mt-4 rounded-xs border border-line bg-line/20 p-3 text-xs leading-relaxed text-ink/60">
        BMI is a general screening indicator, not a medical diagnosis. It doesn&apos;t account for
        muscle mass, bone density, age, or sex. Talk to a healthcare professional for guidance
        specific to you.
      </p>

      <HowToUse
        steps={[
          "Choose your preferred weight and height units.",
          "Enter your weight and height.",
          "Your BMI and general category appear instantly.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "70 kg, 175 cm", output: "22.9 — Normal weight" },
          { input: "154 lb, 5 ft 9 in", output: "22.7 — Normal weight" },
        ]}
      />
    </div>
  );
}

export default BmiCalculator;
