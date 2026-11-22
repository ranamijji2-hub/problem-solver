import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { imagesToPdf } from "./imagesToPdf";
import { tinyPngBytes } from "./testHelpers";

describe("imagesToPdf", () => {
  it("creates one page per input image", async () => {
    const pngBytes = tinyPngBytes();
    const pdfBytes = await imagesToPdf([
      { bytes: pngBytes, kind: "png" },
      { bytes: pngBytes, kind: "png" },
      { bytes: pngBytes, kind: "png" },
    ]);
    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(3);
  });

  it("creates a single-page PDF for one image", async () => {
    const pdfBytes = await imagesToPdf([{ bytes: tinyPngBytes(), kind: "png" }]);
    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("throws when given no images", async () => {
    await expect(imagesToPdf([])).rejects.toThrow();
  });
});
