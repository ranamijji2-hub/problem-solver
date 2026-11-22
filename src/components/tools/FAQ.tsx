import type { ToolFaq } from "@/lib/tools/types";

export function FAQ({ faqs }: { faqs: ToolFaq[] }) {
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="faq-heading" className="mt-12 border-t border-line pt-8">
      <h2 id="faq-heading" className="font-display text-xl font-semibold text-ink">
        Frequently asked questions
      </h2>
      <dl className="mt-4 divide-y divide-line">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-4">
            <dt className="text-sm font-semibold text-ink">{faq.question}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-ink/60">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
