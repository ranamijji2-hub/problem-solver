import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Privacy",
  description: "How ProblemSolver handles files, usage data, and analytics.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Container as="main" className="max-w-2xl py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Privacy", href: "/privacy" }]} />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">Privacy</h1>

      <div className="mt-5 space-y-6 text-sm leading-relaxed text-ink/70">
        <section>
          <h2 className="font-display text-base font-semibold text-ink">Files you upload</h2>
          <p className="mt-2">
            How a file is handled depends on the tool:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-ink">Calculators and Image tools</strong> run entirely in
              your browser. The file never leaves your device — nothing is uploaded anywhere.
            </li>
            <li>
              <strong className="text-ink">PDF tools</strong> process your file on our server
              because PDF processing isn&apos;t practical to do fully in-browser. Your file is
              held in memory only for the seconds it takes to produce your result, is never
              written to disk, and is discarded immediately afterward — we don&apos;t keep a copy.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-base font-semibold text-ink">Accounts</h2>
          <p className="mt-2">No account or sign-up is required to use any tool.</p>
        </section>
        <section>
          <h2 className="font-display text-base font-semibold text-ink">Analytics</h2>
          <p className="mt-2">
            We record product events — which tool was opened, whether a search matched a tool,
            whether a result was downloaded — to understand which tools are useful and which
            problems people describe that nothing yet solves. These events do not include your IP
            address, an account identifier, or the contents of anything you upload.
          </p>
        </section>
      </div>
    </Container>
  );
}
