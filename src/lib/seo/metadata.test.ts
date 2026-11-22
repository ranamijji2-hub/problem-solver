import { describe, expect, it } from "vitest";
import { safeJsonLd } from "./metadata";

describe("safeJsonLd", () => {
  it("produces valid JSON for a normal object", () => {
    const result = safeJsonLd({ a: 1, b: "hello" });
    expect(JSON.parse(result)).toEqual({ a: 1, b: "hello" });
  });

  it("escapes a literal </script> sequence so it can't break out of the script tag", () => {
    const result = safeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(result).not.toContain("</script>");
    // The escaped form should still round-trip to the original string.
    expect(JSON.parse(result).text).toBe("</script><script>alert(1)</script>");
  });

  it("escapes every '<' character, not just the first", () => {
    const result = safeJsonLd({ text: "<<<" });
    expect(result).not.toContain("<");
  });

  it("handles null input gracefully (used for optional JSON-LD blocks)", () => {
    expect(safeJsonLd(null)).toBe("null");
  });
});
