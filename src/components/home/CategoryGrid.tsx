import Link from "next/link";
import { categories } from "@/lib/tools/categories";
import { Container } from "@/components/ui/Container";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export function CategoryGrid() {
  return (
    <section className="py-16">
      <Container>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Browse by category</h2>
          <p className="hidden font-mono text-xs text-ink/40 sm:block">{categories.length} categories</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, i) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xs border border-line bg-paper/70 p-5 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lift"
            >
              <span className="absolute right-4 top-4 font-mono text-xs text-ink/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-indigo-600/10 transition-colors group-hover:bg-amber-500/20">
                <CategoryIcon name={category.icon} className="h-5 w-5 text-indigo-600" />
              </span>
              <div className="mt-6">
                <p className="font-display text-base font-semibold text-ink">{category.name}</p>
                <p className="mt-1.5 text-sm leading-snug text-ink/55">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
