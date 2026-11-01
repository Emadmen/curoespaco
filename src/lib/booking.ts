/**
 * Appointment request domain logic (server only).
 *
 * Guarantees:
 *  - A request is only reported as received after it has been persisted.
 *  - Re-submitting the same form (same idempotency key) never creates a duplicate.
 *  - A near-identical request from the same phone shortly after another one is
 *    treated as a duplicate as well (e.g. after a page refresh).
 *  - In LIVE mode slots are re-verified inside a transaction holding a
 *    per-professional advisory lock, preventing double booking.
 */
import { randomInt } from "node:crypto";
import { siteConfig } from "@/config/clinic";
import { Prisma } from "@/generated/prisma/client";
import type { Db } from "@/lib/db";
import {
  computeLiveSlots,
  getRequestTimeOptions,
  isRequestableDate,
  isWithinHorizon,
  parseWorkingHours,
} from "@/lib/availability";
import {
  clinicLocalToUtc,
  dateOnlyToDb,
  nowMinutesInClinic,
  todayInClinic,
  utcToClinicMinutes,
} from "@/lib/dates";
import type { BookingRequestInput } from "@/lib/validations";
import type { ClinicInfo } from "@/types";

export type BookingErrorCode =
  | "INVALID_SERVICE"
  | "INVALID_PROFESSIONAL"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "SLOT_UNAVAILABLE"
  | "TOO_MANY_REQUESTS";

export type CreateBookingResult =
  | { ok: true; reference: string; duplicate: boolean }
  | { ok: false; code: BookingErrorCode };

/** Max pending requests per phone number in 24h (works across server instances). */
export const MAX_PENDING_PER_PHONE_PER_DAY = 3;
/** Window in which an identical request from the same phone is treated as a duplicate. */
export const SOFT_DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateReference() {
  let code = "";
  for (let i = 0; i < 6; i++) code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `CR-${code}`;
}

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;

type Clock = { today: string; minutes: number };

function clockFrom(now: Date): Clock {
  return { today: todayInClinic(now), minutes: nowMinutesInClinic(now) };
}

// ─── LIVE mode availability ───────────────────────────────────────────────────

type LiveCandidate = { id: string; name: string; workingHours: unknown };

async function busyIntervals(db: Db | Prisma.TransactionClient, professionalId: string, date: string) {
  const rows = await db.appointment.findMany({
    where: {
      professionalId,
      preferredDate: dateOnlyToDb(date),
      status: { in: [...ACTIVE_STATUSES] },
      slotStart: { not: null },
    },
    select: { slotStart: true, slotEnd: true },
  });
  return rows.map((r) => ({
    start: utcToClinicMinutes(r.slotStart!),
    end: utcToClinicMinutes(r.slotEnd ?? r.slotStart!),
  }));
}

async function slotsFor(
  db: Db | Prisma.TransactionClient,
  candidate: LiveCandidate,
  date: string,
  durationMinutes: number,
  clock: Clock,
) {
  return computeLiveSlots({
    workingHours: parseWorkingHours(candidate.workingHours),
    date,
    durationMinutes,
    busy: await busyIntervals(db, candidate.id, date),
    now: clock,
  });
}

async function liveCandidates(db: Db, serviceId: string, professionalId: string | null) {
  return db.professional.findMany({
    where: {
      enabled: true,
      services: { some: { serviceId } },
      ...(professionalId ? { id: professionalId } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, name: true, workingHours: true },
  });
}

/** Real available slots (LIVE mode). Returns [] when nothing is configured — never fictional slots. */
export async function getLiveAvailability(
  db: Db,
  params: { serviceId: string; professionalId: string | null; date: string; clinic: ClinicInfo; now?: Date },
): Promise<string[]> {
  const clock = clockFrom(params.now ?? new Date());
  if (!isWithinHorizon(params.date, clock.today, siteConfig.bookingHorizonDays)) return [];
  const service = await db.service.findFirst({
    where: { id: params.serviceId, enabled: true },
    select: { durationMinutes: true },
  });
  if (!service) return [];
  const candidates = await liveCandidates(db, params.serviceId, params.professionalId);
  const all = new Set<string>();
  for (const c of candidates) {
    for (const slot of await slotsFor(db, c, params.date, service.durationMinutes, clock)) all.add(slot);
  }
  return [...all].sort();
}

// ─── Create request ───────────────────────────────────────────────────────────

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createBookingRequest(
  db: Db,
  input: BookingRequestInput,
  options: { clinic: ClinicInfo; now?: Date },
): Promise<CreateBookingResult> {
  const now = options.now ?? new Date();
  const clock = clockFrom(now);
  const { clinic } = options;

  // 1. Idempotency: the same form submitted twice returns the original request.
  const existing = await db.appointment.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { reference: true },
  });
  if (existing) return { ok: true, reference: existing.reference, duplicate: true };

  // 2. Service and (optional) professional must exist, be enabled and match.
  const service = await db.service.findFirst({
    where: { id: input.serviceId, enabled: true },
    select: { id: true, name: true, durationMinutes: true },
  });
  if (!service) return { ok: false, code: "INVALID_SERVICE" };

  let professional: { id: string; name: string } | null = null;
  if (input.professionalId) {
    professional = await db.professional.findFirst({
      where: { id: input.professionalId, enabled: true, services: { some: { serviceId: service.id } } },
      select: { id: true, name: true },
    });
    if (!professional) return { ok: false, code: "INVALID_PROFESSIONAL" };
  }

  // 3. Date / time sanity (clinic time zone).
  if (!isRequestableDate(clinic.openingHours, input.preferredDate, clock.today, siteConfig.bookingHorizonDays)) {
    return { ok: false, code: "INVALID_DATE" };
  }
  if (
    clinic.bookingMode === "REQUEST" &&
    !getRequestTimeOptions(clinic.openingHours, input.preferredDate, clock).includes(input.preferredTime)
  ) {
    return { ok: false, code: "INVALID_TIME" };
  }

  // 4. Abuse protection that also works across multiple server instances.
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentFromPhone = await db.appointment.findMany({
    where: { phone: input.phone, status: "PENDING", createdAt: { gte: since } },
    select: { reference: true, serviceId: true, preferredDate: true, preferredTime: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const softDuplicate = recentFromPhone.find(
    (r) =>
      r.serviceId === service.id &&
      r.preferredTime === input.preferredTime &&
      r.preferredDate.getTime() === dateOnlyToDb(input.preferredDate).getTime() &&
      now.getTime() - r.createdAt.getTime() < SOFT_DUPLICATE_WINDOW_MS,
  );
  if (softDuplicate) return { ok: true, reference: softDuplicate.reference, duplicate: true };
  if (recentFromPhone.length >= MAX_PENDING_PER_PHONE_PER_DAY) return { ok: false, code: "TOO_MANY_REQUESTS" };

  const base = {
    status: "PENDING" as const,
    mode: clinic.bookingMode,
    serviceId: service.id,
    serviceName: service.name,
    preferredDate: dateOnlyToDb(input.preferredDate),
    preferredTime: input.preferredTime,
    name: input.name,
    phone: input.phone,
    email: input.email,
    consentAt: now,
    consentVersion: siteConfig.consentVersion,
    idempotencyKey: input.idempotencyKey,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (clinic.bookingMode === "LIVE") {
        return await createLive(db, { ...base, reference: generateReference() }, service, input, professional, clock);
      }
      const created = await db.appointment.create({
        data: {
          ...base,
          reference: generateReference(),
          professionalId: professional?.id ?? null,
          professionalName: professional?.name ?? null,
        },
        select: { reference: true },
      });
      return { ok: true, reference: created.reference, duplicate: false };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      // Either a concurrent submission with the same key won the race, or the
      // random reference collided. Return the winner, or retry with a new reference.
      const winner = await db.appointment.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: { reference: true },
      });
      if (winner) return { ok: true, reference: winner.reference, duplicate: true };
    }
  }
  throw new Error("Could not allocate a booking reference");
}

async function createLive(
  db: Db,
  data: Omit<Prisma.AppointmentUncheckedCreateInput, "professionalId" | "professionalName">,
  service: { id: string; durationMinutes: number },
  input: BookingRequestInput,
  professional: { id: string } | null,
  clock: Clock,
): Promise<CreateBookingResult> {
  const candidates = await liveCandidates(db, service.id, professional?.id ?? null);
  if (!candidates.length) return { ok: false, code: "SLOT_UNAVAILABLE" };

  return db.$transaction(async (tx) => {
    // Lock candidates in a stable order so concurrent requests serialise per professional.
    for (const c of [...candidates].sort((a, b) => a.id.localeCompare(b.id))) {
      await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${c.id}))`;
    }
    for (const candidate of candidates) {
      const slots = await slotsFor(tx, candidate, input.preferredDate, service.durationMinutes, clock);
      if (!slots.includes(input.preferredTime)) continue;
      const slotStart = clinicLocalToUtc(input.preferredDate, input.preferredTime);
      const created = await tx.appointment.create({
        data: {
          ...data,
          professionalId: candidate.id,
          professionalName: candidate.name,
          slotStart,
          slotEnd: new Date(slotStart.getTime() + service.durationMinutes * 60_000),
        },
        select: { reference: true },
      });
      return { ok: true as const, reference: created.reference, duplicate: false };
    }
    return { ok: false as const, code: "SLOT_UNAVAILABLE" as const };
  });
}
