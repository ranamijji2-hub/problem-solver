import { aiTools } from "./ai-tools";
import { audioTools } from "./audio-tools";
import { calculatorTools } from "./calculators";
import { developerTools } from "./developer-tools";
import { imageTools } from "./image-tools";
import { pdfTools } from "./pdf-tools";
import { seoTools } from "./seo-tools";
import { studentTools } from "./student-tools";
import type { CategorySlug, ToolDefinition } from "./types";

/**
 * Every tool in the product, in one flat array. Category-specific arrays
 * stay in their own files (one file per category) so that adding a tool to
 * an existing category, or a whole new category, never requires touching
 * unrelated files — this is the "modular ToolDefinition/config
 * architecture" the brief asks for.
 */
export const allTools: ToolDefinition[] = [
  ...calculatorTools,
  ...pdfTools,
  ...imageTools,
  ...audioTools,
  ...aiTools,
  ...seoTools,
  ...developerTools,
  ...studentTools,
];

const toolsBySlugKey = new Map<string, ToolDefinition>(
  allTools.map((tool) => [`${tool.category}/${tool.slug}`, tool])
);

/** Look up a single tool by category + slug, e.g. from a dynamic route. */
export function getTool(category: string, slug: string): ToolDefinition | undefined {
  return toolsBySlugKey.get(`${category}/${slug}`);
}

/** All tools belonging to one category, live tools first. */
export function getToolsByCategory(category: CategorySlug): ToolDefinition[] {
  return allTools
    .filter((t) => t.category === category)
    .sort((a, b) => statusWeight(a.status) - statusWeight(b.status));
}

/** Only tools with a working UI — what search and homepage "popular" pull from. */
export function getLiveTools(): ToolDefinition[] {
  return allTools.filter((t) => t.status === "live");
}

/**
 * Phase 1 stand-in for real usage-based ranking (Phase 10 replaces this
 * with a query against ToolUsageDaily). Round-robins one tool at a time
 * across categories (in category-registry order) so the homepage shows a
 * representative mix instead of always the same first N tools in
 * registry-definition order.
 *
 * Bug fixed in the Phase 5 audit: the original version sorted the full
 * flat `allTools` array by status only. Since every calculator, PDF, and
 * image tool is now "live", that sort was a stable no-op and `.slice(0,
 * limit)` always returned the first 8 entries in file-concatenation order
 * — which happened to be all 8 calculators, every time. PDF and Image
 * tools never appeared in "Popular tools" despite being live since Phase
 * 3/4. Falls back to placeholders only if there aren't enough live tools
 * yet to fill `limit`.
 */
export function getPopularTools(limit = 8): ToolDefinition[] {
  const byCategory = new Map<CategorySlug, ToolDefinition[]>();
  for (const tool of allTools) {
    if (tool.status !== "live") continue;
    const bucket = byCategory.get(tool.category) ?? [];
    bucket.push(tool);
    byCategory.set(tool.category, bucket);
  }

  const queues = Array.from(byCategory.values());
  const picked: ToolDefinition[] = [];
  let queueIndex = 0;
  while (picked.length < limit && queues.some((q) => q.length > 0)) {
    const queue = queues[queueIndex % queues.length];
    queueIndex++;
    if (!queue || queue.length === 0) continue;
    const next = queue.shift();
    if (next) picked.push(next);
  }

  if (picked.length < limit) {
    const placeholders = allTools.filter((t) => t.status === "placeholder").slice(0, limit - picked.length);
    picked.push(...placeholders);
  }

  return picked;
}

/** Resolve a tool's `relatedSlugs` (same category) into full definitions. */
export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  if (!tool.relatedSlugs?.length) return [];
  return tool.relatedSlugs
    .map((slug) => getTool(tool.category, slug))
    .filter((t): t is ToolDefinition => Boolean(t));
}

/** The canonical site path for a tool, e.g. "/calculators/percentage-calculator". */
export function getToolPath(tool: Pick<ToolDefinition, "category" | "slug">): string {
  return `/${tool.category}/${tool.slug}`;
}

function statusWeight(status: ToolDefinition["status"]): number {
  switch (status) {
    case "live":
      return 0;
    case "placeholder":
      return 1;
    case "hidden":
      return 2;
  }
}

export * from "./categories";
export * from "./types";
