import type { Dimensions } from "./types";

/** Given a new width and the original dimensions, returns the height that preserves aspect ratio. */
export function heightForWidth(newWidth: number, original: Dimensions): number {
  if (original.width <= 0) return 0;
  return Math.round((newWidth * original.height) / original.width);
}

/** Given a new height and the original dimensions, returns the width that preserves aspect ratio. */
export function widthForHeight(newHeight: number, original: Dimensions): number {
  if (original.height <= 0) return 0;
  return Math.round((newHeight * original.width) / original.height);
}

/** Scales both dimensions by a percentage (100 = unchanged), preserving aspect ratio by construction. */
export function resizeByPercent(original: Dimensions, percent: number): Dimensions {
  const factor = Math.max(percent, 0) / 100;
  return {
    width: Math.max(1, Math.round(original.width * factor)),
    height: Math.max(1, Math.round(original.height * factor)),
  };
}

/**
 * Scales dimensions down (never up) so the longest edge is at most
 * `maxEdge`, preserving aspect ratio. Used by the Optimizer, and
 * available to the Resizer's preset sizes.
 */
export function fitWithinMaxEdge(original: Dimensions, maxEdge: number): Dimensions {
  const longest = Math.max(original.width, original.height);
  if (longest <= maxEdge) return { ...original };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(original.width * scale)),
    height: Math.max(1, Math.round(original.height * scale)),
  };
}

/** Common preset target sizes for the Resizer — fit within the box, preserving aspect ratio. */
export const RESIZE_PRESETS: { label: string; width: number; height: number }[] = [
  { label: "Instagram post (1080×1080)", width: 1080, height: 1080 },
  { label: "HD (1280×720)", width: 1280, height: 720 },
  { label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { label: "Thumbnail (150×150)", width: 150, height: 150 },
  { label: "Web banner (1200×630)", width: 1200, height: 630 },
];

/** Fits the original image within a preset's box, preserving aspect ratio (does not force the exact preset dimensions unless the aspect ratio matches). */
export function fitWithinBox(original: Dimensions, box: Dimensions): Dimensions {
  const scale = Math.min(box.width / original.width, box.height / original.height);
  return {
    width: Math.max(1, Math.round(original.width * scale)),
    height: Math.max(1, Math.round(original.height * scale)),
  };
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Clamps a crop rectangle so it never extends outside the source image bounds. */
export function clampCropRect(rect: CropRect, bounds: Dimensions): CropRect {
  const width = Math.min(Math.max(1, Math.round(rect.width)), bounds.width);
  const height = Math.min(Math.max(1, Math.round(rect.height)), bounds.height);
  const x = Math.min(Math.max(0, Math.round(rect.x)), bounds.width - width);
  const y = Math.min(Math.max(0, Math.round(rect.y)), bounds.height - height);
  return { x, y, width, height };
}

/** Common named crop aspect ratios; null represents "free" (unconstrained). */
export const CROP_ASPECT_RATIOS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "Square (1:1)", value: 1 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Portrait (3:4)", value: 3 / 4 },
  { label: "Widescreen (16:9)", value: 16 / 9 },
];

/** Largest rectangle with the given aspect ratio (width/height) that fits centered within `bounds`. */
export function centeredRectForAspectRatio(bounds: Dimensions, aspectRatio: number): CropRect {
  let width = bounds.width;
  let height = width / aspectRatio;
  if (height > bounds.height) {
    height = bounds.height;
    width = height * aspectRatio;
  }
  return {
    x: Math.round((bounds.width - width) / 2),
    y: Math.round((bounds.height - height) / 2),
    width: Math.round(width),
    height: Math.round(height),
  };
}
