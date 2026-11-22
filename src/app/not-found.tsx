import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container as="main" className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-amber-600">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        That page doesn&apos;t exist.
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        The tool or page you&apos;re looking for may have moved. Try describing your problem from
        the homepage instead.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/">Go to homepage</LinkButton>
        <Link
          href="/about"
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-ink/70 hover:text-indigo-600"
        >
          About ProblemSolver
        </Link>
      </div>
    </Container>
  );
}
