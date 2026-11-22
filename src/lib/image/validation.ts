import { formatBytes } from "@/lib/format";
import type { ImageFormat } from "./types";

export const MAX_IMAGE_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB — generous since this never leaves the browser
export const MAX_IMAGES_PER_BATCH = 20;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function hasAllowedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Reads an image's real file signature (magic bytes) — this is what makes
 * validation resistant to a mismatched or spoofed extension/MIME type: a
 * file named "photo.png" that is secretly something else will not match
 * any of these signatures and gets rejected here, before ever reaching an
 * Image/canvas decode attempt.
 */
export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  // WebP: "RIFF" .... "WEBP" — bytes 0-3 and 8-11.
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

/**
 * Synchronous checks only (extension, declared MIME, size, magic bytes) —
 * kept separate from the async decode step in engine.ts (which needs a
 * real browser Image/canvas and can't run outside one) so this part is
 * unit-testable on its own.
 */
export function validateImageFileSync(file: File, bytes: Uint8Array): ValidationResult<{ format: ImageFormat }> {
  if (file.size === 0) {
    return { ok: false, error: `"${file.name}" is empty.` };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)}, which is over the ${formatBytes(MAX_IMAGE_FILE_SIZE_BYTES)} limit.`,
    };
  }
  if (!hasAllowedExtension(file.name)) {
    return { ok: false, error: `"${file.name}" must be a JPG, PNG, or WebP file.` };
  }
  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { ok: false, error: `"${file.name}" isn't a supported image type.` };
  }

  const format = detectImageFormat(bytes);
  if (!format) {
    return { ok: false, error: `"${file.name}" isn't a valid JPG, PNG, or WebP file.` };
  }

  return { ok: true, value: { format } };
}
