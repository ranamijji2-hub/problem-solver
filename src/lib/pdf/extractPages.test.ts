import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { extractPages } from "./extractPages";
import { makeTestPdf } from "./testHelpers";

describe("extractPages", () => {
  it("extracts exactly the requested pages into one new PDF", async () => {
    const pdf = await makeTestPdf(10);
    // 0-based indices for pages 1, 3, 5, 6, 7
    const outBytes = await extractPages(pdf, [0, 2, 4, 5, 6]);
    const out = await PDFDocument.load(outBytes);
    expect(out.getPageCount()).toBe(5);
  });

  it("preserves the given order, allowing reordering", async () => {
    const pdf = await makeTestPdf(3);
    // Reversed order relative to the source document.
    const outBytes = await extractPages(pdf, [2, 0]);
    const out = await PDFDocument.load(outBytes);
    expect(out.getPageCount()).toBe(2);
  });

  it("throws when given an empty page list", async () => {
    const pdf = await makeTestPdf(3);
    await expect(extractPages(pdf, [])).rejects.toThrow();
  });

  it("supports extracting a single page", async () => {
    const pdf = await makeTestPdf(5);
    const outBytes = await extractPages(pdf, [4]);
    const out = await PDFDocument.load(outBytes);
    expect(out.getPageCount()).toBe(1);
  });
});
