/**
 * Shared limits for every PDF tool. Centralized so the security posture
 * (max sizes, max file counts) is set in one place rather than copy-pasted
 * across 8 API routes.
 *
 * IMPORTANT — Vercel platform limit: these are this app's own guardrails.
 * Vercel serverless functions also enforce their own request body size
 * limit independently of anything set here (historically ~4.5MB on
 * standard plans unless configured otherwise). MAX_FILE_SIZE_BYTES below
 * is deliberately kept under that ceiling so the app's own validation
 * message is the one a user sees, rather than an opaque platform-level
 * request failure. Raise it only after confirming your Vercel plan's
 * actual limit.
 */
import { formatBytes } from "@/lib/format";

export { formatBytes };

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per file
export const MAX_TOTAL_UPLOAD_BYTES = 32 * 1024 * 1024; // 32MB combined per request
export const MAX_FILES_PER_REQUEST = 20;

export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"];
export const ALLOWED_PDF_EXTENSIONS = [".pdf"];

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

/** PDF file signature ("%PDF-"), checked against the first bytes of every upload. */
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d];
