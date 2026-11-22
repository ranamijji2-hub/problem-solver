"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { PdfResultPanel } from "@/components/pdf-tools/PdfResultPanel";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { useImageMeta } from "@/lib/hooks/useImageMeta";
import { decodeImageFile, rotateImage, type RotationDegrees } from "@/lib/image/engine";
import { FORMAT_EXTENSION, type ImageFormat } from "@/lib/image/types";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

const ROTATION_OPTIONS = [
  { value: "0", label: "0°" },
  { value: "90", label: "90°" },
  { value: "180", label: "180°" },
  { value: "270", label: "270°" },
];

function toRotationDegrees(value: string): RotationDegrees {
  const n = Number(value);
  return n === 90 || n === 180 || n === 270 ? n : 0;
}

export function ImageRotatorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState("90");
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("jpeg");

  const before = useImageMeta(file, format);
  const { status, errorMessage, result, resultUrl, run, reset, download } = useImageProcessor("image-rotator");

  async function handleSubmit() {
    if (!file) return;
    await run(async () => {
      const image = await decodeImageFile(file);
      return rotateImage(image.bitmap, toRotationDegrees(rotation), flipHorizontal, flipVertical, format);
    }, `rotated.${FORMAT_EXTENSION[format]}`);
  }

  function handleReset() {
    setFile(null);
    setRotation("90");
    setFlipHorizontal(false);
    setFlipVertical(false);
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader
          label="Image to rotate"
          files={file ? [file] : []}
          onFilesChange={(f) => {
            setFile(f[0] ?? null);
            if (f[0]) setFormat(f[0].type === "image/png" ? "png" : f[0].type === "image/webp" ? "webp" : "jpeg");
          }}
          hint="JPG, PNG, or WebP, up to 15MB."
        />

        {before && (
          <div className="mt-4">
            <ImagePreview
              before={before}
              after={result && resultUrl ? { url: resultUrl, width: result.width, height: result.height, size: result.blob.size, format, filename: result.filename } : undefined}
            />
          </div>
        )}

        {before && (
          <>
            <div className="mt-4">
              <SegmentedControl label="Rotation" options={ROTATION_OPTIONS} value={rotation} onChange={setRotation} />
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={flipHorizontal} onChange={(e) => setFlipHorizontal(e.target.checked)} className="h-4 w-4 rounded-xs border-line text-indigo-600 focus:ring-0" />
                Flip horizontal
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={flipVertical} onChange={(e) => setFlipVertical(e.target.checked)} className="h-4 w-4 rounded-xs border-line text-indigo-600 focus:ring-0" />
                Flip vertical
              </label>
            </div>
          </>
        )}

        <PdfActionBar status={status} disabled={!file} onSubmit={handleSubmit} onReset={handleReset} submitLabel="Rotate image" />

        <div className="mt-4">
          <PdfResultPanel status={status} errorMessage={errorMessage} resultFilename={result?.filename ?? null} resultSize={result?.blob.size ?? null} onDownload={download} />
        </div>
      </div>

      <HowToUse steps={["Upload an image.", "Choose a rotation angle and/or flip direction.", "Rotate and download — dimensions swap automatically for 90°/270°."]} />
      <ExamplesBlock examples={[{ input: "Sideways photo, 90°", output: "Upright photo" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}

export default ImageRotatorTool;
