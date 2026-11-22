import { ShieldCheck, EyeOff, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "No forced sign-up",
    body: "Every tool works the moment you land on its page. An account is never required to get a result.",
  },
  {
    icon: EyeOff,
    title: "Files aren't kept",
    body: "Anything you upload is used to produce your result and is not stored afterward.",
  },
  {
    icon: Zap,
    title: "Built to be fast",
    body: "Calculators and formatters run in your browser; nothing routes through a server unless it has to.",
  },
];

export function TrustSection() {
  return (
    <section className="border-t border-line py-16">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div key={point.title}>
              <point.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-semibold text-ink">{point.title}</p>
              <p className="mt-1.5 text-sm leading-snug text-ink/55">{point.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
