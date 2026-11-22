"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

const EXAMPLE_PROBLEMS = [
  "my pdf is too large",
  "join multiple pdfs",
  "425 out of 550 percentage",
  "resize my image",
  "calculate my cgpa",
  "create a professional cv",
];

interface SearchResultItem {
  slug: string;
  category: string;
  name: string;
  shortDescription: string;
  status: "live" | "placeholder" | "hidden";
  path: string;
  score: number;
}

/**
 * Cycles through example problems in the placeholder, in the empty state,
 * to teach the "describe your problem" interaction model without extra
 * copy. Typing anything real stops the cycle immediately.
 */
function useCyclingPlaceholder(active: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLE_PROBLEMS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [active]);

  return EXAMPLE_PROBLEMS[index] ?? EXAMPLE_PROBLEMS[0] ?? "describe your problem";
}

export function UniversalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [noMatch, setNoMatch] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const placeholder = useCyclingPlaceholder(query.length === 0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setNoMatch(false);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = (await res.json()) as { results: SearchResultItem[]; noMatch: boolean };
        setResults(data.results);
        setNoMatch(data.noMatch);
        setOpen(true);
      } catch {
        // Search staying quiet on network failure is preferable to an error state here.
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative w-full">
      <label htmlFor="universal-search" className="sr-only">
        Describe your problem
      </label>

      <div className="flex items-center gap-3 rounded-xs border border-line bg-paper px-4 py-4 shadow-lift transition-colors focus-within:border-indigo-400 sm:px-5">
        <Search className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
        <span className="hidden font-mono text-sm text-ink/30 sm:inline">$</span>
        <input
          id="universal-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={`e.g. "${placeholder}"`}
          autoComplete="off"
          className="w-full bg-transparent font-mono text-sm text-ink placeholder:text-ink/35 focus:outline-none sm:text-base"
        />
        {query.length === 0 && (
          <span
            aria-hidden="true"
            className="hidden h-4 w-px animate-cursor-blink bg-amber-500 sm:block"
          />
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xs border border-line bg-paper shadow-lift">
          {results.length > 0 ? (
            <ul className="divide-y divide-line">
              {results.map((result) => (
                <li key={`${result.category}/${result.slug}`}>
                  <Link
                    href={result.path}
                    onClick={() =>
                      trackEvent({
                        eventType: "search_result_click",
                        toolSlug: result.slug,
                        searchQuery: query,
                      })
                    }
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-indigo-50/60"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">{result.name}</span>
                      <span className="block text-xs text-ink/55">{result.shortDescription}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : noMatch ? (
            <p className="px-5 py-4 text-sm text-ink/60">
              No tool matches that yet — we log searches like this to decide what to build next.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
