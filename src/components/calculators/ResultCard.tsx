"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

export function ResultCard({
  label,
  value,
  description,
  copyText,
  tone = "indigo",
}: {
  label: string;
  value: string;
  description?: string;
  /** Plain-text value to copy; omit to hide the copy button. */
  copyText?: string;
  tone?: "indigo" | "amber" | "teal";
}) {
  const [copied, copy] = useCopyToClipboard();

  const toneStyles = {
    indigo: "border-indigo-200 bg-indigo-50/60",
    amber: "border-amber-200 bg-amber-50/60",
    teal: "border-teal-100 bg-teal-50/60",
  } as const;

  return (
    <div className={cn("rounded-xs border p-5", toneStyles[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink sm:text-3xl">{value}</p>
          {description && <p className="mt-1.5 text-sm text-ink/60">{description}</p>}
        </div>
        {copyText && (
          <button
            type="button"
            onClick={() => copy(copyText)}
            aria-label="Copy result"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xs border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-indigo-400 hover:text-indigo-600"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
