/**
 * In-memory sliding-window rate limiter.
 *
 * Good enough for a single Node.js instance. On serverless/multi-instance
 * deployments each instance keeps its own counters, so it is paired with the
 * database-level limits in lib/booking.ts. Replace with a shared store
 * (e.g. Redis/Upstash) if needed — see README "Segurança".
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  if (now - lastSweep > 60_000) {
    for (const [k, hits] of buckets) {
      if (hits.every((ts) => now - ts > windowMs)) buckets.delete(k);
    }
    lastSweep = now;
  }

  const hits = (buckets.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = windowMs - (now - hits[0]);
    return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true as const, remaining: limit - hits.length };
}

export function resetRateLimits() {
  buckets.clear();
}

/** Client IP as reported by the hosting proxy. Only trustworthy behind a proxy that sets it. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}
