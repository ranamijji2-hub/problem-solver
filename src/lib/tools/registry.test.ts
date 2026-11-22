import { describe, expect, it } from "vitest";
import { allTools, getRelatedTools, getToolPath, getPopularTools } from "./registry";
import { categoryMap } from "./categories";
import { toolComponents } from "./tool-components";

describe("tool registry", () => {
  it("has no duplicate tool paths (no duplicate URLs for the same tool)", () => {
    const paths = allTools.map((t) => getToolPath(t));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every tool belongs to a known category", () => {
    for (const tool of allTools) {
      expect(categoryMap[tool.category]).toBeDefined();
    }
  });

  it("every relatedSlugs entry resolves to a real tool in the same category", () => {
    for (const tool of allTools) {
      const related = getRelatedTools(tool);
      expect(related.length).toBe(tool.relatedSlugs?.length ?? 0);
      for (const r of related) {
        expect(r.category).toBe(tool.category);
      }
    }
  });

  it("every tool has at least one keyword and one problem phrase for search", () => {
    for (const tool of allTools) {
      expect(tool.keywords.length).toBeGreaterThan(0);
      expect(tool.problemPhrases.length).toBeGreaterThan(0);
    }
  });

  it("every live tool has a registered component to render", () => {
    for (const tool of allTools) {
      if (tool.status === "live") {
        expect(toolComponents[`${tool.category}/${tool.slug}`]).toBeTypeOf("function");
      }
    }
  });

  it("all 8 Phase 2 calculators are live", () => {
    const slugs = [
      "percentage-calculator",
      "age-calculator",
      "gpa-calculator",
      "cgpa-calculator",
      "attendance-calculator",
      "date-calculator",
      "bmi-calculator",
      "discount-calculator",
    ];
    for (const slug of slugs) {
      const tool = allTools.find((t) => t.category === "calculators" && t.slug === slug);
      expect(tool?.status).toBe("live");
    }
  });

  it("all 8 Phase 3 PDF tools are live", () => {
    const slugs = [
      "merge-pdf",
      "split-pdf",
      "compress-pdf",
      "pdf-to-jpg",
      "jpg-to-pdf",
      "rotate-pdf",
      "extract-pdf-pages",
      "add-page-numbers",
    ];
    for (const slug of slugs) {
      const tool = allTools.find((t) => t.category === "pdf-tools" && t.slug === slug);
      expect(tool?.status).toBe("live");
      expect(toolComponents[`${tool?.category}/${tool?.slug}`]).toBeTypeOf("function");
    }
  });

  it("all 9 Phase 4 image tools are live (image-to-text remains a placeholder, deferred to the OCR phase)", () => {
    const slugs = [
      "image-compressor",
      "image-resizer",
      "image-converter",
      "image-cropper",
      "image-rotator",
      "image-optimizer",
      "jpg-to-png",
      "png-to-jpg",
      "webp-converter",
    ];
    for (const slug of slugs) {
      const tool = allTools.find((t) => t.category === "image-tools" && t.slug === slug);
      expect(tool?.status).toBe("live");
      expect(toolComponents[`${tool?.category}/${tool?.slug}`]).toBeTypeOf("function");
    }
    const ocr = allTools.find((t) => t.category === "image-tools" && t.slug === "image-to-text");
    expect(ocr?.status).toBe("placeholder");
  });

  it("getPopularTools returns a representative mix across categories, not just the first-defined category (Phase 5 regression test)", () => {
    const popular = getPopularTools(8);
    const categoriesRepresented = new Set(popular.map((t) => t.category));
    // With calculators, pdf-tools, and image-tools all fully live, a
    // representative sample of 8 should span more than one category.
    expect(categoriesRepresented.size).toBeGreaterThan(1);
    expect(popular).toHaveLength(8);
    expect(popular.every((t) => t.status === "live")).toBe(true);
  });

  it("getPopularTools falls back to placeholders only when there aren't enough live tools to fill the limit", () => {
    const popular = getPopularTools(1000); // more than the total number of tools
    expect(popular.length).toBeLessThanOrEqual(allTools.length);
    // Every live tool should be included before any placeholder appears.
    const firstPlaceholderIndex = popular.findIndex((t) => t.status !== "live");
    const liveCount = allTools.filter((t) => t.status === "live").length;
    if (firstPlaceholderIndex !== -1) {
      expect(firstPlaceholderIndex).toBe(liveCount);
    }
  });
});
