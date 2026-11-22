import { NextResponse } from "next/server";
import { z } from "zod";
import { searchTools, isNoMatch } from "@/lib/search";
import { getToolPath } from "@/lib/tools/registry";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  sessionHash: z.string().max(64).optional(),
});

const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per client

/**
 * GET /api/search?q=...
 *
 * Returns weighted-fuzzy tool matches for the Universal Search bar and, as
 * a side effect, records a search_query (or search_no_match) analytics
 * event. Matching itself (src/lib/search) has no server dependency and
 * could be called directly from the client — this route exists so the
 * analytics write happens server-side, where it can be rate-limited and
 * validated, without the client needing its own DB access.
 */
export async function GET(request: Request) {
  const rateLimitKey = `search:${getClientKey(request)}`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    sessionHash: searchParams.get("sessionHash") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { q, sessionHash } = parsed.data;
  const results = searchTools(q, 6);
  const noMatch = isNoMatch(results);

  // Best-effort logging: a broken analytics write must never break search.
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: noMatch ? "SEARCH_NO_MATCH" : "SEARCH_QUERY",
        searchQuery: q.slice(0, 200),
        sessionHash,
      },
    });
  } catch {
    // Swallow — search results still return below. Common cause in local
    // dev before DATABASE_URL is configured is a connection error here.
  }

  return NextResponse.json({
    query: q,
    noMatch,
    results: results.map((r) => ({
      slug: r.tool.slug,
      category: r.tool.category,
      name: r.tool.name,
      shortDescription: r.tool.shortDescription,
      status: r.tool.status,
      path: getToolPath(r.tool),
      score: r.score,
    })),
  });
}
