"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { PdfResultPanel } from "@/components/pdf-tools/PdfResultPanel";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { useImageMeta } from "@/lib/hooks/useImageMeta";
import { decodeImageFile, convertImageFormat } from "@/lib/image/engine";
import { FORMAT_EXTENSION, isLossyFormat, type ImageFormat } from "@/lib/image/types";
import { isWebpEncodingSupported } from "@/lib/image/support";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

/**
 * Powers the JPG→PNG, PNG→JPG, and WebP Converter tools — three thin,
 * differently-slugged wrappers around this one component, which itself
 * calls the same lib/image/engine.ts convertImageFormat used by the
 * general Image Converter. Kept as one implementation per the brief's
 * explicit "do not duplicate processing logic" requirement.
 */
export function SimpleFormatConverterTool({
  toolSlug,
  targetFormat,
  toolTitle,
  fromHint,
}: {
  toolSlug: string;
  targetFormat: ImageFormat;
  toolTitle: string;
  fromHint: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("90");

  const before = useImageMeta(file);
  const { status, errorMessage, result, resultUrl, run, reset, download } = useImageProcessor(toolSlug);

  async function handleSubmit() {
    if (!file) return;
    await run(async () => {
      if (targetFormat === "webp" && !(await isWebpEncodingSupported())) {
        throw new Error("Your browser can't create WebP images. Try a recent version of Chrome, Firefox, or Edge.");
      }
      const image = await decodeImageFile(file);
      const q = isLossyFormat(targetFormat) ? Math.min(1, Math.max(0.1, Number(quality) / 100)) : undefined;
      return convertImageFormat(image.bitmap, targetFormat, q);
    }, `converted.${FORMAT_EXTENSION[targetFormat]}`);
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label={`Image to convert to ${toolTitle.split(" ").pop()}`} files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] ?? null)} hint={fromHint} />

        {before && (
          <div className="mt-4">
            <ImagePreview
              before={before}
              after={result && resultUrl ? { url: resultUrl, width: result.width, height: result.height, size: result.blob.size, format: targetFormat, filename: result.filename } : undefined}
            />
          </div>
        )}

        {before && isLossyFormat(targetFormat) && (
          <div className="mt-4 max-w-xs">
            <NumberField id={`${toolSlug}-quality`} label="Quality" value={quality} onChange={setQuality} suffix="%" />
          </div>
        )}

        <PdfActionBar status={status} disabled={!file} onSubmit={handleSubmit} onReset={handleReset} submitLabel={toolTitle} />

        <div className="mt-4">
          <PdfResultPanel status={status} errorMessage={errorMessage} resultFilename={result?.filename ?? null} resultSize={result?.blob.size ?? null} onDownload={download} />
        </div>
      </div>

      <HowToUse steps={["Upload an image.", `Select ${toolTitle} to convert it.`, "Download the result."]} />
      <ExamplesBlock examples={[{ input: fromHint, output: `Converted to ${toolTitle.split(" ").pop()}` }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}
