/**
 * Minimal fixed-window rate limiter, in-memory per server instance.
 *
 * Good enough for Phase 1–2 on a single Vercel instance / dev server. It
 * does NOT share state across serverless function instances, so under
 * real production traffic on Vercel this under-counts (each cold instance
 * starts its own counter). When traffic justifies it, swap this for a
 * shared store (e.g. Upstash Redis's free tier, which has a ready-made
 * @upstash/ratelimit package) without changing the call sites below — the
 * `checkRateLimit` signature is the seam.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Identifies the caller, e.g. `${ip}:${route}`.
 * @param limit Max requests allowed within the window.
 * @param windowMs Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Best-effort caller identity from a Next.js Request, for rate-limit keys only — never logged or stored. */
export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}
