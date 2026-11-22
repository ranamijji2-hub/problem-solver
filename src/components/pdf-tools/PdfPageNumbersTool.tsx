"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

const POSITION_OPTIONS = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

const FORMAT_OPTIONS = [
  { value: "n", label: "1, 2, 3…" },
  { value: "n-of-total", label: "1 of 20, 2 of 20…" },
];

export function PdfPageNumbersTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState("bottom-center");
  const [format, setFormat] = useState("n");
  const [startAt, setStartAt] = useState("1");
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "add-page-numbers",
    "/api/pdf/page-numbers"
  );

  async function handleSubmit() {
    const file = files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    formData.append("position", position);
    formData.append("format", format);
    formData.append("startAt", startAt || "1");
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    setPosition("bottom-center");
    setFormat("n");
    setStartAt("1");
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

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField id="pn-position" label="Position" value={position} onChange={setPosition} options={POSITION_OPTIONS} />
          <SelectField id="pn-format" label="Format" value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
          <NumberField id="pn-start" label="Start numbering at" value={startAt} onChange={setStartAt} />
        </div>

        <PdfActionBar
          status={status}
          disabled={files.length === 0}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Add page numbers"
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
          "Upload the PDF you want to number.",
          "Choose where the numbers should appear and which format to use.",
          "Optionally change the starting number — useful if this PDF continues from another document.",
          "Download the numbered PDF.",
        ]}
      />
      <ExamplesBlock examples={[{ input: 'Bottom center, "1 of 20" format', output: "Numbered on every page" }]} />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your result and are not stored afterward.
      </p>
    </div>
  );
}

export default PdfPageNumbersTool;
