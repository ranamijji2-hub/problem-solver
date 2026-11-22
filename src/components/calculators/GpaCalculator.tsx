"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateGpa, GRADE_OPTIONS, type Grade, type GpaSubject } from "@/lib/calculators/gpa";
import { formatNumber, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { TextField } from "@/components/calculators/fields/TextField";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";
import { Button } from "@/components/ui/Button";
import { useRowId } from "@/lib/hooks/useRowId";

interface Row {
  id: string;
  name: string;
  creditHours: string;
  grade: Grade;
}

const GRADE_SELECT_OPTIONS = GRADE_OPTIONS.map((g) => ({ value: g, label: g }));

function emptyRow(id: string): Row {
  return { id, name: "", creditHours: "3", grade: "A" };
}

export function GpaCalculator() {
  const makeId = useRowId("subject");
  const [rows, setRows] = useState<Row[]>([emptyRow("subject-1"), emptyRow("subject-2")]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(makeId())]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function handleReset() {
    setRows([emptyRow("subject-1"), emptyRow("subject-2")]);
  }

  const { display, error } = useMemo(() => {
    const subjects: GpaSubject[] = [];
    for (const row of rows) {
      const credits = parseNumberInput(row.creditHours);
      if (credits === null) return { display: null, error: null }; // still typing
      subjects.push({ id: row.id, name: row.name, creditHours: credits, grade: row.grade });
    }
    const result = calculateGpa(subjects);
    if (!result.ok) return { display: null, error: result.error };
    return {
      display: {
        value: formatNumber(result.gpa, 2),
        description: `${formatNumber(result.totalCreditHours, 1)} total credit hours.`,
      },
      error: null,
    };
  }, [rows]);

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <div className="space-y-4">
          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-1 gap-3 border-b border-line pb-4 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <TextField
                id={`gpa-name-${row.id}`}
                label={`Subject ${i + 1} name`}
                value={row.name}
                onChange={(v) => updateRow(row.id, { name: v })}
                placeholder="e.g. Calculus I"
              />
              <NumberField
                id={`gpa-credits-${row.id}`}
                label="Credit hours"
                value={row.creditHours}
                onChange={(v) => updateRow(row.id, { creditHours: v })}
                className="w-full sm:w-28"
              />
              <SelectField
                id={`gpa-grade-${row.id}`}
                label="Grade"
                value={row.grade}
                onChange={(v) => updateRow(row.id, { grade: v as Grade })}
                options={GRADE_SELECT_OPTIONS}
                className="w-full sm:w-24"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                aria-label={`Remove ${row.name || `subject ${i + 1}`}`}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-xs border border-line text-ink/50 transition-colors hover:border-danger hover:text-danger disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add subject
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <ResultCard label="GPA" value={display.value} description={display.description} copyText={display.value} />
          ) : (
            <p className="text-sm text-ink/45">Add credit hours and a grade for each subject.</p>
          )}
        </div>
      </div>

      <HowToUse
        steps={[
          "Add a row for each subject you're taking this semester.",
          "Enter its credit hours and select the grade you received (or expect).",
          "Add or remove subjects with the buttons below the list.",
          "Your weighted GPA updates automatically.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "3 credits @ A, 4 credits @ B", output: "GPA 3.43" },
          { input: "All subjects @ A", output: "GPA 4.00" },
        ]}
      />

      <p className="mt-4 text-xs text-ink/45">
        Uses a standard 4.0 letter-grade scale (A+/A = 4.0 down to F = 0.0). If your institution
        uses a different scale, treat this as an estimate.
      </p>
    </div>
  );
}

export default GpaCalculator;
