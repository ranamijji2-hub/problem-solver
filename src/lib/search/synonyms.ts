/**
 * Maps a colloquial word or phrase fragment a user might type to the
 * canonical terms used in ToolDefinition.keywords / problemPhrases. The
 * search index (./index.ts) expands the raw query with these before
 * matching, which is what lets fuzzy, non-technical phrasing ("my pdf
 * won't fit in the upload limit") reach the right tool without requiring
 * embeddings or a paid AI call — the brief's constraint for MVP search.
 *
 * Keep entries short and high-precision. A bad synonym silently pollutes
 * every query that contains it, which is worse than missing one.
 */
export const synonymMap: Record<string, string[]> = {
  shrink: ["compress", "reduce", "smaller"],
  big: ["large", "too big"],
  huge: ["large", "too big"],
  tiny: ["small", "resize"],
  combine: ["merge", "join"],
  join: ["merge", "combine"],
  split: ["separate", "extract"],
  convert: ["change format", "turn into"],
  "won't upload": ["compress", "too large"],
  "upload limit": ["compress", "too large"],
  grade: ["gpa", "percentage"],
  marks: ["percentage", "gpa", "aggregate"],
  resume: ["cv"],
  reword: ["rewrite", "paraphrase"],
  shorten: ["summarize"],
  tldr: ["summarize"],
  minify: ["compress", "format"],
  "pretty print": ["format"],
  ugly: ["format", "unreadable"],
  unreadable: ["format"],
  "how old": ["age"],
  birthday: ["age", "date"],
  weight: ["bmi"],
  "sale price": ["discount"],
  "percent off": ["discount"],
  crawler: ["robots.txt", "seo"],
  google: ["seo", "sitemap"],
};

/** Expand a lowercased query string with any matching synonym terms. */
export function expandQuery(query: string): string {
  const q = query.toLowerCase();
  const extras: string[] = [];
  for (const [term, expansions] of Object.entries(synonymMap)) {
    if (q.includes(term)) extras.push(...expansions);
  }
  return extras.length ? `${query} ${extras.join(" ")}` : query;
}
