/**
 * Discount Calculator logic. Tax is optional and applied after the
 * discount (the common real-world order for a sale price), kept as a
 * single flat rate to avoid overcomplicating what the brief calls "the
 * basic calculator".
 */

export interface DiscountInput {
  originalPrice: number;
  discountPercent: number;
  taxPercent?: number;
}

export interface DiscountOutput {
  discountAmount: number;
  priceAfterDiscount: number;
  taxAmount: number;
  finalPrice: number;
  totalSavings: number;
}

export type DiscountCalcResult = { ok: true; result: DiscountOutput } | { ok: false; error: string };

export function calculateDiscount(input: DiscountInput): DiscountCalcResult {
  const { originalPrice, discountPercent } = input;
  const taxPercent = input.taxPercent ?? 0;

  if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    return { ok: false, error: "Enter an original price of 0 or more." };
  }
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return { ok: false, error: "Discount percentage must be between 0 and 100." };
  }
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { ok: false, error: "Tax percentage must be between 0 and 100." };
  }

  const discountAmount = originalPrice * (discountPercent / 100);
  const priceAfterDiscount = originalPrice - discountAmount;
  const taxAmount = priceAfterDiscount * (taxPercent / 100);
  const finalPrice = priceAfterDiscount + taxAmount;

  return {
    ok: true,
    result: {
      discountAmount,
      priceAfterDiscount,
      taxAmount,
      finalPrice,
      totalSavings: discountAmount,
    },
  };
}
