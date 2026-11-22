import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTools, getTool } from "@/lib/tools/registry";
import { toolMetadata } from "@/lib/seo/metadata";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { toolComponents } from "@/lib/tools/tool-components";

interface PageProps {
  params: { category: string; tool: string };
}

export function generateStaticParams() {
  return allTools
    .filter((tool) => tool.status !== "hidden")
    .map((tool) => ({ category: tool.category, tool: tool.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const tool = getTool(params.category, params.tool);
  if (!tool) return {};
  return toolMetadata(tool);
}

export default function ToolPage({ params }: PageProps) {
  const tool = getTool(params.category, params.tool);
  if (!tool || tool.status === "hidden") notFound();

  // Dynamic components are created once at module scope in
  // src/lib/tools/tool-components.tsx. This is important for Next.js:
  // dynamic() must be statically analyzable and should not be called during
  // route rendering.
  if (tool.status === "live") {
    const ToolComponent = toolComponents[`${tool.category}/${tool.slug}`];

    if (ToolComponent) {
      return (
        <ToolPageShell tool={tool}>
          <ToolComponent />
        </ToolPageShell>
      );
    }
  }

  // A missing component mapping must never crash the route. The shell still
  // renders a useful fallback, and the mapping can be diagnosed separately.
  return <ToolPageShell tool={tool} />;
}
