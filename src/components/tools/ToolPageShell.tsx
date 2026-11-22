import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "./Breadcrumbs";
import { FAQ } from "./FAQ";
import { RelatedTools } from "./RelatedTools";
import type { ToolDefinition } from "@/lib/tools/types";
import { getCategory } from "@/lib/tools/categories";
import { getRelatedTools, getToolPath } from "@/lib/tools/registry";
import { toolBreadcrumbJsonLd, toolFaqJsonLd, safeJsonLd } from "@/lib/seo/metadata";

export function ToolPageShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children?: ReactNode;
}) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool);
  const breadcrumbJsonLd = toolBreadcrumbJsonLd(tool, category?.name ?? tool.category);
  const faqJsonLd = toolFaqJsonLd(tool);

  return (
    <Container as="main" className="py-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}

      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: category?.name ?? tool.category, href: `/${tool.category}` },
          { name: tool.name, href: getToolPath(tool) },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {tool.name}
        </h1>
        {tool.status !== "live" && <Badge tone="amber">Coming soon</Badge>}
      </div>
      <p className="mt-3 max-w-2xl text-base text-ink/60">{tool.shortDescription}</p>

      <div className="mt-8">
        {children ?? (
          <div className="rounded-xs border border-dashed border-line px-6 py-14 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-amber-600">
              in progress
            </p>
            <p className="mt-3 text-sm text-ink/60">
              This tool&apos;s working UI ships in a later build phase. The page, URL, and SEO details
              are live now so nothing has to move later.
            </p>
          </div>
        )}
      </div>

      {tool.longDescription && (
        <div className="mt-10 max-w-2xl border-t border-line pt-8 text-sm leading-relaxed text-ink/65">
          <p>{tool.longDescription}</p>
        </div>
      )}

      {tool.faqs && <FAQ faqs={tool.faqs} />}
      <RelatedTools tools={related} />
    </Container>
  );
}
