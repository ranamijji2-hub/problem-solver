import { describe, expect, it } from "vitest";
import { calculateDiscount } from "./discount";

describe("calculateDiscount", () => {
  it("computes a basic discount with no tax", () => {
    const result = calculateDiscount({ originalPrice: 100, discountPercent: 20 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.discountAmount).toBe(20);
      expect(result.result.priceAfterDiscount).toBe(80);
      expect(result.result.finalPrice).toBe(80);
    }
  });

  it("applies tax after the discount", () => {
    const result = calculateDiscount({ originalPrice: 100, discountPercent: 10, taxPercent: 8 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.priceAfterDiscount).toBe(90);
      expect(result.result.taxAmount).toBeCloseTo(7.2, 5);
      expect(result.result.finalPrice).toBeCloseTo(97.2, 5);
    }
  });

  it("handles a 0% discount", () => {
    const result = calculateDiscount({ originalPrice: 50, discountPercent: 0 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.finalPrice).toBe(50);
  });

  it("handles a 100% discount", () => {
    const result = calculateDiscount({ originalPrice: 50, discountPercent: 100 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.finalPrice).toBe(0);
      expect(result.result.discountAmount).toBe(50);
    }
  });

  it("errors on a negative original price", () => {
    const result = calculateDiscount({ originalPrice: -10, discountPercent: 10 });
    expect(result.ok).toBe(false);
  });

  it("errors on a discount percentage outside 0-100", () => {
    expect(calculateDiscount({ originalPrice: 100, discountPercent: -5 }).ok).toBe(false);
    expect(calculateDiscount({ originalPrice: 100, discountPercent: 150 }).ok).toBe(false);
  });

  it("handles a 0 original price without producing NaN", () => {
    const result = calculateDiscount({ originalPrice: 0, discountPercent: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.finalPrice).toBe(0);
  });
});
