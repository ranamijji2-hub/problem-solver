"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PdfToolStatus } from "@/lib/hooks/usePdfToolRequest";

export function PdfActionBar({
  status,
  disabled,
  onSubmit,
  onReset,
  submitLabel = "Process file",
}: {
  status: PdfToolStatus;
  disabled: boolean;
  onSubmit: () => void;
  onReset: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <Button type="button" onClick={onSubmit} disabled={disabled || status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Processing…
          </>
        ) : (
          submitLabel
        )}
      </Button>
      <Button type="button" variant="secondary" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
