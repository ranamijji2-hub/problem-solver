import { getPopularTools } from "@/lib/tools/registry";
import { Container } from "@/components/ui/Container";
import { ToolCard } from "@/components/tools/ToolCard";

export function PopularTools() {
  const tools = getPopularTools(8);

  return (
    <section className="border-t border-line py-16">
      <Container>
        <h2 className="font-display text-2xl font-semibold text-ink">Popular tools</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Ranked by real usage once traffic data exists — for now, a representative sample.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={`${tool.category}/${tool.slug}`} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
