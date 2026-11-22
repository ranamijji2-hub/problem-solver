import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics/events";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { allTools } from "@/lib/tools/registry";

export const runtime = "nodejs";

const RATE_LIMIT = 60; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per client

const EVENT_TYPE_TO_DB = {
  tool_view: "TOOL_VIEW",
  tool_start: "TOOL_START",
  tool_complete: "TOOL_COMPLETE",
  tool_error: "TOOL_ERROR",
  search_query: "SEARCH_QUERY",
  search_result_click: "SEARCH_RESULT_CLICK",
  search_no_match: "SEARCH_NO_MATCH",
  download: "DOWNLOAD",
} as const;

/**
 * POST /api/analytics
 *
 * Accepts one product event at a time (see src/lib/analytics/events.ts for
 * the allowed event types and payload shape). Deliberately does not read
 * or store the caller's IP address, does not touch cookies, and rejects
 * anything outside the validated schema — see the SECURITY section of the
 * project brief ("validate all inputs", "sanitize user-generated content").
 */
export async function POST(request: Request) {
  const rateLimitKey = `analytics:${getClientKey(request)}`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
  }

  const { eventType, toolSlug, searchQuery, metadata, sessionHash } = parsed.data;

  // Phase 6 hardening: a toolSlug that doesn't match any real tool is
  // either a bug in the calling code or a probing/junk request — reject
  // it with a clear 400 rather than silently writing unattributable rows
  // that would pollute the per-tool usage stats the Analytics phase reads.
  if (toolSlug && !allTools.some((t) => t.slug === toolSlug)) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: EVENT_TYPE_TO_DB[eventType],
        toolSlug,
        searchQuery,
        metadata: metadata ?? undefined,
        sessionHash,
      },
    });
  } catch {
    // Analytics is best-effort by design; a DB hiccup should never surface
    // as an error to whatever UI action triggered the event.
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
