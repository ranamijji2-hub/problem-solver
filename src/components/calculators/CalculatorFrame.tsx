"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CalculatorFrame({
  fields,
  result,
  onReset,
}: {
  fields: ReactNode;
  result: ReactNode;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xs border border-line p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields}</div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-ink/45">Updates instantly as you type.</p>
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      {result && <div className="mt-5 border-t border-line pt-5">{result}</div>}
    </div>
  );
}
