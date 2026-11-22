import type { MetadataRoute } from "next";
import { categories } from "@/lib/tools/categories";
import { allTools, getToolPath } from "@/lib/tools/registry";
import { getSiteUrl } from "@/lib/utils";

/**
 * Generates /sitemap.xml at request time from the same tool registry that
 * drives routing and search, so a tool can never appear in the sitemap
 * without a real page behind it (or vice versa).
 *
 * Excluded on purpose, per the brief: admin pages, API routes, draft
 * tools, and internal/private pages. "hidden" tools are the ToolDefinition
 * equivalent of "draft" and are skipped; "placeholder" tools are included
 * because they have a real, useful "coming soon" page worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolEntries: MetadataRoute.Sitemap = allTools
    .filter((tool) => tool.status !== "hidden")
    .map((tool) => ({
      url: `${siteUrl}${getToolPath(tool)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: tool.status === "live" ? 0.9 : 0.5,
    }));

  return [...staticEntries, ...categoryEntries, ...toolEntries];
}
