/**
 * Integration tests for the booking domain against a real PostgreSQL database.
 * Uses TEST_DATABASE_URL (a disposable database — all data is wiped).
 *
 *   docker compose up -d && npm test
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { addDays, getISODay } from "date-fns";
import { defaultClinic } from "@/config/clinic";
import { createBookingRequest, getLiveAvailability, MAX_PENDING_PER_PHONE_PER_DAY } from "@/lib/booking";
import { createPrismaClient, type Db } from "@/lib/db";
import { parseDateOnly, toDateOnly, todayInClinic } from "@/lib/dates";
import { bookingRequestSchema } from "@/lib/validations";
import type { ClinicInfo } from "@/types";

const url = process.env.TEST_DATABASE_URL;
const run = url ? describe : describe.skip;

let db: Db;
let counter = 0;

/** Next date (from tomorrow) with the given ISO weekday. */
function nextWeekday(isoDay: number) {
  let d = addDays(parseDateOnly(todayInClinic()), 1);
  while (getISODay(d) !== isoDay) d = addDays(d, 1);
  return toDateOnly(d);
}

function request(overrides: Record<string, unknown> = {}) {
  counter++;
  return bookingRequestSchema.parse({
    serviceId: "svc-a",
    professionalId: null,
    preferredDate: nextWeekday(2),
    preferredTime: "10:00",
    name: "Pessoa Teste",
    phone: `91${String(1000000 + counter).slice(-7)}`,
    email: "",
    consent: true,
    idempotencyKey: crypto.randomUUID(),
    elapsedMs: 10_000,
    ...overrides,
  });
}

const requestMode: ClinicInfo = { ...defaultClinic, bookingMode: "REQUEST" };
const liveMode: ClinicInfo = { ...defaultClinic, bookingMode: "LIVE" };

run("booking requests (database)", () => {
  beforeAll(() => {
    execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url }, stdio: "ignore" });
    db = createPrismaClient(url);
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  beforeEach(async () => {
    await db.appointment.deleteMany();
    await db.professionalService.deleteMany();
    await db.professional.deleteMany();
    await db.service.deleteMany();
    await db.service.create({
      data: { id: "svc-a", slug: "svc-a", name: "Serviço A", shortDescription: "x", description: "x", durationMinutes: 50 },
    });
    await db.service.create({
      data: { id: "svc-off", slug: "svc-off", name: "Desligado", shortDescription: "x", description: "x", enabled: false },
    });
    await db.professional.create({
      data: {
        id: "pro-a",
        slug: "pro-a",
        name: "Profissional A",
        title: "Psicóloga",
        bio: "bio",
        workingHours: { "2": [{ start: "10:00", end: "12:00" }] },
        services: { create: [{ serviceId: "svc-a" }] },
      },
    });
    await db.professional.create({
      data: { id: "pro-b", slug: "pro-b", name: "Profissional B", title: "Psicólogo", bio: "bio" },
    });
  });

  it("persists a PENDING request with only minimal data", async () => {
    const input = request({ professionalId: "pro-a", email: "Pessoa@Exemplo.pt" });
    const result = await createBookingRequest(db, input, { clinic: requestMode });
    expect(result).toMatchObject({ ok: true, duplicate: false });

    const saved = await db.appointment.findMany();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      status: "PENDING",
      mode: "REQUEST",
      serviceName: "Serviço A",
      professionalName: "Profissional A",
      email: "pessoa@exemplo.pt",
      preferredTime: "10:00",
    });
    expect(saved[0].reference).toMatch(/^CR-[A-Z2-9]{6}$/);
    expect(saved[0].consentAt).toBeInstanceOf(Date);
  });

  it("is idempotent: the same submission twice creates one request", async () => {
    const input = request();
    const first = await createBookingRequest(db, input, { clinic: requestMode });
    const second = await createBookingRequest(db, input, { clinic: requestMode });
    expect(first.ok && second.ok).toBe(true);
    expect(second).toMatchObject({ duplicate: true });
    if (first.ok && second.ok) expect(second.reference).toBe(first.reference);
    expect(await db.appointment.count()).toBe(1);
  });

  it("handles concurrent duplicate submissions (double click) without duplicates", async () => {
    const input = request();
    const results = await Promise.all(
      Array.from({ length: 5 }, () => createBookingRequest(db, input, { clinic: requestMode })),
    );
    expect(results.every((r) => r.ok)).toBe(true);
    expect(new Set(results.map((r) => (r.ok ? r.reference : ""))).size).toBe(1);
    expect(await db.appointment.count()).toBe(1);
  });

  it("treats a resubmission with a new key but identical details as a duplicate", async () => {
    const input = request();
    await createBookingRequest(db, input, { clinic: requestMode });
    const again = await createBookingRequest(db, { ...input, idempotencyKey: crypto.randomUUID() }, { clinic: requestMode });
    expect(again).toMatchObject({ ok: true, duplicate: true });
    expect(await db.appointment.count()).toBe(1);
  });

  it("limits pending requests per phone number", async () => {
    const phone = "+351919999999";
    for (let i = 0; i < MAX_PENDING_PER_PHONE_PER_DAY; i++) {
      const r = await createBookingRequest(db, request({ phone, preferredTime: `1${i}:00` }), { clinic: requestMode });
      expect(r.ok).toBe(true);
    }
    const blocked = await createBookingRequest(db, request({ phone, preferredTime: "15:00" }), { clinic: requestMode });
    expect(blocked).toEqual({ ok: false, code: "TOO_MANY_REQUESTS" });
  });

  it("rejects disabled services, mismatched professionals, closed days and invalid times", async () => {
    expect(await createBookingRequest(db, request({ serviceId: "svc-off" }), { clinic: requestMode })).toEqual({
      ok: false,
      code: "INVALID_SERVICE",
    });
    expect(await createBookingRequest(db, request({ professionalId: "pro-b" }), { clinic: requestMode })).toEqual({
      ok: false,
      code: "INVALID_PROFESSIONAL",
    });
    expect(await createBookingRequest(db, request({ preferredDate: nextWeekday(7) }), { clinic: requestMode })).toEqual({
      ok: false,
      code: "INVALID_DATE",
    });
    expect(await createBookingRequest(db, request({ preferredTime: "22:00" }), { clinic: requestMode })).toEqual({
      ok: false,
      code: "INVALID_TIME",
    });
    expect(await db.appointment.count()).toBe(0);
  });

  describe("LIVE mode", () => {
    it("only offers real slots from working hours", async () => {
      const slots = await getLiveAvailability(db, { serviceId: "svc-a", professionalId: null, date: nextWeekday(2), clinic: liveMode });
      expect(slots).toEqual(["10:00", "11:00"]);
      // No working hours on Mondays → nothing offered.
      expect(
        await getLiveAvailability(db, { serviceId: "svc-a", professionalId: null, date: nextWeekday(1), clinic: liveMode }),
      ).toEqual([]);
    });

    it("prevents double booking under concurrency", async () => {
      const date = nextWeekday(2);
      const results = await Promise.all(
        Array.from({ length: 4 }, () =>
          createBookingRequest(db, request({ preferredDate: date, preferredTime: "10:00" }), { clinic: liveMode }),
        ),
      );
      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.filter((r) => !r.ok && r.code === "SLOT_UNAVAILABLE")).toHaveLength(3);
      const saved = await db.appointment.findMany();
      expect(saved).toHaveLength(1);
      expect(saved[0].professionalId).toBe("pro-a");
      expect(saved[0].slotStart).not.toBeNull();

      const remaining = await getLiveAvailability(db, { serviceId: "svc-a", professionalId: "pro-a", date, clinic: liveMode });
      expect(remaining).toEqual(["11:00"]);
    });

    it("frees the slot again when a request is cancelled", async () => {
      const date = nextWeekday(2);
      const r = await createBookingRequest(db, request({ preferredDate: date, preferredTime: "11:00" }), { clinic: liveMode });
      expect(r.ok).toBe(true);
      await db.appointment.updateMany({ data: { status: "CANCELLED" } });
      const slots = await getLiveAvailability(db, { serviceId: "svc-a", professionalId: null, date, clinic: liveMode });
      expect(slots).toContain("11:00");
    });
  });
});
