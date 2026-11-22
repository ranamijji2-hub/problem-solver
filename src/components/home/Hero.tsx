import { UniversalSearch } from "./UniversalSearch";

const chips = ["No sign-up", "Files stay private", "Free to use"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[length:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[40rem] -translate-x-[70%] rounded-full bg-indigo-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-[28rem] translate-x-[10%] rounded-full bg-amber-400/25 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-amber-600 shadow-panel">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          describe the problem, not the tool
        </p>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
          Tell us your{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-amber-500 bg-clip-text text-transparent">problem.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink/60">
          Get the solution instantly — no browsing, no sign-up, no guessing which tool you need.
        </p>

        <div className="mt-9">
          <UniversalSearch />
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip) => (
            <li key={chip} className="rounded-full border border-line bg-paper/70 px-3 py-1 text-xs text-ink/60">
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
