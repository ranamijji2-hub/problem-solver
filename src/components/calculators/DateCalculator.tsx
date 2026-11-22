"use client";

import { useEffect, useMemo, useState } from "react";
import { dateDifference, addDaysToDate, subtractDaysFromDate } from "@/lib/calculators/date";
import { formatNumber, parseNumberInput } from "@/lib/calculators/format";
import { DateField } from "@/components/calculators/fields/DateField";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

type Mode = "difference" | "add" | "subtract";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "difference", label: "Difference between dates" },
  { value: "add", label: "Add days" },
  { value: "subtract", label: "Subtract days" },
];

function todayIso(): string {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function DateCalculator() {
  const [mode, setMode] = useState<Mode>("difference");
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  // Seeded empty, not with today's date — same hydration-mismatch reasoning
  // as AgeCalculator (this component can be server-rendered, and "today"
  // computed on the server can differ from the browser's local date).
  const [baseDate, setBaseDate] = useState("");
  const [days, setDays] = useState("");

  useEffect(() => {
    setBaseDate(todayIso());
  }, []);

  const { display, error } = useMemo(() => {
    if (mode === "difference") {
      if (!dateA || !dateB) return { display: null, error: null };
      const result = dateDifference(parseIsoDateLocal(dateA), parseIsoDateLocal(dateB));
      if (!result.ok) return { display: null, error: result.error };
      const { years, months, days: d, totalDays, reversed } = result.diff;
      return {
        display: {
          value: `${years}y ${months}m ${d}d`,
          description: `${formatNumber(totalDays, 0)} total days${reversed ? " (second date is before the first)" : ""}.`,
        },
        error: null,
      };
    }

    const numDays = parseNumberInput(days);
    if (!baseDate || numDays === null) return { display: null, error: null };
    const fn = mode === "add" ? addDaysToDate : subtractDaysFromDate;
    const result = fn(parseIsoDateLocal(baseDate), numDays);
    if (!result.ok) return { display: null, error: result.error };
    return {
      display: { value: formatDateLong(result.result), description: null },
      error: null,
    };
  }, [mode, dateA, dateB, baseDate, days]);

  function handleReset() {
    setDateA("");
    setDateB("");
    setBaseDate(todayIso());
    setDays("");
  }

  return (
    <div>
      <div className="mb-4">
        <SegmentedControl label="Calculation type" options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </div>

      <CalculatorFrame
        fields={
          mode === "difference" ? (
            <>
              <DateField id="date-a" label="First date" value={dateA} onChange={setDateA} />
              <DateField id="date-b" label="Second date" value={dateB} onChange={setDateB} />
            </>
          ) : (
            <>
              <DateField id="date-base" label="Start date" value={baseDate} onChange={setBaseDate} />
              <NumberField
                id="date-days"
                label={mode === "add" ? "Days to add" : "Days to subtract"}
                value={days}
                onChange={setDays}
              />
            </>
          )
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <ResultCard
              label={mode === "difference" ? "Difference" : "Resulting date"}
              value={display.value}
              description={display.description ?? undefined}
              copyText={display.value}
            />
          ) : (
            <p className="text-sm text-ink/45">
              {mode === "difference" ? "Enter both dates to see the difference." : "Enter a date and a number of days."}
            </p>
          )
        }
      />

      <HowToUse
        steps={[
          "Choose whether you want the difference between two dates, or to add/subtract days from a date.",
          "Fill in the fields — dates use your device's native date picker.",
          "The result updates instantly.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "Jan 1, 2024 → Mar 1, 2024", output: "2 months, 60 days total" },
          { input: "Jan 25, 2024 + 10 days", output: "February 4, 2024" },
        ]}
      />
    </div>
  );
}

export default DateCalculator;
