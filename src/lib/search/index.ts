import Fuse, { type IFuseOptions } from "fuse.js";
import { allTools } from "../tools/registry";
import type { ToolDefinition } from "../tools/types";
import { expandQuery } from "./synonyms";

/**
 * MVP universal search (Phase 8 wires this into the homepage UI end to
 * end; this module is the matching engine itself, built in Phase 1 so the
 * rest of the app can be designed against a stable shape).
 *
 * Deliberately not embeddings-based: Fuse.js does in-memory weighted fuzzy
 * matching over tool metadata, which is enough precision for a few dozen
 * to a few hundred tools and costs nothing to run. If the catalog grows
 * into the thousands, or matching quality plateaus, revisit with a real
 * evaluation set before reaching for embeddings — see the MVP cost
 * principle in the project brief.
 */

export interface SearchResult {
  tool: ToolDefinition;
  score: number; // 0 (best) – 1 (worst), Fuse's native scale
}

const fuseOptions: IFuseOptions<ToolDefinition> = {
  includeScore: true,
  threshold: 0.4, // lower = stricter; 0.4 tolerates typos without over-matching
  ignoreLocation: true,
  keys: [
    { name: "problemPhrases", weight: 0.45 }, // natural-language problem descriptions win first
    { name: "name", weight: 0.25 },
    { name: "keywords", weight: 0.2 },
    { name: "shortDescription", weight: 0.1 },
  ],
};

let fuseInstance: Fuse<ToolDefinition> | null = null;

function getFuse(): Fuse<ToolDefinition> {
  // Excludes hidden tools from the index entirely; placeholders remain
  // searchable so a user searching for a not-yet-built tool lands on its
  // "coming soon" page rather than getting no result at all.
  if (!fuseInstance) {
    const searchable = allTools.filter((t) => t.status !== "hidden");
    fuseInstance = new Fuse(searchable, fuseOptions);
  }
  return fuseInstance;
}

export function searchTools(rawQuery: string, limit = 6): SearchResult[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const expanded = expandQuery(query);
  const results = getFuse().search(expanded, { limit });

  return results.map((r) => ({ tool: r.item, score: r.score ?? 1 }));
}

/** True when a query's best match is weak enough to count as "no match" for analytics. */
export function isNoMatch(results: SearchResult[]): boolean {
  return results.length === 0 || (results[0]?.score ?? 1) > 0.5;
}
