import { PDFDocument, StandardFonts } from "pdf-lib";

/** Builds a simple N-page PDF in memory, each page labeled with its page number, for use in tests. */
export async function makeTestPdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([200, 300]);
    page.drawText(`Page ${i + 1}`, { x: 20, y: 150, size: 14, font });
  }
  return doc.save();
}

/** A minimal valid 1x1 PNG, for image-input tests. */
export const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export function tinyPngBytes(): Uint8Array {
  return new Uint8Array(Buffer.from(TINY_PNG_BASE64, "base64"));
}
