import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createBookingRequest, type BookingErrorCode } from "@/lib/booking";
import { getClinic } from "@/lib/data";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { envInt, getClientIp, rateLimit } from "@/lib/rate-limit";
import { bookingRequestSchema } from "@/lib/validations";

const MAX_BODY_BYTES = 8 * 1024;

const statusFor: Record<BookingErrorCode, number> = {
  INVALID_SERVICE: 400,
  INVALID_PROFESSIONAL: 400,
  INVALID_DATE: 400,
  INVALID_TIME: 400,
  SLOT_UNAVAILABLE: 409,
  TOO_MANY_REQUESTS: 429,
};

function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Rejects cross-site form posts (CSRF-style abuse). */
function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited and validated
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Creates an appointment REQUEST (status PENDING). Responds with `ok: true`
 * only after the request has been persisted in the database.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, code: "FORBIDDEN" }, 403);

  const ip = getClientIp(req.headers);
  const limit = rateLimit(
    `booking:${ip}`,
    envInt("BOOKING_RATE_LIMIT", 5),
    envInt("BOOKING_RATE_WINDOW_SECONDS", 600) * 1000,
  );
  if (!limit.ok) {
    return json({ ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": String(limit.retryAfterSeconds) });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, code: "INVALID_JSON" }, 400);
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, code: "VALIDATION", fieldErrors: z.flattenError(parsed.error).fieldErrors }, 422);
  }

  // Bot heuristics: honeypot filled or the form was completed implausibly fast.
  const minFillMs = envInt("BOOKING_MIN_FILL_MS", 2500);
  if (parsed.data.website || (parsed.data.elapsedMs ?? 0) < minFillMs) {
    logger.warn("booking_rejected_bot_heuristic", { honeypot: !!parsed.data.website });
    return json({ ok: false, code: "REJECTED" }, 400);
  }

  try {
    const clinic = await getClinic();
    const result = await createBookingRequest(prisma, parsed.data, { clinic });
    if (!result.ok) return json({ ok: false, code: result.code }, statusFor[result.code]);
    logger.info("booking_request_created", { duplicate: result.duplicate });
    return json({ ok: true, reference: result.reference, status: "PENDING" }, result.duplicate ? 200 : 201);
  } catch (error) {
    logger.error("booking_request_failed", undefined, error);
    return json({ ok: false, code: "SERVER_ERROR" }, 503);
  }
}
