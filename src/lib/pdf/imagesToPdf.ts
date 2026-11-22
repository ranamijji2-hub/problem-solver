import { PDFDocument } from "pdf-lib";

export interface ImageInput {
  bytes: Uint8Array;
  kind: "jpg" | "png";
}

const PAGE_MARGIN = 24;
// Fits the standard letter/A4-ish page range; images are scaled to fit
// within this box while preserving aspect ratio, then centered.
const MAX_PAGE_WIDTH = 612; // 8.5in at 72dpi (US Letter)
const MAX_PAGE_HEIGHT = 792; // 11in at 72dpi

/**
 * Builds a single PDF with one page per input image, each image scaled to
 * fit a US Letter-sized page (preserving aspect ratio) and centered.
 */
export async function imagesToPdf(images: ImageInput[]): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("imagesToPdf requires at least one image.");
  }

  const doc = await PDFDocument.create();

  for (const image of images) {
    const embedded = image.kind === "png" ? await doc.embedPng(image.bytes) : await doc.embedJpg(image.bytes);

    const maxW = MAX_PAGE_WIDTH - PAGE_MARGIN * 2;
    const maxH = MAX_PAGE_HEIGHT - PAGE_MARGIN * 2;
    const scale = Math.min(maxW / embedded.width, maxH / embedded.height, 1);
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    const page = doc.addPage([MAX_PAGE_WIDTH, MAX_PAGE_HEIGHT]);
    page.drawImage(embedded, {
      x: (MAX_PAGE_WIDTH - drawWidth) / 2,
      y: (MAX_PAGE_HEIGHT - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return doc.save();
}
