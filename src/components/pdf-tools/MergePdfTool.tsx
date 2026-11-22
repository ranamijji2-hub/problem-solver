"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { formatBytes, MAX_FILES_PER_REQUEST } from "@/lib/pdf/constraints";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "merge-pdf",
    "/api/pdf/merge"
  );

  function move(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const a = next[index];
      const b = next[target];
      if (!a || !b) return prev;
      next[index] = b;
      next[target] = a;
      return next;
    });
  }

  async function handleSubmit() {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF files to merge"
          accept="application/pdf,.pdf"
          multiple
          maxFiles={MAX_FILES_PER_REQUEST}
          files={files}
          onFilesChange={setFiles}
          hint="Add 2 or more PDFs, up to 8MB each."
        />

        {files.length > 1 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-ink/50">Merge order — use the arrows to reorder</p>
            <ul className="mt-2 divide-y divide-line rounded-xs border border-line">
              {files.map((file, i) => (
                <li key={`${file.name}-${file.size}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" />
                    <span className="truncate text-sm text-ink/80">
                      {i + 1}. {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-ink/40">{formatBytes(file.size)}</span>
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${file.name} up`}
                      className="rounded-xs p-1 text-ink/40 hover:text-indigo-600 disabled:opacity-25"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === files.length - 1}
                      aria-label={`Move ${file.name} down`}
                      className="rounded-xs p-1 text-ink/40 hover:text-indigo-600 disabled:opacity-25"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <PdfActionBar
          status={status}
          disabled={files.length < 2}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Merge PDFs"
        />

        <div className="mt-4">
          <PdfResultPanel
            status={status}
            errorMessage={errorMessage}
            resultFilename={resultFilename}
            resultSize={resultSize}
            onDownload={download}
          />
        </div>
      </div>

      <HowToUse
        steps={[
          "Add two or more PDF files by dropping them in or choosing them from your device.",
          "Reorder them with the up/down arrows — this is the order they'll appear in the merged file.",
          "Select Merge PDFs, then download the combined file.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "report-part1.pdf + report-part2.pdf", output: "merged.pdf" }]} />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your merged PDF and are not stored afterward.
      </p>
    </div>
  );
}

export default MergePdfTool;
