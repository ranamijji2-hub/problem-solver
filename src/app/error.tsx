"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button, LinkButton } from "@/components/ui/Button";

/**
 * Root error boundary. Without this file, an unhandled render error
 * anywhere in the app falls through to Next.js's generic, unbranded error
 * page — a real production-reliability gap, not a stylistic one.
 *
 * Next.js requires error boundaries to be Client Components (they use
 * React error boundary machinery under the hood, which needs client-side
 * state) — this is the one legitimate reason this file needs "use client"
 * despite rendering mostly static content.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Errors here are intentionally not sent anywhere by default — no
    // analytics or error-tracking provider is wired in yet. Logging to
    // the console at least keeps the error visible to whoever is
    // debugging locally or watching server logs in production.
    console.error(error);
  }, [error]);

  return (
    <Container as="main" className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        This wasn&apos;t your fault. Try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <LinkButton href="/" variant="secondary">
          Go to homepage
        </LinkButton>
      </div>
    </Container>
  );
}
