import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple already-validated PDF documents into one, in the given
 * order. Takes raw bytes (not PDFDocument instances) so callers own the
 * validation step (see src/lib/pdf/validation.ts) and this function stays
 * a pure "bytes in, bytes out" transform that's easy to unit test.
 */
export async function mergePdfs(pdfBytesList: Uint8Array[]): Promise<Uint8Array> {
  if (pdfBytesList.length === 0) {
    throw new Error("mergePdfs requires at least one PDF.");
  }

  const merged = await PDFDocument.create();

  for (const bytes of pdfBytesList) {
    const source = await PDFDocument.load(bytes);
    const copiedPages = await merged.copyPages(source, source.getPageIndices());
    for (const page of copiedPages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}
