"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { TextField } from "@/components/calculators/fields/TextField";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function ExtractPdfPagesTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState("");
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "extract-pdf-pages",
    "/api/pdf/extract-pages"
  );

  async function handleSubmit() {
    const file = files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    formData.append("pages", pages);
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    setPages("");
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF file"
          accept="application/pdf,.pdf"
          files={files}
          onFilesChange={setFiles}
          hint="Up to 8MB."
        />

        <div className="mt-4 max-w-sm">
          <TextField
            id="extract-pages"
            label="Pages to extract"
            value={pages}
            onChange={setPages}
            placeholder="e.g. 1, 3, 5-7"
          />
        </div>

        <PdfActionBar
          status={status}
          disabled={files.length === 0 || pages.trim() === ""}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Extract pages"
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
          "Upload the PDF you want to pull pages from.",
          'List the pages you want, e.g. "1, 3, 5-7" — order and duplicates in your list are ignored; pages come out in original document order.',
          "Download the new PDF containing just those pages.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "20-page PDF, pages 1, 3, 5-7", output: "One 5-page PDF" }]} />
      <p className="mt-4 text-xs text-ink/45">
        This pulls the pages into a single new PDF. Need each page as its own file instead? Use
        the Split PDF tool&apos;s custom ranges mode.
      </p>
    </div>
  );
}

export default ExtractPdfPagesTool;
