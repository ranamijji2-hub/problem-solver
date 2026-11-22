import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, getCategory } from "@/lib/tools/categories";
import { getToolsByCategory, getTool } from "@/lib/tools/registry";
import { categoryMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { ToolCard } from "@/components/tools/ToolCard";
import { studentRelevantCalculatorSlugs } from "@/lib/tools/student-tools";

interface PageProps {
  params: { category: string };
}

/**
 * A single dynamic route serves every category page (rather than one
 * folder per category) so that adding an eighth category is a registry
 * change, not a routing change — per the brief's "adding a new tool later
 * does not require rewriting the application" architecture requirement.
 * generateStaticParams below pre-renders exactly the known
 * categories; anything else 404s.
 */
export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = getCategory(params.category);
  if (!category) return {};
  return categoryMetadata(category);
}

export default function CategoryPage({ params }: PageProps) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const tools = getToolsByCategory(category.slug);

  // See src/lib/tools/student-tools.ts for the "no duplicate URLs" note
  // this implements: Student Tools surfaces these Calculators tools by
  // reference instead of redefining them at a second URL.
  const crossReferenced =
    category.slug === "student-tools"
      ? studentRelevantCalculatorSlugs
          .map((slug) => getTool("calculators", slug))
          .filter((t): t is NonNullable<typeof t> => Boolean(t))
      : [];

  return (
    <Container as="main" className="py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: category.name, href: `/${category.slug}` }]} />

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {category.name}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-ink/60">{category.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {crossReferenced.length > 0 && (
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Also useful for students
          </h2>
          <p className="mt-1.5 text-sm text-ink/55">
            These live under Calculators — one URL per tool, linked from wherever it&apos;s relevant.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crossReferenced.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
