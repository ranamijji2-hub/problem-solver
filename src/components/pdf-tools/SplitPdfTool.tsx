"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { TextField } from "@/components/calculators/fields/TextField";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

type Mode = "every-page" | "ranges";

const SPLIT_MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "every-page", label: "Every page separately" },
  { value: "ranges", label: "Custom page ranges" },
];

export function SplitPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("every-page");
  const [ranges, setRanges] = useState("");
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "split-pdf",
    "/api/pdf/split"
  );

  async function handleSubmit() {
    const formData = new FormData();
    const file = files[0];
    if (!file) return;
    formData.append("files", file);
    formData.append("mode", mode);
    if (mode === "ranges") formData.append("ranges", ranges);
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    setRanges("");
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF file to split"
          accept="application/pdf,.pdf"
          files={files}
          onFilesChange={setFiles}
          hint="Up to 8MB."
        />

        <div className="mt-4">
          <SegmentedControl
            label="Split method"
            options={SPLIT_MODE_OPTIONS}
            value={mode}
            onChange={setMode}
          />
        </div>

        {mode === "ranges" && (
          <div className="mt-4 max-w-sm">
            <TextField
              id="split-ranges"
              label="Page ranges (one output file per group)"
              value={ranges}
              onChange={setRanges}
              placeholder="e.g. 1-3, 4, 5-7"
            />
          </div>
        )}

        <PdfActionBar
          status={status}
          disabled={files.length === 0 || (mode === "ranges" && ranges.trim() === "")}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Split PDF"
        />

        <div className="mt-4">
          <PdfResultPanel
            status={status}
            errorMessage={errorMessage}
            resultFilename={resultFilename}
            resultSize={resultSize}
            onDownload={download}
            successNote={resultFilename?.endsWith(".zip") ? "multiple files, zipped" : undefined}
          />
        </div>
      </div>

      <HowToUse
        steps={[
          'Upload the PDF you want to split.',
          'Choose "Every page separately" for one file per page, or "Custom page ranges" to define your own groups.',
          "For custom ranges, separate groups with commas — each group becomes its own file.",
          "Download the result — a single PDF, or a ZIP if the split produced more than one file.",
        ]}
      />
      <ExamplesBlock
        examples={[
          { input: "10-page PDF, every page", output: "10 files, zipped" },
          { input: "\"1-3, 4, 5-7\"", output: "3 files, zipped" },
        ]}
      />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your result and are not stored afterward.
      </p>
    </div>
  );
}

export default SplitPdfTool;
