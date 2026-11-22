"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { PdfResultPanel } from "@/components/pdf-tools/PdfResultPanel";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { useImageMeta } from "@/lib/hooks/useImageMeta";
import { decodeImageFile, convertImageFormat } from "@/lib/image/engine";
import { FORMAT_EXTENSION, isLossyFormat, type ImageFormat } from "@/lib/image/types";
import { isWebpEncodingSupported } from "@/lib/image/support";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

const FORMAT_OPTIONS = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

export function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState("90");

  const before = useImageMeta(file);
  const { status, errorMessage, result, resultUrl, run, reset, download } = useImageProcessor("image-converter");

  async function handleSubmit() {
    if (!file) return;
    await run(async () => {
      if (format === "webp" && !(await isWebpEncodingSupported())) {
        throw new Error("Your browser can't create WebP images. Try a recent version of Chrome, Firefox, or Edge.");
      }
      const image = await decodeImageFile(file);
      const q = isLossyFormat(format) ? Math.min(1, Math.max(0.1, Number(quality) / 100)) : undefined;
      return convertImageFormat(image.bitmap, format, q);
    }, `converted.${FORMAT_EXTENSION[format]}`);
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label="Image to convert" files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] ?? null)} hint="JPG, PNG, or WebP, up to 15MB." />

        {before && (
          <div className="mt-4">
            <ImagePreview
              before={before}
              after={result && resultUrl ? { url: resultUrl, width: result.width, height: result.height, size: result.blob.size, format, filename: result.filename } : undefined}
            />
          </div>
        )}

        {before && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="convert-format" label="Convert to" value={format} onChange={(v) => setFormat(v as ImageFormat)} options={FORMAT_OPTIONS} />
            {isLossyFormat(format) && <NumberField id="convert-quality" label="Quality" value={quality} onChange={setQuality} suffix="%" />}
          </div>
        )}

        <PdfActionBar status={status} disabled={!file} onSubmit={handleSubmit} onReset={handleReset} submitLabel="Convert image" />

        <div className="mt-4">
          <PdfResultPanel status={status} errorMessage={errorMessage} resultFilename={result?.filename ?? null} resultSize={result?.blob.size ?? null} onDownload={download} />
        </div>
      </div>

      <HowToUse steps={["Upload an image.", "Choose the format to convert it to.", "For JPG or WebP output, set a quality.", "Convert and download."]} />
      <ExamplesBlock examples={[{ input: "photo.png → WebP", output: "Usually much smaller, same look" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}

export default ImageConverterTool;
