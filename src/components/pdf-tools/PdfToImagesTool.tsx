"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function PdfToImagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "pdf-to-jpg",
    "/api/pdf/to-images"
  );

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

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF file to convert"
          accept="application/pdf,.pdf"
          files={files}
          onFilesChange={setFiles}
          hint="Up to 8MB, 30 pages."
        />

        <PdfActionBar
          status={status}
          disabled={files.length === 0}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Convert to images"
        />

        <div className="mt-4">
          <PdfResultPanel
            status={status}
            errorMessage={errorMessage}
            resultFilename={resultFilename}
            resultSize={resultSize}
            onDownload={download}
            successNote={resultFilename?.endsWith(".zip") ? "one JPG per page, zipped" : undefined}
          />
        </div>
      </div>

      <HowToUse
        steps={[
          "Upload the PDF you want to convert.",
          "Select Convert to images — every page is rendered as a JPG.",
          "Download a single JPG (one-page PDFs) or a ZIP of all pages.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "5-page PDF", output: "5 JPG files, zipped" }]} />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your result and are not stored afterward.
      </p>
    </div>
  );
}

export default PdfToImagesTool;
