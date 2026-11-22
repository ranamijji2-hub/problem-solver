import { fitWithinMaxEdge } from "./dimensions";
import { compressImage, hasTransparency, resizeImage, type EncodedResult, type LoadedImage } from "./engine";
import { isWebpEncodingSupported } from "./support";
import type { ImageFormat } from "./types";

const MAX_OPTIMIZED_EDGE = 2000; // px — a sensible cap for web use without visibly softening most photos
const JPEG_QUALITY = 0.8;
const WEBP_QUALITY = 0.82;

export interface OptimizeResult extends EncodedResult {
  format: ImageFormat;
}

/**
 * A heuristic (not ML/AI-based) "one click" optimization pass:
 * 1. Downscale if the longest edge is above a sensible web-use cap.
 * 2. Pick an output format: keep a transparent PNG as PNG (or WebP, if
 *    the browser can encode it — WebP supports alpha and is usually much
 *    smaller than PNG); convert an opaque PNG to JPEG, since PNG's
 *    lossless encoding is the dominant cost for photos; re-encode JPEGs
 *    at a slightly lower quality.
 * This mirrors the honesty standard set for PDF Compress in Phase 3: the
 * heuristic is disclosed in the tool's UI, not presented as magic.
 */
export async function optimizeImage(image: LoadedImage, originalFormat: ImageFormat): Promise<OptimizeResult> {
  const targetSize = fitWithinMaxEdge({ width: image.width, height: image.height }, MAX_OPTIMIZED_EDGE);
  const needsResize = targetSize.width !== image.width || targetSize.height !== image.height;

  let outputFormat: ImageFormat = originalFormat;
  let quality = JPEG_QUALITY;

  if (originalFormat === "png") {
    const transparent = await hasTransparency(image.bitmap);
    if (transparent) {
      const webpOk = await isWebpEncodingSupported();
      outputFormat = webpOk ? "webp" : "png";
      quality = WEBP_QUALITY;
    } else {
      outputFormat = "jpeg";
      quality = JPEG_QUALITY;
    }
  } else if (originalFormat === "webp") {
    outputFormat = "webp";
    quality = WEBP_QUALITY;
  } else {
    outputFormat = "jpeg";
    quality = JPEG_QUALITY;
  }

  const result = needsResize
    ? await resizeImage(image.bitmap, targetSize, outputFormat, quality)
    : await compressImage(image.bitmap, outputFormat, quality);

  return { ...result, format: outputFormat };
}
