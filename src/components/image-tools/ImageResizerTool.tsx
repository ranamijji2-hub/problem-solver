"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
// Reused as-is from Phase 3: both components are structurally generic
// (status/disabled/onSubmit/onReset, and status/error/filename/size/
// onDownload) and were already written without any PDF-specific logic,
// so building an Image-tools duplicate would violate the "don't
// duplicate" requirement for no real benefit.
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { PdfResultPanel } from "@/components/pdf-tools/PdfResultPanel";
import { SegmentedControl } from "@/components/calculators/SegmentedControl";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { useImageMeta } from "@/lib/hooks/useImageMeta";
import { decodeImageFile, resizeImage } from "@/lib/image/engine";
import { heightForWidth, widthForHeight, resizeByPercent, RESIZE_PRESETS } from "@/lib/image/dimensions";
import { FORMAT_EXTENSION, isLossyFormat, type ImageFormat } from "@/lib/image/types";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

type Mode = "exact" | "percent" | "preset";

const FORMAT_OPTIONS = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

export function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("exact");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [percent, setPercent] = useState("50");
  const [presetIndex, setPresetIndex] = useState("0");
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState("85");

  const before = useImageMeta(file);
  const { status, errorMessage, result, resultUrl, run, reset, download } = useImageProcessor("image-resizer");

  function handleWidthChange(value: string) {
    setWidth(value);
    if (lockAspect && before && value.trim() !== "") {
      const w = Number(value);
      if (Number.isFinite(w) && w > 0) setHeight(String(heightForWidth(w, before)));
    }
  }

  function handleHeightChange(value: string) {
    setHeight(value);
    if (lockAspect && before && value.trim() !== "") {
      const h = Number(value);
      if (Number.isFinite(h) && h > 0) setWidth(String(widthForHeight(h, before)));
    }
  }

  async function handleSubmit() {
    if (!file || !before) return;

    await run(async () => {
      const image = await decodeImageFile(file);
      let target = { width: image.width, height: image.height };

      if (mode === "exact") {
        const w = Number(width);
        const h = Number(height);
        if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) {
          throw new Error("Enter a width and height greater than 0.");
        }
        target = { width: Math.round(w), height: Math.round(h) };
      } else if (mode === "percent") {
        const p = Number(percent);
        if (!Number.isFinite(p) || p <= 0) throw new Error("Enter a percentage greater than 0.");
        target = resizeByPercent(image, p);
      } else {
        const preset = RESIZE_PRESETS[Number(presetIndex)];
        if (!preset) throw new Error("Choose a preset size.");
        target = { width: preset.width, height: preset.height };
      }

      const q = isLossyFormat(format) ? Math.min(1, Math.max(0.1, Number(quality) / 100)) : undefined;
      return resizeImage(image.bitmap, target, format, q);
    }, `resized.${FORMAT_EXTENSION[format]}`);
  }

  function handleReset() {
    setFile(null);
    setWidth("");
    setHeight("");
    setPercent("50");
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label="Image to resize" files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] ?? null)} hint="JPG, PNG, or WebP, up to 15MB." />

        {before && (
          <div className="mt-4">
            <ImagePreview before={before} after={result && resultUrl ? { url: resultUrl, width: result.width, height: result.height, size: result.blob.size, format, filename: result.filename } : undefined} />
          </div>
        )}

        {before && (
          <>
            <div className="mt-4">
              <SegmentedControl
                label="Resize method"
                options={[
                  { value: "exact" as Mode, label: "Exact size" },
                  { value: "percent" as Mode, label: "Percentage" },
                  { value: "preset" as Mode, label: "Preset" },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>

            {mode === "exact" && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <NumberField id="resize-width" label="Width (px)" value={width} onChange={handleWidthChange} />
                <NumberField id="resize-height" label="Height (px)" value={height} onChange={handleHeightChange} />
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      className="h-4 w-4 rounded-xs border-line text-indigo-600 focus:ring-0"
                    />
                    Lock aspect ratio
                  </label>
                </div>
              </div>
            )}

            {mode === "percent" && (
              <div className="mt-4 max-w-xs">
                <NumberField id="resize-percent" label="Resize to" value={percent} onChange={setPercent} suffix="%" />
              </div>
            )}

            {mode === "preset" && (
              <div className="mt-4 max-w-sm">
                <SelectField
                  id="resize-preset"
                  label="Preset size"
                  value={presetIndex}
                  onChange={setPresetIndex}
                  options={RESIZE_PRESETS.map((p, i) => ({ value: String(i), label: p.label }))}
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField id="resize-format" label="Output format" value={format} onChange={(v) => setFormat(v as ImageFormat)} options={FORMAT_OPTIONS} />
              {isLossyFormat(format) && <NumberField id="resize-quality" label="Quality" value={quality} onChange={setQuality} suffix="%" />}
            </div>
          </>
        )}

        <PdfActionBar status={status} disabled={!file} onSubmit={handleSubmit} onReset={handleReset} submitLabel="Resize image" />

        <div className="mt-4">
          <PdfResultPanel
            status={status}
            errorMessage={errorMessage}
            resultFilename={result?.filename ?? null}
            resultSize={result?.blob.size ?? null}
            onDownload={download}
          />
        </div>
      </div>

      <HowToUse
        steps={[
          "Upload an image.",
          "Choose exact pixel dimensions, a percentage, or a preset size.",
          "With exact dimensions, lock the aspect ratio so changing width updates height automatically.",
          "Pick an output format and quality, then download.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "2000×1000 image, 50%", output: "1000×500 image" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}

export default ImageResizerTool;
