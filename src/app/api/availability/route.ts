import { NextResponse, type NextRequest } from "next/server";
import { getLiveAvailability } from "@/lib/booking";
import { getClinic } from "@/lib/data";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { DATE_RE } from "@/lib/validations";

/** Real available slots for LIVE booking mode. Never returns fictional slots. */
export async function GET(req: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  const limit = rateLimit(`availability:${getClientIp(req.headers)}`, 60, 60_000);
  if (!limit.ok) return NextResponse.json({ slots: [] }, { status: 429, headers });

  const params = req.nextUrl.searchParams;
  const serviceId = params.get("serviceId") ?? "";
  const professionalId = params.get("professionalId") || null;
  const date = params.get("date") ?? "";
  if (!serviceId || serviceId.length > 64 || (professionalId?.length ?? 0) > 64 || !DATE_RE.test(date)) {
    return NextResponse.json({ slots: [] }, { status: 400, headers });
  }

  try {
    const clinic = await getClinic();
    if (clinic.bookingMode !== "LIVE") return NextResponse.json({ slots: [], mode: clinic.bookingMode }, { headers });
    const slots = await getLiveAvailability(prisma, { serviceId, professionalId, date, clinic });
    return NextResponse.json({ slots, mode: "LIVE" }, { headers });
  } catch (error) {
    logger.error("availability_failed", undefined, error);
    return NextResponse.json({ slots: [], error: true }, { status: 503, headers });
  }
}
