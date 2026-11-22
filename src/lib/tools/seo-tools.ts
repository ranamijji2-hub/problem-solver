import type { ToolDefinition } from "./types";

export const seoTools: ToolDefinition[] = [
  {
    slug: "seo-checker",
    category: "seo-tools",
    name: "SEO Checker",
    shortDescription: "Check a page's title, meta description, headings, and other on-page SEO basics.",
    status: "placeholder",
    keywords: ["seo checker", "seo audit", "check seo"],
    problemPhrases: ["is my page seo friendly", "check my website seo"],
    runsClientSide: false,
    relatedSlugs: ["sitemap-generator"],
  },
  {
    slug: "sitemap-generator",
    category: "seo-tools",
    name: "Sitemap Generator",
    shortDescription: "Generate an XML sitemap for your website's pages.",
    status: "placeholder",
    keywords: ["sitemap generator", "generate sitemap", "xml sitemap"],
    problemPhrases: ["create a sitemap for my site", "generate sitemap.xml"],
    runsClientSide: false,
    relatedSlugs: ["robots-txt-generator"],
  },
  {
    slug: "robots-txt-generator",
    category: "seo-tools",
    name: "Robots.txt Generator",
    shortDescription: "Generate a robots.txt file that controls how crawlers access your site.",
    status: "placeholder",
    keywords: ["robots.txt generator", "generate robots.txt"],
    problemPhrases: ["create a robots.txt file", "block crawlers from a page"],
    runsClientSide: true,
    relatedSlugs: ["sitemap-generator"],
  },
];
