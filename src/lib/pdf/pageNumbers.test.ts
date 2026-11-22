import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addPageNumbers } from "./pageNumbers";
import { makeTestPdf } from "./testHelpers";

describe("addPageNumbers", () => {
  it("preserves page count and produces a valid PDF", async () => {
    const pdf = await makeTestPdf(4);
    const numberedBytes = await addPageNumbers(pdf, {
      position: "bottom-center",
      startAt: 1,
      format: "n",
      fontSize: 11,
    });
    const doc = await PDFDocument.load(numberedBytes);
    expect(doc.getPageCount()).toBe(4);
  });

  it("does not throw for every supported position", async () => {
    const pdf = await makeTestPdf(1);
    const positions = ["bottom-center", "bottom-right", "bottom-left", "top-center", "top-right", "top-left"] as const;
    for (const position of positions) {
      await expect(
        addPageNumbers(pdf, { position, startAt: 1, format: "n", fontSize: 11 })
      ).resolves.toBeInstanceOf(Uint8Array);
    }
  });

  it("accepts a custom starting number", async () => {
    const pdf = await makeTestPdf(3);
    await expect(
      addPageNumbers(pdf, { position: "bottom-center", startAt: 42, format: "n", fontSize: 11 })
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  it("supports the 'n of total' format without throwing", async () => {
    const pdf = await makeTestPdf(3);
    await expect(
      addPageNumbers(pdf, { position: "bottom-center", startAt: 1, format: "n-of-total", fontSize: 11 })
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});
