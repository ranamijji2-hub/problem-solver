"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent, type CSSProperties } from "react";
import { ImageUploader } from "./ImageUploader";
import { PdfActionBar } from "@/components/pdf-tools/PdfActionBar";
import { PdfResultPanel } from "@/components/pdf-tools/PdfResultPanel";
import { SelectField } from "@/components/calculators/fields/SelectField";
import { useImageProcessor } from "@/lib/hooks/useImageProcessor";
import { decodeImageFile, cropImage } from "@/lib/image/engine";
import { clampCropRect, centeredRectForAspectRatio, CROP_ASPECT_RATIOS, type CropRect } from "@/lib/image/dimensions";
import { FORMAT_EXTENSION, type ImageFormat } from "@/lib/image/types";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

type Handle = "move" | "nw" | "ne" | "sw" | "se";

const HANDLE_SIZE = 14;

export function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect | null>(null); // in display-space pixels
  const [aspectIndex, setAspectIndex] = useState("0");
  const [format, setFormat] = useState<ImageFormat>("jpeg");

  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ handle: Handle; startX: number; startY: number; startRect: CropRect } | null>(null);

  const { status, errorMessage, result, run, reset, download } = useImageProcessor("image-cropper");

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      setNatural(null);
      setDisplaySize(null);
      setRect(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const nat = { width: img.naturalWidth, height: img.naturalHeight };
    const disp = { width: img.clientWidth, height: img.clientHeight };
    setNatural(nat);
    setDisplaySize(disp);
    const aspect = CROP_ASPECT_RATIOS[Number(aspectIndex)]?.value ?? null;
    setRect(aspect ? centeredRectForAspectRatio(disp, aspect) : { x: 0, y: 0, width: disp.width, height: disp.height });
  }

  function applyAspect(index: string) {
    setAspectIndex(index);
    if (!displaySize) return;
    const aspect = CROP_ASPECT_RATIOS[Number(index)]?.value ?? null;
    setRect(aspect ? centeredRectForAspectRatio(displaySize, aspect) : { x: 0, y: 0, width: displaySize.width, height: displaySize.height });
  }

  function startDrag(handle: Handle, e: ReactPointerEvent<HTMLDivElement>) {
    if (!rect) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { handle, startX: e.clientX, startY: e.clientY, startRect: rect };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    if (!drag || !displaySize) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const aspect = CROP_ASPECT_RATIOS[Number(aspectIndex)]?.value ?? null;
    setRect(computeDraggedRect(drag.handle, drag.startRect, dx, dy, displaySize, aspect));
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragState.current) e.currentTarget.releasePointerCapture(e.pointerId);
    dragState.current = null;
  }

  async function handleSubmit() {
    if (!file || !natural || !displaySize || !rect) return;
    await run(async () => {
      const image = await decodeImageFile(file);
      const scaleX = natural.width / displaySize.width;
      const scaleY = natural.height / displaySize.height;
      const naturalRect = clampCropRect(
        { x: rect.x * scaleX, y: rect.y * scaleY, width: rect.width * scaleX, height: rect.height * scaleY },
        natural
      );
      return cropImage(image.bitmap, naturalRect, format);
    }, `cropped.${FORMAT_EXTENSION[format]}`);
  }

  function nudgeRect(handle: Handle, e: ReactKeyboardEvent<HTMLDivElement>) {
    if (!rect || !displaySize) return;
    const step = e.shiftKey ? 20 : 5;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    const aspect = CROP_ASPECT_RATIOS[Number(aspectIndex)]?.value ?? null;
    setRect(computeDraggedRect(handle, rect, dx, dy, displaySize, aspect));
  }

  function handleReset() {
    setFile(null);
    setAspectIndex("0");
    reset();
  }

  return (
    <div>
      <div className="rounded-xs border border-line p-5 sm:p-6">
        <ImageUploader label="Image to crop" files={file ? [file] : []} onFilesChange={(f) => setFile(f[0] ?? null)} hint="JPG, PNG, or WebP, up to 15MB." />

        {imageUrl && (
          <div className="mt-4">
            <div className="relative inline-block max-w-full touch-none select-none" onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={imageUrl} alt="" onLoad={handleImageLoad} className="block max-h-[480px] max-w-full" draggable={false} />
              {rect && displaySize && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-ink/40" style={maskClipStyle(rect, displaySize)} />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Crop area. Drag to move, or focus and use arrow keys (hold Shift to move faster)."
                    onPointerDown={(e) => startDrag("move", e)}
                    onKeyDown={(e) => nudgeRect("move", e)}
                    className="absolute cursor-move border-2 border-amber-500 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-600"
                    style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                  >
                    {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                      <div
                        key={corner}
                        role="button"
                        tabIndex={0}
                        aria-label={`Resize crop area from the ${corner} corner. Focus and use arrow keys (hold Shift to resize faster).`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          startDrag(corner, e);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          nudgeRect(corner, e);
                        }}
                        className="absolute rounded-full border-2 border-amber-500 bg-paper focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-600"
                        style={cornerStyle(corner)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id="crop-aspect"
              label="Aspect ratio"
              value={aspectIndex}
              onChange={applyAspect}
              options={CROP_ASPECT_RATIOS.map((a, i) => ({ value: String(i), label: a.label }))}
            />
            <SelectField
              id="crop-format"
              label="Output format"
              value={format}
              onChange={(v) => setFormat(v as ImageFormat)}
              options={[
                { value: "jpeg", label: "JPG" },
                { value: "png", label: "PNG" },
                { value: "webp", label: "WebP" },
              ]}
            />
          </div>
        )}

        <PdfActionBar status={status} disabled={!file || !rect} onSubmit={handleSubmit} onReset={handleReset} submitLabel="Crop image" />

        <div className="mt-4">
          <PdfResultPanel status={status} errorMessage={errorMessage} resultFilename={result?.filename ?? null} resultSize={result?.blob.size ?? null} onDownload={download} />
        </div>
      </div>

      <HowToUse
        steps={[
          "Upload an image.",
          "Drag the crop box to move it, or drag a corner handle to resize — or tab to them and use arrow keys.",
          "Optionally lock it to a common aspect ratio.",
          "Crop and download — the result contains exactly the selected area.",
        ]}
      />
      <ExamplesBlock examples={[{ input: "Landscape photo, square crop", output: "1:1 image of the selected area" }]} />
      <p className="mt-4 text-xs text-ink/45">Processed entirely in your browser — the image is never uploaded anywhere.</p>
    </div>
  );
}

function cornerStyle(corner: Handle): CSSProperties {
  const half = HANDLE_SIZE / 2;
  const base: CSSProperties = { width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: `${corner}-resize` };
  if (corner === "nw") return { ...base, left: -half, top: -half };
  if (corner === "ne") return { ...base, right: -half, top: -half };
  if (corner === "sw") return { ...base, left: -half, bottom: -half };
  return { ...base, right: -half, bottom: -half }; // se
}

function maskClipStyle(rect: CropRect, bounds: { width: number; height: number }): CSSProperties {
  // Four-rectangle mask via clip-path polygon (outer bounds minus the crop hole), avoiding a canvas-based mask for a simple rectangular cutout.
  const { x, y, width, height } = rect;
  const right = x + width;
  const bottom = y + height;
  const w = bounds.width;
  const h = bounds.height;
  return {
    clipPath: `polygon(0 0, ${w}px 0, ${w}px ${h}px, 0 ${h}px, 0 0, ${x}px ${y}px, ${x}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${y}px, ${x}px ${y}px)`,
  };
}

function computeDraggedRect(
  handle: Handle,
  start: CropRect,
  dx: number,
  dy: number,
  bounds: { width: number; height: number },
  aspect: number | null
): CropRect {
  if (handle === "move") {
    return clampCropRect({ ...start, x: start.x + dx, y: start.y + dy }, bounds);
  }

  let x = start.x;
  let y = start.y;
  let width = start.width;
  let height = start.height;

  if (handle === "se") {
    width = start.width + dx;
    height = aspect ? width / aspect : start.height + dy;
  } else if (handle === "nw") {
    width = start.width - dx;
    height = aspect ? width / aspect : start.height - dy;
    x = start.x + start.width - width;
    y = start.y + start.height - height;
  } else if (handle === "ne") {
    width = start.width + dx;
    height = aspect ? width / aspect : start.height - dy;
    y = start.y + start.height - height;
  } else {
    width = start.width - dx;
    height = aspect ? width / aspect : start.height + dy;
    x = start.x + start.width - width;
  }

  width = Math.max(20, width);
  height = Math.max(20, height);

  return clampCropRect({ x, y, width, height }, bounds);
}

export default ImageCropperTool;
