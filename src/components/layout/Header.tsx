import Link from "next/link";
import { categories } from "@/lib/tools/categories";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 shadow-panel backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-xs bg-gradient-to-br from-indigo-400 to-indigo-700 font-mono text-sm text-white shadow-lift"
          >
            {"?"}
          </span>
          ProblemSolver
        </Link>

        <nav aria-label="Categories" className="hidden items-center gap-1 lg:flex">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="rounded-xs px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-indigo-600/10 hover:text-indigo-600"
            >
              {category.shortName}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
