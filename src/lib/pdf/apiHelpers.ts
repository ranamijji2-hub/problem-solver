import { NextResponse } from "next/server";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { MAX_FILES_PER_REQUEST, MAX_TOTAL_UPLOAD_BYTES, formatBytes } from "./constraints";

const RATE_LIMIT = 12; // PDF processing requests
const RATE_WINDOW_MS = 60_000; // per minute, per client

/** Rate-limits a PDF tool request. Returns a 429 Response to short-circuit with, or null if allowed. */
export function checkPdfRateLimit(request: Request, toolSlug: string): NextResponse | null {
  const key = `pdf:${toolSlug}:${getClientKey(request)}`;
  const result = checkRateLimit(key, RATE_LIMIT, RATE_WINDOW_MS);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests — wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } }
    );
  }
  return null;
}

/** Pulls every File entry under `field` out of a FormData payload, in submitted order. */
export function collectFiles(formData: FormData, field: string): File[] {
  return formData.getAll(field).filter((entry): entry is File => entry instanceof File);
}

export interface FileCountCheck {
  ok: boolean;
  error?: string;
}

/** Validates the overall shape of a multi-file upload before validating each file individually. */
export function checkFileBudget(files: File[], { min = 1, max = MAX_FILES_PER_REQUEST }: { min?: number; max?: number } = {}): FileCountCheck {
  if (files.length < min) {
    return { ok: false, error: min === 1 ? "Add a file to continue." : `Add at least ${min} files.` };
  }
  if (files.length > max) {
    return { ok: false, error: `Add no more than ${max} files at once.` };
  }
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return { ok: false, error: `Total upload size (${formatBytes(totalBytes)}) is over the ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)} limit.` };
  }
  return { ok: true };
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Thrown for a validation failure discovered mid-processing (e.g. bad page-range syntax), caught by each route's outer try/catch and turned into a clean 400. */
export class PdfToolError extends Error {}

/** Generic, safe fallback for anything unexpected — never echoes internal error details to the client. */
export function internalErrorResponse(): NextResponse {
  return NextResponse.json({ error: "Something went wrong while processing your file. Please try again." }, { status: 500 });
}

/** Sends processed file bytes back as a downloadable attachment. */
export function fileResponse(bytes: Uint8Array, filename: string, contentType: string, extraHeaders?: Record<string, string>): Response {
  const body = new Uint8Array(bytes); // defensive copy boundary for the Response body
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}"`,
      "Content-Length": String(body.byteLength),
      "X-Robots-Tag": "noindex",
      ...extraHeaders,
    },
  });
}

/** Strips anything from a filename that isn't safe in a Content-Disposition header or on any common filesystem. */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\?%*:|"<>]/g, "-").trim();
  return base.length > 0 ? base.slice(0, 150) : "download";
}

/** Derives an output filename from an input filename: "report.pdf" + "-merged" -> "report-merged.pdf". */
export function deriveFilename(originalName: string, suffix: string, newExtension = "pdf"): string {
  const withoutExt = originalName.replace(/\.[^./]+$/, "");
  return sanitizeFilename(`${withoutExt || "file"}${suffix}.${newExtension}`);
}
