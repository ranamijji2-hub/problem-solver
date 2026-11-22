/**
 * The eight top-level product categories. This union is the single source
 * of truth for category slugs — the URL segment, the Prisma Category.slug
 * values, and the category registry in ./categories.ts must all agree with
 * it. Adding a ninth category means updating this type, categories.ts,
 * and adding a matching route folder under src/app.
 */
export type CategorySlug =
  | "calculators"
  | "pdf-tools"
  | "image-tools"
  | "audio-tools"
  | "ai-tools"
  | "seo-tools"
  | "developer-tools"
  | "student-tools";

export type ToolStatus = "live" | "placeholder" | "hidden";

export interface ToolFaq {
  question: string;
  answer: string;
}

/**
 * Static, code-owned metadata describing a tool. Component loading is kept
 * out of this data registry so Next.js can analyze client chunks from the
 * dedicated top-level tool component registry.
 */
export interface ToolDefinition {
  slug: string;
  category: CategorySlug;
  name: string;
  shortDescription: string;
  longDescription?: string;
  status: ToolStatus;
  keywords: string[];
  problemPhrases: string[];
  relatedSlugs?: string[];
  faqs?: ToolFaq[];
  runsClientSide: boolean;
}

/** Code-owned description of a top-level category. */
export interface CategoryDefinition {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  /** lucide-react icon component name, resolved in components/ui. */
  icon: string;
}
