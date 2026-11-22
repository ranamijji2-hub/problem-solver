import Link from "next/link";
import { categories } from "@/lib/tools/categories";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">ProblemSolver</p>
          <p className="mt-2 max-w-xs text-sm text-ink/60">
            Tell us your problem. Get the solution instantly.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink/80">Categories</p>
          <ul className="mt-3 space-y-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/${category.slug}`}
                  className="text-sm text-ink/60 hover:text-indigo-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink/80">Product</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/about" className="text-sm text-ink/60 hover:text-indigo-600">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-ink/60 hover:text-indigo-600">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="text-sm text-ink/60 hover:text-indigo-600">
                Sitemap
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink/80">Privacy, by default</p>
          <p className="mt-3 text-sm text-ink/60">
            Files you upload are processed to produce your result and are not kept afterward.
            No account is required to use any tool.
          </p>
        </div>
      </Container>

      <Container className="flex flex-col items-start justify-between gap-2 border-t border-line py-6 text-xs text-ink/50 sm:flex-row sm:items-center">
        <p>© {year} ProblemSolver. All rights reserved.</p>
        <p>Built to solve one problem at a time.</p>
      </Container>
    </footer>
  );
}
