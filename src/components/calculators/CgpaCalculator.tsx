"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateCgpa, type CgpaSemester } from "@/lib/calculators/cgpa";
import { formatNumber, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { TextField } from "@/components/calculators/fields/TextField";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";
import { Button } from "@/components/ui/Button";
import { useRowId } from "@/lib/hooks/useRowId";

interface Row {
  id: string;
  label: string;
  gpa: string;
  creditHours: string;
}

function emptyRow(id: string, defaultLabel: string): Row {
  return { id, label: defaultLabel, gpa: "", creditHours: "15" };
}

export function CgpaCalculator() {
  const makeId = useRowId("semester");
  const [rows, setRows] = useState<Row[]>([
    emptyRow("semester-1", "Semester 1"),
    emptyRow("semester-2", "Semester 2"),
  ]);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(makeId(), `Semester ${prev.length + 1}`)]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function handleReset() {
    setRows([emptyRow("semester-1", "Semester 1"), emptyRow("semester-2", "Semester 2")]);
  }

  const { display, error } = useMemo(() => {
    const semesters: CgpaSemester[] = [];
    for (const row of rows) {
      const gpa = parseNumberInput(row.gpa);
      const credits = parseNumberInput(row.creditHours);
      if (gpa === null || credits === null) return { display: null, error: null }; // still typing
      semesters.push({ id: row.id, label: row.label, gpa, creditHours: credits });
    }
    const result = calculateCgpa(semesters);
    if (!result.ok) return { display: null, error: result.error };
    return {
      display: {
        value: formatNumber(result.cgpa, 2),
        description: `${formatNumber(result.totalCreditHours, 1)} total credit hours across ${semesters.length} semester${semesters.length === 1 ? "" : "s"}.`,
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
                id={`cgpa-label-${row.id}`}
                label={`Semester ${i + 1} name`}
                value={row.label}
                onChange={(v) => updateRow(row.id, { label: v })}
              />
              <NumberField
                id={`cgpa-gpa-${row.id}`}
                label="GPA"
                value={row.gpa}
                onChange={(v) => updateRow(row.id, { gpa: v })}
                placeholder="0.00–4.00"
                className="w-full sm:w-28"
              />
              <NumberField
                id={`cgpa-credits-${row.id}`}
                label="Credit hours"
                value={row.creditHours}
                onChange={(v) => updateRow(row.id, { creditHours: v })}
                className="w-full sm:w-28"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                aria-label={`Remove ${row.label || `semester ${i + 1}`}`}
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
            Add semester
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
            <ResultCard label="CGPA" value={display.value} description={display.description} copyText={display.value} />
          ) : (
            <p className="text-sm text-ink/45">Enter each semester&apos;s GPA and credit hours.</p>
          )}
        </div>
      </div>

      <HowToUse
        steps={[
          "Add a row for each completed semester.",
          "Enter that semester's GPA (0.00–4.00) and total credit hours.",
          "Add or remove semesters as needed.",
          "Your cumulative, credit-hour-weighted CGPA updates automatically.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "Sem 1: 4.0 GPA, 15 credits · Sem 2: 3.0 GPA, 15 credits", output: "CGPA 3.50" },
        ]}
      />
    </div>
  );
}

export default CgpaCalculator;
