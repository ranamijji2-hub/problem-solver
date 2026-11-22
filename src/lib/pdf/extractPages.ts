import { PDFDocument } from "pdf-lib";

/**
 * Extracts a set of 0-based page indices from a PDF into a single new PDF,
 * preserving the given order (so a caller can also use this to reorder
 * pages, not just subset them).
 */
export async function extractPages(bytes: Uint8Array, pageIndices: number[]): Promise<Uint8Array> {
  if (pageIndices.length === 0) {
    throw new Error("extractPages requires at least one page index.");
  }
  const source = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(source, pageIndices);
  for (const page of copied) out.addPage(page);
  return out.save();
}
