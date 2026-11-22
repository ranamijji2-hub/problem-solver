import { describe, expect, it } from "vitest";
import { percentOf, whatPercentIs, percentageChange, percentageDifference } from "./percentage";

describe("percentOf", () => {
  it("computes X% of Y", () => {
    expect(percentOf(20, 150).value).toBe(30);
  });

  it("handles 0%", () => {
    expect(percentOf(0, 150).value).toBe(0);
  });

  it("handles negative percentages", () => {
    expect(percentOf(-10, 200).value).toBe(-20);
  });
});

describe("whatPercentIs", () => {
  it("computes what percent X is of Y", () => {
    const result = whatPercentIs(30, 150);
    expect("value" in result && result.value).toBe(20);
  });

  it("errors when the base is 0", () => {
    const result = whatPercentIs(10, 0);
    expect("error" in result).toBe(true);
  });
});

describe("percentageChange", () => {
  it("detects an increase", () => {
    const result = percentageChange(100, 120);
    expect("percent" in result && result.percent).toBe(20);
    expect("direction" in result && result.direction).toBe("increase");
  });

  it("detects a decrease", () => {
    const result = percentageChange(100, 80);
    expect("percent" in result && result.percent).toBe(20);
    expect("direction" in result && result.direction).toBe("decrease");
  });

  it("detects no change", () => {
    const result = percentageChange(100, 100);
    expect("percent" in result && result.percent).toBe(0);
    expect("direction" in result && result.direction).toBe("no change");
  });

  it("errors when starting value is 0", () => {
    const result = percentageChange(0, 50);
    expect("error" in result).toBe(true);
  });

  it("handles a negative starting value correctly", () => {
    const result = percentageChange(-50, -25);
    expect("percent" in result && result.percent).toBe(50);
    expect("direction" in result && result.direction).toBe("increase");
  });
});

describe("percentageDifference", () => {
  it("is symmetric regardless of argument order", () => {
    const a = percentageDifference(10, 20);
    const b = percentageDifference(20, 10);
    if (!("value" in a) || !("value" in b)) throw new Error("expected values");
    expect(a.value).toBe(b.value);
  });

  it("errors when both values are 0", () => {
    const result = percentageDifference(0, 0);
    expect("error" in result).toBe(true);
  });
});
