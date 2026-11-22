import { PDFDocument } from "pdf-lib";

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
}

/**
 * "Compresses" a PDF by re-saving it with object streams enabled, which
 * lets pdf-lib pack multiple PDF objects into shared, Flate-compressed
 * streams instead of storing each one uncompressed. This measurably
 * shrinks PDFs with many objects (forms, many fonts, PDFs produced by
 * some office-suite exporters) but does NOT re-encode or downsample
 * embedded images — the dominant source of size in scanned/image-heavy
 * PDFs. Recompressing raster images server-side needs an image codec
 * (e.g. sharp), which was deliberately not added for Phase 3 — see the
 * completion report for why. The tool's UI and FAQ are explicit about
 * this limit so results aren't overpromised.
 */
export async function compressPdf(bytes: Uint8Array): Promise<CompressResult> {
  const doc = await PDFDocument.load(bytes);
  const compressed = await doc.save({ useObjectStreams: true, addDefaultPage: false });

  return {
    bytes: compressed,
    originalSize: bytes.byteLength,
    compressedSize: compressed.byteLength,
  };
}
