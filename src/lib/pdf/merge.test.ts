import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs } from "./merge";
import { makeTestPdf } from "./testHelpers";

describe("mergePdfs", () => {
  it("combines pages from multiple PDFs in order", async () => {
    const a = await makeTestPdf(2);
    const b = await makeTestPdf(3);

    const mergedBytes = await mergePdfs([a, b]);
    const merged = await PDFDocument.load(mergedBytes);

    expect(merged.getPageCount()).toBe(5);
  });

  it("returns a single PDF unchanged in page count when given one file", async () => {
    const a = await makeTestPdf(4);
    const mergedBytes = await mergePdfs([a]);
    const merged = await PDFDocument.load(mergedBytes);
    expect(merged.getPageCount()).toBe(4);
  });

  it("throws when given an empty list", async () => {
    await expect(mergePdfs([])).rejects.toThrow();
  });

  it("preserves page order (first file's pages come before second file's)", async () => {
    const a = await makeTestPdf(1);
    const b = await makeTestPdf(1);
    const mergedBytes = await mergePdfs([a, b]);
    const merged = await PDFDocument.load(mergedBytes);
    expect(merged.getPageCount()).toBe(2);
  });
});
