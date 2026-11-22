import type { ToolDefinition } from "@/lib/tools/types";
import { ToolCard } from "./ToolCard";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-12 border-t border-line pt-8">
      <h2 id="related-heading" className="font-display text-xl font-semibold text-ink">
        Related tools
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={`${tool.category}/${tool.slug}`} tool={tool} />
        ))}
      </div>
    </section>
  );
}
