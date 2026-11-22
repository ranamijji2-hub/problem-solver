"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { PdfActionBar } from "./PdfActionBar";
import { PdfResultPanel } from "./PdfResultPanel";
import { usePdfToolRequest } from "@/lib/hooks/usePdfToolRequest";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const { status, errorMessage, resultFilename, resultSize, submit, reset, download } = usePdfToolRequest(
    "jpg-to-pdf",
    "/api/pdf/from-images"
  );

  async function handleSubmit() {
    if (files.length === 0) return;
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
          label="Images to convert"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          kind="image"
          files={files}
          onFilesChange={setFiles}
          hint="JPG or PNG, up to 8MB each. One page per image, in the order added."
        />

        <PdfActionBar
          status={status}
          disabled={files.length === 0}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Create PDF"
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
          "Add one or more JPG or PNG images.",
          "Select Create PDF — each image becomes its own page, in the order you added them.",
          "Download the combined PDF.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "3 photos", output: "One 3-page PDF" }]} />
      <p className="mt-4 text-xs text-ink/45">
        Files are processed in memory to produce your result and are not stored afterward.
      </p>
    </div>
  );
}

export default ImagesToPdfTool;
