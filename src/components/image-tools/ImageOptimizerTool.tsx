"use client";

import { useState } from "react";
import { Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { Button } from "@/components/ui/Button";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { useImageMeta } from "@/lib/hooks/useImageMeta";
import { decodeImageFile } from "@/lib/image/engine";
import { optimizeImage } from "@/lib/image/optimize";
import { detectImageFormat } from "@/lib/image/validation";
import { FORMAT_EXTENSION } from "@/lib/image/types";
import { formatBytes } from "@/lib/format";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function ImageOptimizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const before = useImageMeta(file);
  const { status, errorMessage, result, resultUrl, run, reset, download } = useImageProcessor("image-optimizer");

  async function handleSubmit() {
    if (!file) return;
    await run(
      async () => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const originalFormat = detectImageFormat(bytes) ?? "jpeg";
        const image = await decodeImageFile(file);
        return optimizeImage(image, originalFormat);
      },
      (output) => `optimized.${FORMAT_EXTENSION[output.format]}`
    );
  }

  const reduction = file && result && file.size > 0 ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100)) : null;

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label="Image to optimize" files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] ?? null)} hint="JPG, PNG, or WebP, up to 15MB." />

        {before && (
          <div className="mt-4">
            <ImagePreview
              before={before}
              after={
                result && resultUrl
                  ? { url: resultUrl, width: result.width, height: result.height, size: result.blob.size, format: result.filename.split(".").pop() ?? "", filename: result.filename }
                  : undefined
              }
            />
          </div>
        )}

        <PdfActionBar status={status} disabled={!file} onSubmit={handleSubmit} onReset={handleReset} submitLabel="Optimize image" />

        <div className="mt-4">
          {status === "loading" && (
            <div role="status" className="flex items-center gap-3 rounded-xs border border-line bg-line/10 p-4 text-sm text-ink/70">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
              Analyzing and optimizing your image…
            </div>
          )}
          {status === "error" && (
            <div role="alert" className="flex items-start gap-3 rounded-xs border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage ?? "Something went wrong. Please try again."}</span>
            </div>
          )}
          {status === "success" && result && before && (
            <div className="rounded-xs border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {formatBytes(before.size)} → {formatBytes(result.blob.size)}
                      {reduction !== null && reduction > 0 && <> ({reduction}% smaller)</>}
                    </p>
                    <p className="text-xs text-ink/55">
                      {before.width}×{before.height} → {result.width}×{result.height}
                    </p>
                  </div>
                </div>
                <Button type="button" size="sm" onClick={download}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 rounded-xs border border-line bg-line/20 p-3 text-xs leading-relaxed text-ink/60">
        Optimize automatically picks a sensible format, quality, and maximum size — it downscales
        images larger than 2000px on the long edge, converts opaque PNGs to JPG, and re-encodes
        photos at a quality built to look right at normal viewing sizes. This is a fixed rule-based
        pass, not an AI judgment call.
      </p>

      <HowToUse steps={["Upload an image.", "Select Optimize — no settings to configure.", "Compare the before/after, then download."]} />
      <ExamplesBlock examples={[{ input: "4000×3000 photo PNG", output: "2000×1500 JPG, much smaller" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}

export default ImageOptimizerTool;
