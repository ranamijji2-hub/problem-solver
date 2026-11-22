"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { formatBytes } from "@/lib/pdf/constraints";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function CompressPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, errorMessage, resultFilename, resultSize, responseHeaders, submit, reset, download } =
    usePdfToolRequest("compress-pdf", "/api/pdf/compress");

  async function handleSubmit() {
    const file = files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    reset();
  }

  const originalSizeHeader = responseHeaders?.get("X-Original-Size");
  const compressedSizeHeader = responseHeaders?.get("X-Compressed-Size");
  const originalSize = originalSizeHeader ? Number(originalSizeHeader) : null;
  const compressedSize = compressedSizeHeader ? Number(compressedSizeHeader) : null;
  const savedPercent =
    originalSize !== null && compressedSize !== null && originalSize > 0
      ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
      : null;

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF file to compress"
          accept="application/pdf,.pdf"
          files={files}
          onFilesChange={setFiles}
          hint="Up to 8MB."
        />

        <PdfActionBar
          status={status}
          disabled={files.length === 0}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Compress PDF"
        />

        <div className="mt-4">
          <PdfResultPanel
            status={status}
            errorMessage={errorMessage}
            resultFilename={resultFilename}
            resultSize={resultSize}
            onDownload={download}
            successNote={
              savedPercent !== null && originalSize !== null
                ? savedPercent > 0
                  ? `${savedPercent}% smaller than the original ${formatBytes(originalSize)}`
                  : "already efficiently structured — little further savings possible"
                : undefined
            }
          />
        </div>
      </div>

      <p className="mt-4 rounded-xs border border-line bg-line/20 p-3 text-xs leading-relaxed text-ink/60">
        This compresses the PDF&apos;s internal structure (fonts, shared objects) — it does not
        re-encode embedded photos or scanned images, so results vary a lot by PDF. Documents
        with many fonts or form fields shrink the most; PDFs that are mostly scanned images will
        shrink the least.
      </p>

      <HowToUse
        steps={[
          "Upload the PDF you want to shrink.",
          "Select Compress PDF.",
          "Compare the before/after size, then download the result.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "Font-heavy 5 MB PDF", output: "Often 10-30% smaller" }]} />
    </div>
  );
}

export default CompressPdfTool;
