"use client";

import { useMemo, useState } from "react";
import { calculateDiscount } from "@/lib/calculators/discount";
import { formatNumber, parseNumberInput } from "@/lib/calculators/format";
import { NumberField } from "@/components/calculators/fields/NumberField";
import { CalculatorFrame } from "@/components/calculators/CalculatorFrame";
import { ResultCard } from "@/components/calculators/ResultCard";
import { HowToUse } from "@/components/calculators/HowToUse";
import { ExamplesBlock } from "@/components/calculators/ExamplesBlock";

export function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [includeTax, setIncludeTax] = useState(false);
  const [tax, setTax] = useState("");

  const { display, error } = useMemo(() => {
    const p = parseNumberInput(price);
    const d = parseNumberInput(discount);
    if (p === null || d === null) return { display: null, error: null };

    const taxPercent = includeTax ? parseNumberInput(tax) ?? 0 : 0;
    const result = calculateDiscount({ originalPrice: p, discountPercent: d, taxPercent });
    if (!result.ok) return { display: null, error: result.error };

    const { discountAmount, finalPrice } = result.result;
    return {
      display: {
        finalPrice: formatNumber(finalPrice, 2),
        savings: formatNumber(discountAmount, 2),
      },
      error: null,
    };
  }, [price, discount, includeTax, tax]);

  function handleReset() {
    setPrice("");
    setDiscount("");
    setIncludeTax(false);
    setTax("");
  }

  return (
    <div>
      <CalculatorFrame
        fields={
          <>
            <NumberField id="discount-price" label="Original price" value={price} onChange={setPrice} suffix="$" />
            <NumberField id="discount-percent" label="Discount" value={discount} onChange={setDiscount} suffix="%" />
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="discount-include-tax"
                type="checkbox"
                checked={includeTax}
                onChange={(e) => setIncludeTax(e.target.checked)}
                className="h-4 w-4 rounded-xs border-line text-indigo-600 focus:ring-0"
              />
              <label htmlFor="discount-include-tax" className="text-sm text-ink/70">
                Add tax on top of the sale price
              </label>
            </div>
            {includeTax && (
              <NumberField id="discount-tax" label="Tax rate" value={tax} onChange={setTax} suffix="%" />
            )}
          </>
        }
        onReset={handleReset}
        result={
          error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : display ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ResultCard
                label="Final price"
                value={`$${display.finalPrice}`}
                copyText={`$${display.finalPrice}`}
                tone="teal"
              />
              <ResultCard label="You save" value={`$${display.savings}`} copyText={`$${display.savings}`} tone="amber" />
            </div>
          ) : (
            <p className="text-sm text-ink/45">Enter a price and discount percentage to see the sale price.</p>
          )
        }
      />

      <HowToUse
        steps={[
          "Enter the original price and the discount percentage.",
          "Optionally check the tax box to add a tax rate on top of the discounted price.",
          "The final price and total savings appear instantly.",
        ]}
      />

      <ExamplesBlock
        examples={[
          { input: "$100 at 20% off", output: "$80.00, save $20.00" },
          { input: "$100 at 10% off + 8% tax", output: "$97.20" },
        ]}
      />
    </div>
  );
}

export default DiscountCalculator;
