import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { rotatePdf } from "./rotate";
import { makeTestPdf } from "./testHelpers";

describe("rotatePdf", () => {
  it("rotates every page by the given amount", async () => {
    const pdf = await makeTestPdf(3);
    const rotatedBytes = await rotatePdf(pdf, 90);
    const rotated = await PDFDocument.load(rotatedBytes);

    for (const page of rotated.getPages()) {
      expect(page.getRotation().angle).toBe(90);
    }
  });

  it("compounds rotation relative to the existing angle rather than resetting it", async () => {
    const pdf = await makeTestPdf(1);
    const rotatedOnce = await rotatePdf(pdf, 90);
    const rotatedTwice = await rotatePdf(rotatedOnce, 90);
    const doc = await PDFDocument.load(rotatedTwice);
    expect(doc.getPages()[0]?.getRotation().angle).toBe(180);
  });

  it("wraps around 360 degrees", async () => {
    const pdf = await makeTestPdf(1);
    let bytes = pdf;
    bytes = await rotatePdf(bytes, 270);
    bytes = await rotatePdf(bytes, 180);
    const doc = await PDFDocument.load(bytes);
    // 270 + 180 = 450 -> 450 % 360 = 90
    expect(doc.getPages()[0]?.getRotation().angle).toBe(90);
  });

  it("preserves page count", async () => {
    const pdf = await makeTestPdf(5);
    const rotatedBytes = await rotatePdf(pdf, 180);
    const doc = await PDFDocument.load(rotatedBytes);
    expect(doc.getPageCount()).toBe(5);
  });
});
