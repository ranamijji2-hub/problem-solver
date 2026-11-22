import { describe, expect, it } from "vitest";
import { searchTools } from "./index";

describe("searchTools", () => {
  it("matches a natural-language problem phrase to the right tool", () => {
    const results = searchTools("my pdf is too large");
    expect(results[0]?.tool.slug).toBe("compress-pdf");
  });

  it("matches a differently-phrased percentage problem", () => {
    const results = searchTools("425 out of 550 percentage");
    expect(results[0]?.tool.slug).toBe("percentage-calculator");
  });

  it("matches a merge-pdf problem phrased as joining files", () => {
    const results = searchTools("join multiple pdfs");
    expect(results.some((r) => r.tool.slug === "merge-pdf")).toBe(true);
  });

  it("returns nothing for an empty query", () => {
    expect(searchTools("")).toHaveLength(0);
  });

  it("returns no strong match for gibberish", () => {
    const results = searchTools("zzxxqqvv unrelated nonsense");
    expect(results.length === 0 || (results[0]?.score ?? 1) > 0.5).toBe(true);
  });
});
