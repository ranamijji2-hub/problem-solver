import { z } from "zod";

/**
 * The product events named in the brief. Kept as a const array (not just a
 * type) so both the Zod schema below and the Prisma EventType enum can be
 * generated from / checked against the same list by hand.
 */
export const EVENT_TYPES = [
  "tool_view",
  "tool_start",
  "tool_complete",
  "tool_error",
  "search_query",
  "search_result_click",
  "search_no_match",
  "download",
] as const;

export type ClientEventType = (typeof EVENT_TYPES)[number];

/**
 * Payload accepted by POST /api/analytics. Intentionally minimal: no
 * client IP is read or stored, no cookie/user id, nothing free-text beyond
 * a short search query. `metadata` is for small structured extras (e.g.
 * which format a download used) — never put user content in it.
 */
export const analyticsEventSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  toolSlug: z.string().max(120).optional(),
  searchQuery: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  // Non-reversible per-tab token, regenerated each browser session. Used
  // only to de-duplicate rollups, never to identify a person.
  sessionHash: z.string().max(64).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

/**
 * Client-side fire-and-forget event tracker. Uses navigator.sendBeacon
 * when available so tracking a "download" or "tool_complete" event never
 * blocks or delays the action the user actually asked for.
 */
export function trackEvent(event: AnalyticsEventInput): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(event);

  try {
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never surface an error to the user.
  });
}
