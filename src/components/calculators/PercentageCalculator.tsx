"use client";

import { useMemo, useState } from "react";
import {
  percentOf,
  whatPercentIs,
  percentageChange,
  percentageDifference,
} from "@/lib/calculators/percentage";
import { formatNumber, formatPercent, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";
import { trackEvent } from "@/lib/analytics/events";

type Mode = "of" | "is-what-percent" | "change" | "difference";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "of", label: "X% of Y" },
  { value: "is-what-percent", label: "X is what % of Y" },
  { value: "change", label: "% increase/decrease" },
  { value: "difference", label: "% difference" },
];

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const numA = parseNumberInput(a);
  const numB = parseNumberInput(b);

  const { display, error } = useMemo(() => {
    if (numA === null || numB === null) return { display: null, error: null };

    if (mode === "of") {
      const r = percentOf(numA, numB);
      return { display: { label: r.label, value: formatNumber(r.value) }, error: null };
    }
    if (mode === "is-what-percent") {
      const r = whatPercentIs(numA, numB);
      if ("error" in r) return { display: null, error: r.error };
      return { display: { label: r.label, value: formatPercent(r.value) }, error: null };
    }
    if (mode === "change") {
      const r = percentageChange(numA, numB);
      if ("error" in r) return { display: null, error: r.error };
      const label =
        r.direction === "no change" ? "No change" : `Percentage ${r.direction}`;
      return { display: { label, value: formatPercent(r.percent) }, error: null };
    }
    const r = percentageDifference(numA, numB);
    if ("error" in r) return { display: null, error: r.error };
    return { display: { label: r.label, value: formatPercent(r.value) }, error: null };
  }, [mode, numA, numB]);

  const labels: Record<Mode, [string, string]> = {
    of: ["Percentage (X)", "Of value (Y)"],
    "is-what-percent": ["Value (X)", "Total (Y)"],
    change: ["From value", "To value"],
    difference: ["First value", "Second value"],
  };
  const [labelA, labelB] = labels[mode];

  function handleReset() {
    setA("");
    setB("");
  }

  function handleModeChange(next: Mode) {
    setMode(next);
    trackEvent({ eventType: "tool_start", toolSlug: "percentage-calculator", metadata: { mode: next } });
  }

  return (
    <div>
      <div className="mb-4">
        <SegmentedControl label="Calculation type" options={MODE_OPTIONS} value={mode} onChange={handleModeChange} />
      </div>

      <CalculatorFrame
        fields={
          <>
            <NumberField id="percent-a" label={labelA} value={a} onChange={setA} suffix={mode === "of" ? "%" : undefined} />
            <NumberField id="percent-b" label={labelB} value={b} onChange={setB} />
          </>
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <ResultCard label={display.label} value={display.value} copyText={display.value} />
          ) : (
            <p className="text-sm text-ink/45">Enter both values to see the result.</p>
          )
        }
      />

      <HowToUse
        steps={[
          "Choose the type of percentage calculation you need at the top.",
          "Enter the two numbers the calculation needs.",
          "Your result appears instantly below — no button to press.",
          "Use Copy to paste the result elsewhere, or Reset to start over.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "20% of 150", output: "30" },
          { input: "30 is what % of 150", output: "20%" },
          { input: "100 → 120 (change)", output: "20% increase" },
          { input: "Difference between 10 and 20", output: "66.67%" },
        ]}
      />
    </div>
  );
}

export default PercentageCalculator;
