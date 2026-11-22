import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PageNumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";

export interface PageNumberOptions {
  position: PageNumberPosition;
  startAt: number;
  format: "n" | "n-of-total"; // "3" vs "3 of 20"
  fontSize: number;
}

const MARGIN = 24;

function computeXY(
  position: PageNumberPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number
): { x: number; y: number } {
  const isTop = position.startsWith("top");
  const y = isTop ? pageHeight - MARGIN - fontSize : MARGIN;

  if (position.endsWith("left")) return { x: MARGIN, y };
  if (position.endsWith("right")) return { x: pageWidth - MARGIN - textWidth, y };
  return { x: (pageWidth - textWidth) / 2, y };
}

/** Stamps a page number (optionally "n of total") onto every page of a PDF at the chosen position. */
export async function addPageNumbers(bytes: Uint8Array, options: PageNumberOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  pages.forEach((page, i) => {
    const number = options.startAt + i;
    const label = options.format === "n-of-total" ? `${number} of ${options.startAt + total - 1}` : String(number);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const { x, y } = computeXY(options.position, width, height, textWidth, options.fontSize);

    page.drawText(label, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.15, 0.15, 0.17),
    });
  });

  return doc.save();
}
