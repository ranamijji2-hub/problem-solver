"use client";

import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/pdf/constraints";
import type { PdfToolStatus } from "@/lib/hooks/usePdfToolRequest";

export function PdfResultPanel({
  status,
  errorMessage,
  resultFilename,
  resultSize,
  onDownload,
  successNote,
}: {
  status: PdfToolStatus;
  errorMessage: string | null;
  resultFilename: string | null;
  resultSize: number | null;
  onDownload: () => void;
  /** Optional extra line under the success state, e.g. compression savings. */
  successNote?: string;
}) {
  if (status === "loading") {
    return (
      <div role="status" className="flex items-center gap-3 rounded-xs border border-line bg-line/10 p-4 text-sm text-ink/70">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
        Processing your file — this usually takes a few seconds.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-xs border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{errorMessage ?? "Something went wrong. Please try again."}</span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-xs border border-teal-100 bg-teal-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">Done — {resultFilename}</p>
              <p className="text-xs text-ink/55">
                {resultSize !== null && formatBytes(resultSize)}
                {successNote ? ` · ${successNote}` : ""}
              </p>
            </div>
          </div>
          <Button type="button" size="sm" onClick={onDownload}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
