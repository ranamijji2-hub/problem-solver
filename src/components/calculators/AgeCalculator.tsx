"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateAge } from "@/lib/calculators/age";
import { formatNumber } from "@/lib/calculators/format";
import { DateField } from "@/components/calculators/fields/DateField";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

function todayIso(): string {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

export function AgeCalculator() {
  const [dob, setDob] = useState("");
  // Seeded empty rather than with today's date: this component can be
  // server-rendered (next/dynamic defaults to ssr: true), and "today"
  // computed on the server can differ from the browser's local date near
  // a midnight/timezone boundary — seeding state from it would cause a
  // hydration mismatch. Populated client-side after mount instead, the
  // same pattern already used in ThemeToggle for the same reason.
  const [asOf, setAsOf] = useState("");
  const [maxDob, setMaxDob] = useState<string | undefined>(undefined);

  useEffect(() => {
    const today = todayIso();
    setAsOf(today);
    setMaxDob(today);
  }, []);

  const { display, error } = useMemo(() => {
    if (!dob) return { display: null, error: null };
    const dobDate = parseIsoDateLocal(dob);
    const asOfDate = asOf ? parseIsoDateLocal(asOf) : new Date();
    const result = calculateAge(dobDate, asOfDate);
    if (!result.ok) return { display: null, error: result.error };
    const { years, months, days, totalDays } = result.age;
    return {
      display: {
        value: `${years}y ${months}m ${days}d`,
        description: `That's ${formatNumber(totalDays, 0)} total days.`,
      },
      error: null,
    };
  }, [dob, asOf]);

  function handleReset() {
    setDob("");
    setAsOf(todayIso());
  }

  return (
    <div>
      <CalculatorFrame
        fields={
          <>
            <DateField id="age-dob" label="Date of birth" value={dob} onChange={setDob} max={maxDob} />
            <DateField id="age-asof" label="Calculate age as of" value={asOf} onChange={setAsOf} hint="Defaults to today." />
          </>
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <ResultCard label="Age" value={display.value} description={display.description} copyText={display.value} />
          ) : (
            <p className="text-sm text-ink/45">Enter a date of birth to see the result.</p>
          )
        }
      />

      <HowToUse
        steps={[
          "Enter the date of birth.",
          'Optionally change the "as of" date — it defaults to today.',
          "Your exact age in years, months, and days appears instantly.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "Born Jan 15, 2000 → today", output: "e.g. 25y 6m 12d" },
          { input: "Born on a leap day (Feb 29)", output: "Handled correctly" },
        ]}
      />
    </div>
  );
}

export default AgeCalculator;
