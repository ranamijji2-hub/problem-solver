"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";
import { trackEvent } from "@/lib/analytics/events";
import { downloadBlob } from "@/lib/downloadBlob";
import { formatBytes } from "@/lib/format";
import { decodeImageFile, compressImage } from "@/lib/image/engine";
import { FORMAT_EXTENSION, isLossyFormat, type ImageFormat } from "@/lib/image/types";

type OutputChoice = "keep" | "jpeg" | "webp";

interface CompressedItem {
  file: File;
  status: "done" | "error";
  blob?: Blob;
  width?: number;
  height?: number;
  format?: ImageFormat;
  error?: string;
}

const OUTPUT_OPTIONS = [
  { value: "keep", label: "Keep original format" },
  { value: "jpeg", label: "Convert to JPG" },
  { value: "webp", label: "Convert to WebP" },
];

function resolveFormat(file: File, choice: OutputChoice): ImageFormat {
  if (choice === "jpeg") return "jpeg";
  if (choice === "webp") return "webp";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpeg";
}

export function ImageCompressorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState("80");
  const [outputChoice, setOutputChoice] = useState<OutputChoice>("keep");
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Same staleness problem as usePdfToolRequest/useImageProcessor, fixed
  // the same way: this batch loop has no per-file cancellation, so a
  // generation counter is used to detect and discard a stale batch's
  // results if the user hits Reset (or starts a new batch) before the
  // loop over `files` finishes.
  const generation = useRef(0);

  async function handleSubmit() {
    if (files.length === 0) return;
    generation.current += 1;
    const myGeneration = generation.current;

    setStatus("loading");
    trackEvent({ eventType: "tool_start", toolSlug: "image-compressor", metadata: { count: files.length } });
    const startedAt = Date.now();

    const q = Math.min(1, Math.max(0.1, Number(quality) / 100));
    const results: CompressedItem[] = [];

    for (const file of files) {
      try {
        const image = await decodeImageFile(file);
        const format = resolveFormat(file, outputChoice);
        const encoded = await compressImage(image.bitmap, format, isLossyFormat(format) ? q : 1);
        results.push({ file, status: "done", blob: encoded.blob, width: encoded.width, height: encoded.height, format });
      } catch (err) {
        results.push({ file, status: "error", error: err instanceof Error ? err.message : "Couldn't process this image." });
      }
    }

    if (generation.current !== myGeneration) return; // superseded by reset/resubmit while the batch was running

    setItems(results);
    const durationMs = Date.now() - startedAt;
    const successCount = results.filter((r) => r.status === "done").length;

    if (successCount === 0) {
      setStatus("error");
      trackEvent({ eventType: "tool_error", toolSlug: "image-compressor", metadata: { durationMs, count: files.length } });
    } else {
      setStatus("success");
      trackEvent({
        eventType: "tool_complete",
        toolSlug: "image-compressor",
        metadata: { durationMs, success: true, count: files.length, failedCount: files.length - successCount },
      });
    }
  }

  function handleReset() {
    generation.current += 1;
    setFiles([]);
    setItems([]);
    setStatus("idle");
  }

  function handleDownloadOne(item: CompressedItem) {
    if (!item.blob || !item.format) return;
    const base = item.file.name.replace(/\.[^./]+$/, "");
    const filename = `${base}-compressed.${FORMAT_EXTENSION[item.format]}`;
    downloadBlob(item.blob, filename);
    trackEvent({ eventType: "download", toolSlug: "image-compressor", metadata: { filename } });
  }

  async function handleDownloadAll() {
    const done = items.filter(
      (i): i is CompressedItem & { blob: Blob; format: ImageFormat } => i.status === "done" && !!i.blob && !!i.format
    );
    if (done.length === 0) return;
    const zip = new JSZip();
    for (const item of done) {
      const base = item.file.name.replace(/\.[^./]+$/, "");
      zip.file(`${base}-compressed.${FORMAT_EXTENSION[item.format]}`, item.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "compressed-images.zip");
    trackEvent({ eventType: "download", toolSlug: "image-compressor", metadata: { filename: "compressed-images.zip", count: done.length } });
  }

  const successItems = items.filter((i) => i.status === "done");

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label="Images to compress" multiple maxFiles={20} files={files} onFilesChange={setFiles} hint="JPG, PNG, or WebP, up to 15MB each." />

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField id="compress-output" label="Output format" value={outputChoice} onChange={(v) => setOutputChoice(v as OutputChoice)} options={OUTPUT_OPTIONS} />
            <NumberField id="compress-quality" label="Quality" value={quality} onChange={setQuality} suffix="%" hint="Only affects JPG/WebP output — PNG stays lossless." />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button type="button" onClick={handleSubmit} disabled={files.length === 0 || status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Compressing…
              </>
            ) : (
              "Compress images"
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>

        {items.length > 0 && (
          <div className="mt-5 border-t border-line pt-5">
            {successItems.length > 1 && (
              <div className="mb-3">
                <Button type="button" size="sm" onClick={handleDownloadAll}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download all ({successItems.length}) as ZIP
                </Button>
              </div>
            )}
            <ul className="divide-y divide-line rounded-xs border border-line">
              {items.map((item, i) => (
                <li key={`${item.file.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
                    {item.status === "done" ? (
                      <p className="text-xs text-ink/55">
                        {formatBytes(item.file.size)} → {formatBytes(item.blob?.size ?? 0)}
                        {item.blob && item.file.size > 0 && (
                          <> ({Math.max(0, Math.round((1 - item.blob.size / item.file.size) * 100))}% smaller)</>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-danger">{item.error}</p>
                    )}
                  </div>
                  {item.status === "done" && (
                    <Button type="button" variant="secondary" size="sm" onClick={() => handleDownloadOne(item)}>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <HowToUse
        steps={[
          "Add one or more images.",
          "Choose whether to keep the original format or convert while compressing, and set a quality.",
          "Compress, then download each image or all of them as a ZIP.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "3 photos at 80% quality", output: "Often 40-70% smaller" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — your images are never uploaded anywhere.</p>
    </div>
  );
}

export default ImageCompressorTool;
