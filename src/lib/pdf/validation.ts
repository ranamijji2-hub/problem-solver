import { PDFDocument } from "pdf-lib";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_PDF_EXTENSIONS,
  ALLOWED_PDF_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  PDF_MAGIC_BYTES,
  formatBytes,
} from "./constraints";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function hasAllowedExtension(filename: string, allowed: string[]): boolean {
  const lower = filename.toLowerCase();
  return allowed.some((ext) => lower.endsWith(ext));
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_MAGIC_BYTES.length) return false;
  return PDF_MAGIC_BYTES.every((byte, i) => bytes[i] === byte);
}

/**
 * Validates a single uploaded PDF: extension, declared MIME type, size,
 * the actual file signature (bytes, not the browser-supplied Content-Type
 * — a renamed .exe declaring "application/pdf" will fail this), and
 * finally a real parse attempt with pdf-lib. The parse step is what
 * catches a file that merely *starts* with "%PDF-" but is truncated,
 * corrupted, or otherwise not a well-formed PDF — client-side validation
 * can only ever check the first three of these, which is why the brief's
 * "do not trust client-side validation alone" applies here specifically.
 *
 * Encrypted/password-protected PDFs are rejected: this app has no UI for
 * collecting a password, and silently ignoring encryption would risk
 * mangling the output.
 */
export async function validatePdfUpload(file: File): Promise<ValidationResult<{ bytes: Uint8Array; doc: PDFDocument }>> {
  if (file.size === 0) {
    return { ok: false, error: `"${file.name}" is empty.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)}, which is over the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit.`,
    };
  }
  if (!hasAllowedExtension(file.name, ALLOWED_PDF_EXTENSIONS)) {
    return { ok: false, error: `"${file.name}" doesn't have a .pdf extension.` };
  }
  if (file.type && !ALLOWED_PDF_MIME_TYPES.includes(file.type)) {
    return { ok: false, error: `"${file.name}" isn't a PDF file.` };
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (!hasPdfSignature(bytes)) {
    return { ok: false, error: `"${file.name}" isn't a valid PDF file.` };
  }

  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: false, throwOnInvalidObject: false });
    if (doc.isEncrypted) {
      return { ok: false, error: `"${file.name}" is password-protected. Remove the password and try again.` };
    }
    if (doc.getPageCount() === 0) {
      return { ok: false, error: `"${file.name}" has no pages.` };
    }
    return { ok: true, value: { bytes, doc } };
  } catch {
    // Deliberately generic: never echo the parser's internal error text
    // back to the client, since it can contain details about the file's
    // internal structure that aren't useful to a user and shouldn't be
    // exposed by the server.
    return { ok: false, error: `"${file.name}" couldn't be read — it may be corrupted or not a real PDF.` };
  }
}

/** Validates a single uploaded JPG/PNG image for the Images → PDF tool. */
export async function validateImageUpload(file: File): Promise<ValidationResult<{ bytes: Uint8Array; kind: "jpg" | "png" }>> {
  if (file.size === 0) {
    return { ok: false, error: `"${file.name}" is empty.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatBytes(file.size)}, which is over the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit.`,
    };
  }
  if (!hasAllowedExtension(file.name, ALLOWED_IMAGE_EXTENSIONS)) {
    return { ok: false, error: `"${file.name}" must be a .jpg or .png file.` };
  }
  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return { ok: false, error: `"${file.name}" isn't a JPG or PNG image.` };
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  if (!isPng && !isJpg) {
    return { ok: false, error: `"${file.name}" isn't a valid JPG or PNG file.` };
  }

  return { ok: true, value: { bytes, kind: isPng ? "png" : "jpg" } };
}

/** Parses a page-range/page-list expression like "1,3,5-7" into a validated, deduplicated, sorted list of 0-based page indices. */
export function parsePageSelection(input: string, pageCount: number): ValidationResult<number[]> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter at least one page number." };
  }

  const indices = new Set<number>();
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end < 1 || start > end) {
        return { ok: false, error: `"${part}" isn't a valid page range.` };
      }
      if (end > pageCount) {
        return { ok: false, error: `Page ${end} doesn't exist — this PDF has ${pageCount} pages.` };
      }
      for (let p = start; p <= end; p++) indices.add(p - 1);
      continue;
    }

    const single = /^(\d+)$/.exec(part);
    if (single) {
      const page = Number(single[1]);
      if (page < 1 || page > pageCount) {
        return { ok: false, error: `Page ${page} doesn't exist — this PDF has ${pageCount} pages.` };
      }
      indices.add(page - 1);
      continue;
    }

    return { ok: false, error: `"${part}" isn't a valid page number or range.` };
  }

  if (indices.size === 0) {
    return { ok: false, error: "Enter at least one valid page number." };
  }

  return { ok: true, value: Array.from(indices).sort((a, b) => a - b) };
}

/**
 * Parses a comma-separated list of groups for the Split tool, where each
 * group becomes its own output PDF — e.g. "1-3, 4, 5-7" produces three
 * files. This differs from parsePageSelection above, which flattens
 * everything into a single combined set (what Extract Pages needs).
 */
export function parseSplitGroups(input: string, pageCount: number): ValidationResult<number[][]> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter at least one page or page range." };
  }

  const groups: number[][] = [];
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end < 1 || start > end) {
        return { ok: false, error: `"${part}" isn't a valid page range.` };
      }
      if (end > pageCount) {
        return { ok: false, error: `Page ${end} doesn't exist — this PDF has ${pageCount} pages.` };
      }
      const group: number[] = [];
      for (let p = start; p <= end; p++) group.push(p - 1);
      groups.push(group);
      continue;
    }

    const single = /^(\d+)$/.exec(part);
    if (single) {
      const page = Number(single[1]);
      if (page < 1 || page > pageCount) {
        return { ok: false, error: `Page ${page} doesn't exist — this PDF has ${pageCount} pages.` };
      }
      groups.push([page - 1]);
      continue;
    }

    return { ok: false, error: `"${part}" isn't a valid page number or range.` };
  }

  if (groups.length === 0) {
    return { ok: false, error: "Enter at least one valid page or page range." };
  }

  return { ok: true, value: groups };
}
