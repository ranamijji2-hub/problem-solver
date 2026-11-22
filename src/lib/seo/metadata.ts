import type { Metadata } from "next";
import type { CategoryDefinition } from "../tools/types";
import type { ToolDefinition } from "../tools/types";
import { getToolPath } from "../tools/registry";
import { getSiteUrl } from "../utils";

const SITE_NAME = "ProblemSolver";
const DEFAULT_DESCRIPTION =
  "Tell us your problem. Get the solution instantly. Free calculators, PDF, image, AI, SEO, developer, and student tools.";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string; // starts with "/"
  noindex?: boolean;
  ogImage?: string;
}

/**
 * Single place that assembles title, meta description, canonical, and
 * OpenGraph tags, so every page gets the full SEO set from the brief just
 * by calling this with the right inputs — no page reimplements the
 * boilerplate.
 */
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  ogImage = "/opengraph-image",
}: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: `${siteUrl}${ogImage}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${siteUrl}${ogImage}`],
    },
  };
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  const path = getToolPath(tool);
  const description =
    tool.shortDescription.length <= 155
      ? tool.shortDescription
      : `${tool.shortDescription.slice(0, 152)}...`;

  return buildMetadata({
    title: tool.name,
    description,
    path,
    noindex: tool.status !== "live" && tool.status !== "placeholder",
  });
}

export function categoryMetadata(category: CategoryDefinition): Metadata {
  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/${category.slug}`,
  });
}

export function homeMetadata(): Metadata {
  return buildMetadata({
    title: `${SITE_NAME} — Tell us your problem. Get the solution instantly.`,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });
}

/** Breadcrumb JSON-LD structured data for a tool page. */
export function toolBreadcrumbJsonLd(tool: ToolDefinition, categoryName: string) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}/${tool.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${siteUrl}${getToolPath(tool)}`,
      },
    ],
  };
}

/** FAQPage JSON-LD structured data, only emitted when a tool has real FAQs. */
export function toolFaqJsonLd(tool: ToolDefinition) {
  if (!tool.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Safely serializes a JSON-LD object for use in dangerouslySetInnerHTML.
 * Every field going into structured data today is developer-authored (tool
 * names, FAQ copy in the registry files), so this isn't exploitable yet —
 * but it becomes a real stored-XSS vector the moment FAQ content is
 * editable from the planned admin panel (Prisma's Faq model already
 * exists for that). Escaping "<" as its Unicode form prevents a value
 * containing "</script>" from breaking out of the script tag; JSON.stringify
 * never produces literal "<", so this is safe to apply unconditionally
 * without corrupting valid JSON.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
