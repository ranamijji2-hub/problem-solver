import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { splitEveryPage, splitByGroups } from "./split";
import { makeTestPdf } from "./testHelpers";

describe("splitEveryPage", () => {
  it("produces one output file per page", async () => {
    const pdf = await makeTestPdf(4);
    const outputs = await splitEveryPage(pdf, "doc");
    expect(outputs).toHaveLength(4);
    expect(outputs[0]?.name).toBe("doc-page-1.pdf");
    expect(outputs[3]?.name).toBe("doc-page-4.pdf");
  });

  it("each output file has exactly one page", async () => {
    const pdf = await makeTestPdf(3);
    const outputs = await splitEveryPage(pdf, "doc");
    for (const output of outputs) {
      const single = await PDFDocument.load(output.bytes);
      expect(single.getPageCount()).toBe(1);
    }
  });
});

describe("splitByGroups", () => {
  it("produces one output file per group, with correct page counts", async () => {
    const pdf = await makeTestPdf(10);
    // groups are 0-based indices: [0,1,2], [3], [4,5,6]
    const outputs = await splitByGroups(pdf, [[0, 1, 2], [3], [4, 5, 6]], "doc");
    expect(outputs).toHaveLength(3);

    const first = await PDFDocument.load(outputs[0]!.bytes);
    expect(first.getPageCount()).toBe(3);

    const second = await PDFDocument.load(outputs[1]!.bytes);
    expect(second.getPageCount()).toBe(1);

    const third = await PDFDocument.load(outputs[2]!.bytes);
    expect(third.getPageCount()).toBe(3);
  });

  it("names single-page groups differently from multi-page groups", async () => {
    const pdf = await makeTestPdf(5);
    const outputs = await splitByGroups(pdf, [[0], [1, 2, 3]], "doc");
    expect(outputs[0]?.name).toBe("doc-page-1.pdf");
    expect(outputs[1]?.name).toBe("doc-pages-2-4.pdf");
  });
});
