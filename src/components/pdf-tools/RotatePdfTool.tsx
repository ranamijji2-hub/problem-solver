"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

const ROTATION_OPTIONS = [
  { value: "90", label: "90° clockwise" },
  { value: "180", label: "180°" },
  { value: "270", label: "270° clockwise" },
];

export function RotatePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState("90");
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "rotate-pdf",
    "/api/pdf/rotate"
  );

  async function handleSubmit() {
    const file = files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("files", file);
    formData.append("rotation", rotation);
    await submit(formData);
  }

  function handleReset() {
    setFiles([]);
    setRotation("90");
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <FileDropzone
          label="PDF file to rotate"
          accept="application/pdf,.pdf"
          files={files}
          onFilesChange={setFiles}
          hint="Up to 8MB. Rotates every page the same way."
        />

        <div className="mt-4">
          <SegmentedControl label="Rotation" options={ROTATION_OPTIONS} value={rotation} onChange={setRotation} />
        </div>

        <PdfActionBar
          status={status}
          disabled={files.length === 0}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Rotate PDF"
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
          "Upload the PDF you want to rotate.",
          "Choose 90°, 180°, or 270° — every page rotates by the same amount.",
          "Download the rotated PDF.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "Scanned sideways, 90°", output: "Upright PDF" }]} />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your result and are not stored afterward.
      </p>
    </div>
  );
}

export default RotatePdfTool;
