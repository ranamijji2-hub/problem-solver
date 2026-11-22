import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "What ProblemSolver is, and the principle it's built around.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container as="main" className="max-w-2xl py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
        About ProblemSolver
      </h1>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/70">
        <p>
          Most tool websites hand you a long list and ask you to find the right one yourself.
          ProblemSolver works the other way: describe the problem in your own words, and it takes
          you straight to the tool that solves it.
        </p>
        <p>
          Every tool is free to use, works without an account, and — wherever the calculation
          allows it — runs entirely in your browser instead of on a server. Files you do need to
          upload are processed to produce your result and are not kept afterward.
        </p>
        <p>
          The catalog grows based on what people actually search for, including the problems it
          can&apos;t yet solve.
        </p>
      </div>
    </Container>
  );
}
