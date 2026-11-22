export interface CalculatorExample {
  input: string;
  output: string;
}

export function ExamplesBlock({ examples }: { examples: CalculatorExample[] }) {
  if (!examples.length) return null;

  return (
    <section aria-labelledby="examples-heading" className="mt-10">
      <h2 id="examples-heading" className="font-display text-xl font-semibold text-ink">
        Examples
      </h2>
      <div className="mt-4 divide-y divide-line rounded-xs border border-line">
        {examples.map((example) => (
          <div key={example.input} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-sm text-ink/70">{example.input}</span>
            <span className="font-mono text-sm font-semibold text-indigo-600">{example.output}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
