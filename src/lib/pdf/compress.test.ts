import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { compressPdf } from "./compress";
import { makeTestPdf } from "./testHelpers";

describe("compressPdf", () => {
  it("returns a valid PDF with the same page count", async () => {
    const pdf = await makeTestPdf(5);
    const result = await compressPdf(pdf);
    const doc = await PDFDocument.load(result.bytes);
    expect(doc.getPageCount()).toBe(5);
  });

  it("reports original and compressed sizes", async () => {
    const pdf = await makeTestPdf(3);
    const result = await compressPdf(pdf);
    expect(result.originalSize).toBe(pdf.byteLength);
    expect(result.compressedSize).toBe(result.bytes.byteLength);
    expect(result.compressedSize).toBeGreaterThan(0);
  });
});
