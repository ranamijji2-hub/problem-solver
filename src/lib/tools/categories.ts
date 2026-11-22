import type { CategoryDefinition, CategorySlug } from "./types";

export const categories: CategoryDefinition[] = [
  {
    slug: "calculators",
    name: "Calculators",
    shortName: "Calculators",
    description:
      "Fast, accurate calculators for percentages, grades, dates, and everyday math — no sign-up, nothing uploaded.",
    icon: "Calculator",
  },
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    shortName: "PDF",
    description:
      "Compress, merge, split, and convert PDF files in your browser or with automatic deletion after processing.",
    icon: "FileText",
  },
  {
    slug: "image-tools",
    name: "Image Tools",
    shortName: "Images",
    description:
      "Resize, compress, and convert images between formats without losing more quality than you have to.",
    icon: "Image",
  },
  {
    slug: "audio-tools",
    name: "Audio Tools",
    shortName: "Audio",
    description:
      "Compress audio files to smaller MP3s right in your browser — choose the quality, preview, and download.",
    icon: "Headphones",
  },
  {
    slug: "ai-tools",
    name: "AI Tools",
    shortName: "AI",
    description:
      "Summarize, rewrite, and draft text with AI assistance for writing tasks that would otherwise eat your afternoon.",
    icon: "Sparkles",
  },
  {
    slug: "seo-tools",
    name: "SEO Tools",
    shortName: "SEO",
    description:
      "Check on-page SEO, and generate the sitemap and robots.txt files search engines expect.",
    icon: "Search",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    shortName: "Dev",
    description:
      "Format and validate JSON and other everyday developer utilities, all processed locally in your browser.",
    icon: "Code2",
  },
  {
    slug: "student-tools",
    name: "Student Tools",
    shortName: "Student",
    description:
      "Grade, attendance, and aggregate calculators built around how students and universities actually compute them.",
    icon: "GraduationCap",
  },
];

export const categoryMap: Record<CategorySlug, CategoryDefinition> =
  Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
    CategorySlug,
    CategoryDefinition
  >;

export function getCategory(slug: string): CategoryDefinition | undefined {
  return categoryMap[slug as CategorySlug];
}
