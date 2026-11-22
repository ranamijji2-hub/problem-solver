import type { CropRect } from "./dimensions";
import type { Dimensions } from "./types";
import { FORMAT_MIME, isLossyFormat, type ImageFormat } from "./types";

/**
 * Every image tool in Phase 4 runs entirely in the browser via the Canvas
 * API — no server round trip, no upload. This is a deliberate departure
 * from Phase 3's PDF tools (which need a server-side PDF library): modern
 * browsers can decode/encode JPEG, PNG, and WebP natively, so processing
 * locally is strictly better here — faster, private by construction (the
 * image never leaves the device), and free to run. See the Phase 4
 * completion report for the full reasoning.
 */

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

/** Decodes a File into a drawable bitmap. Throws if the browser can't decode it — the real "is this actually a valid image" check, since a file can pass the byte-signature check in validation.ts but still be truncated/corrupted. */
export async function decodeImageFile(file: File): Promise<LoadedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`"${file.name}" couldn't be opened — it may be corrupted or not a real image.`);
  }
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser doesn't support 2D canvas rendering.");
  return ctx;
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Couldn't encode the image — your browser may not support this output format."));
      },
      FORMAT_MIME[format],
      isLossyFormat(format) ? quality : undefined
    );
  });
}

export interface EncodedResult {
  blob: Blob;
  width: number;
  height: number;
}

/** Draws a bitmap into a canvas at the given output size and encodes it — the shared final step behind resize/compress/convert/optimize. */
async function drawAndEncode(
  bitmap: ImageBitmap,
  outputSize: Dimensions,
  format: ImageFormat,
  quality: number,
  sourceRect?: CropRect
): Promise<EncodedResult> {
  const canvas = createCanvas(outputSize.width, outputSize.height);
  const ctx = getContext2D(canvas);

  // PNG/WebP support transparency; JPEG does not, so painting a white
  // background first avoids black backgrounds for a transparent PNG
  // converted to JPEG (JPEG has no alpha channel to fall back on).
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (sourceRect) {
    ctx.drawImage(
      bitmap,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      outputSize.width,
      outputSize.height
    );
  } else {
    ctx.drawImage(bitmap, 0, 0, outputSize.width, outputSize.height);
  }

  const blob = await canvasToBlob(canvas, format, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/** Resizes an image to exact output dimensions. */
export async function resizeImage(
  bitmap: ImageBitmap,
  outputSize: Dimensions,
  format: ImageFormat,
  quality = 0.85
): Promise<EncodedResult> {
  return drawAndEncode(bitmap, outputSize, format, quality);
}

/** Re-encodes an image at a given quality, keeping its original dimensions and format. */
export async function compressImage(bitmap: ImageBitmap, format: ImageFormat, quality: number): Promise<EncodedResult> {
  return drawAndEncode(bitmap, { width: bitmap.width, height: bitmap.height }, format, quality);
}

/** Converts an image to a different output format, keeping its original dimensions. */
export async function convertImageFormat(bitmap: ImageBitmap, format: ImageFormat, quality = 0.9): Promise<EncodedResult> {
  return drawAndEncode(bitmap, { width: bitmap.width, height: bitmap.height }, format, quality);
}

/** Crops a region of an image (in source-image pixel coordinates) into a new image of the crop's size. */
export async function cropImage(
  bitmap: ImageBitmap,
  rect: CropRect,
  format: ImageFormat,
  quality = 0.9
): Promise<EncodedResult> {
  return drawAndEncode(bitmap, { width: rect.width, height: rect.height }, format, quality, rect);
}

export type RotationDegrees = 0 | 90 | 180 | 270;

/** Rotates (by a multiple of 90°) and/or flips an image. Rotating 90°/270° swaps the output width and height. */
export async function rotateImage(
  bitmap: ImageBitmap,
  rotation: RotationDegrees,
  flipHorizontal: boolean,
  flipVertical: boolean,
  format: ImageFormat,
  quality = 0.9
): Promise<EncodedResult> {
  const swapped = rotation === 90 || rotation === 270;
  const outWidth = swapped ? bitmap.height : bitmap.width;
  const outHeight = swapped ? bitmap.width : bitmap.height;

  const canvas = createCanvas(outWidth, outHeight);
  const ctx = getContext2D(canvas);

  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.translate(outWidth / 2, outHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

  const blob = await canvasToBlob(canvas, format, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Samples the alpha channel of a downscaled copy of the image to cheaply
 * estimate whether it has any meaningful transparency, without reading
 * every pixel of a potentially large source image. Used by the Optimizer
 * to decide whether converting a PNG to JPEG is safe (JPEG has no alpha).
 */
export async function hasTransparency(bitmap: ImageBitmap): Promise<boolean> {
  const sampleSize = 64;
  const canvas = createCanvas(sampleSize, sampleSize);
  const ctx = getContext2D(canvas);
  ctx.drawImage(bitmap, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
  for (let i = 3; i < data.length; i += 4) {
    if ((data[i] ?? 255) < 250) return true;
  }
  return false;
}
