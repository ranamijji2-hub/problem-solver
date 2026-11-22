import { describe, expect, it } from "vitest";
import {
  heightForWidth,
  widthForHeight,
  resizeByPercent,
  fitWithinMaxEdge,
  fitWithinBox,
  clampCropRect,
  centeredRectForAspectRatio,
} from "./dimensions";

describe("heightForWidth", () => {
  it("preserves aspect ratio", () => {
    expect(heightForWidth(1000, { width: 2000, height: 1000 })).toBe(500);
  });

  it("returns 0 for a degenerate original width", () => {
    expect(heightForWidth(500, { width: 0, height: 100 })).toBe(0);
  });

  it("rounds to the nearest integer", () => {
    expect(heightForWidth(300, { width: 1000, height: 333 })).toBe(100);
  });
});

describe("widthForHeight", () => {
  it("preserves aspect ratio", () => {
    expect(widthForHeight(500, { width: 2000, height: 1000 })).toBe(1000);
  });

  it("returns 0 for a degenerate original height", () => {
    expect(widthForHeight(500, { width: 100, height: 0 })).toBe(0);
  });
});

describe("resizeByPercent", () => {
  it("halves dimensions at 50%", () => {
    expect(resizeByPercent({ width: 800, height: 600 }, 50)).toEqual({ width: 400, height: 300 });
  });

  it("leaves dimensions unchanged at 100%", () => {
    expect(resizeByPercent({ width: 800, height: 600 }, 100)).toEqual({ width: 800, height: 600 });
  });

  it("doubles dimensions at 200%", () => {
    expect(resizeByPercent({ width: 400, height: 300 }, 200)).toEqual({ width: 800, height: 600 });
  });

  it("never produces a 0 or negative dimension", () => {
    const result = resizeByPercent({ width: 10, height: 10 }, 1);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("clamps negative percentages to 0", () => {
    const result = resizeByPercent({ width: 100, height: 100 }, -50);
    expect(result).toEqual({ width: 1, height: 1 });
  });
});

describe("fitWithinMaxEdge", () => {
  it("leaves an image alone if already within the limit", () => {
    expect(fitWithinMaxEdge({ width: 800, height: 600 }, 2000)).toEqual({ width: 800, height: 600 });
  });

  it("downscales a wide image so the longest edge matches the limit", () => {
    const result = fitWithinMaxEdge({ width: 4000, height: 2000 }, 2000);
    expect(result.width).toBe(2000);
    expect(result.height).toBe(1000);
  });

  it("downscales a tall image based on height being the longest edge", () => {
    const result = fitWithinMaxEdge({ width: 1000, height: 4000 }, 2000);
    expect(result.height).toBe(2000);
    expect(result.width).toBe(500);
  });

  it("never upscales", () => {
    const result = fitWithinMaxEdge({ width: 300, height: 200 }, 2000);
    expect(result).toEqual({ width: 300, height: 200 });
  });
});

describe("fitWithinBox", () => {
  it("scales down to fit a square box", () => {
    const result = fitWithinBox({ width: 2000, height: 1000 }, { width: 1000, height: 1000 });
    expect(result).toEqual({ width: 1000, height: 500 });
  });

  it("preserves aspect ratio when the box has a different ratio", () => {
    const result = fitWithinBox({ width: 1000, height: 1000 }, { width: 1280, height: 720 });
    expect(result.width).toBe(result.height); // still square, just smaller
    expect(result.width).toBeLessThanOrEqual(720);
  });
});

describe("clampCropRect", () => {
  it("leaves a valid rect unchanged", () => {
    const result = clampCropRect({ x: 10, y: 10, width: 100, height: 100 }, { width: 500, height: 500 });
    expect(result).toEqual({ x: 10, y: 10, width: 100, height: 100 });
  });

  it("clamps a rect that extends past the right/bottom edge", () => {
    const result = clampCropRect({ x: 450, y: 450, width: 100, height: 100 }, { width: 500, height: 500 });
    expect(result.x + result.width).toBeLessThanOrEqual(500);
    expect(result.y + result.height).toBeLessThanOrEqual(500);
  });

  it("clamps negative x/y to 0", () => {
    const result = clampCropRect({ x: -50, y: -50, width: 100, height: 100 }, { width: 500, height: 500 });
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it("never exceeds the bounds even if the requested size is larger than the image", () => {
    const result = clampCropRect({ x: 0, y: 0, width: 900, height: 900 }, { width: 500, height: 500 });
    expect(result.width).toBe(500);
    expect(result.height).toBe(500);
  });
});

describe("centeredRectForAspectRatio", () => {
  it("produces a centered square within a wider box", () => {
    const rect = centeredRectForAspectRatio({ width: 400, height: 200 }, 1);
    expect(rect.width).toBe(rect.height);
    expect(rect.width).toBe(200);
    expect(rect.x).toBe(100); // centered horizontally
    expect(rect.y).toBe(0);
  });

  it("produces a centered rect matching the aspect ratio within a taller box", () => {
    const rect = centeredRectForAspectRatio({ width: 200, height: 400 }, 1);
    expect(rect.width).toBe(rect.height);
    expect(rect.height).toBe(200);
    expect(rect.y).toBe(100); // centered vertically
  });

  it("respects a non-square aspect ratio", () => {
    const rect = centeredRectForAspectRatio({ width: 1000, height: 1000 }, 16 / 9);
    expect(rect.width / rect.height).toBeCloseTo(16 / 9, 2);
  });
});
