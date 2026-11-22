import { describe, expect, it } from "vitest";
import { parsePageSelection, parseSplitGroups } from "./validation";

describe("parsePageSelection", () => {
  it("parses a simple comma list", () => {
    const result = parsePageSelection("1,3,5", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([0, 2, 4]);
  });

  it("parses a range", () => {
    const result = parsePageSelection("5-7", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([4, 5, 6]);
  });

  it("parses a mix of singles and ranges, deduplicated and sorted", () => {
    const result = parsePageSelection("3, 1, 5-7, 3", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([0, 2, 4, 5, 6]);
  });

  it("rejects a page number beyond the document's page count", () => {
    const result = parsePageSelection("15", 10);
    expect(result.ok).toBe(false);
  });

  it("rejects page 0 and negative-looking input", () => {
    expect(parsePageSelection("0", 10).ok).toBe(false);
  });

  it("rejects an inverted range", () => {
    const result = parsePageSelection("7-5", 10);
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(parsePageSelection("", 10).ok).toBe(false);
    expect(parsePageSelection("   ", 10).ok).toBe(false);
  });

  it("rejects garbage input", () => {
    expect(parsePageSelection("abc", 10).ok).toBe(false);
  });

  it("handles whitespace around tokens", () => {
    const result = parsePageSelection(" 1 , 2 , 3 ", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([0, 1, 2]);
  });
});

describe("parseSplitGroups", () => {
  it("produces one group per comma-separated token", () => {
    const result = parseSplitGroups("1-3, 4, 5-7", 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        [0, 1, 2],
        [3],
        [4, 5, 6],
      ]);
    }
  });

  it("rejects a range exceeding the page count", () => {
    const result = parseSplitGroups("1-20", 10);
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(parseSplitGroups("", 10).ok).toBe(false);
  });

  it("allows overlapping groups (unlike parsePageSelection, groups aren't deduplicated)", () => {
    const result = parseSplitGroups("1-3, 2-4", 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(2);
  });
});
