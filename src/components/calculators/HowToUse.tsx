export function HowToUse({ steps }: { steps: string[] }) {
  if (!steps.length) return null;

  return (
    <section aria-labelledby="how-to-use-heading" className="mt-10">
      <h2 id="how-to-use-heading" className="font-display text-xl font-semibold text-ink">
        How to use this calculator
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink/70">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-indigo-600 font-mono text-xs text-paper">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
