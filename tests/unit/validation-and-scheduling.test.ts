import { describe, expect, it } from "vitest";
import { defaultClinic } from "@/config/clinic";
import {
  computeLiveSlots,
  getOpeningForDate,
  getRequestTimeOptions,
  isRequestableDate,
  parseWorkingHours,
  slotStepMinutes,
} from "@/lib/availability";
import { csvCell } from "@/lib/csv";
import { clinicLocalToUtc, todayInClinic, utcToClinicMinutes } from "@/lib/dates";
import { groupOpeningHours } from "@/lib/hours";
import { bookingFormSchema, bookingRequestSchema, normalizePhone } from "@/lib/validations";

const hours = defaultClinic.openingHours; // Mon–Thu 9–20, Fri 9–19, Sat 9–13, Sun closed

const valid = {
  serviceId: "svc-individual",
  professionalId: null,
  preferredDate: "2026-11-03",
  preferredTime: "10:00",
  name: "Maria Teste",
  phone: "912 345 678",
  email: "",
  consent: true,
  idempotencyKey: "3f1c2b8e-4a5d-4c6e-9f7a-1b2c3d4e5f60",
  elapsedMs: 9000,
};

describe("normalizePhone", () => {
  it.each([
    ["912 345 678", "+351912345678"],
    ["+351 912-345-678", "+351912345678"],
    ["00351912345678", "+351912345678"],
    ["+44 7700 900123", "+447700900123"],
  ])("%s → %s", (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each(["12345", "abc", "+351", "0000000000000000000"])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("bookingRequestSchema", () => {
  it("accepts a minimal valid request and normalises it", () => {
    const parsed = bookingRequestSchema.parse(valid);
    expect(parsed.phone).toBe("+351912345678");
    expect(parsed.email).toBeNull();
    expect(parsed.professionalId).toBeNull();
  });

  it("requires consent", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("gives helpful messages for invalid fields", () => {
    const result = bookingRequestSchema.safeParse({ ...valid, name: "A", phone: "123", email: "nope" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message);
    expect(messages).toContain("Indique o seu nome (pelo menos 2 letras).");
    expect(messages).toContain("Indique um número de telemóvel válido.");
    expect(messages).toContain("Indique um email válido ou deixe em branco.");
  });

  it("rejects malformed dates/times and keys", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, preferredDate: "03/11/2026" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, preferredTime: "25:00" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, idempotencyKey: "x" }).success).toBe(false);
  });

  it("does not accept unexpected sensitive free text fields", () => {
    const parsed = bookingRequestSchema.parse({ ...valid, symptoms: "..." } as never);
    expect(parsed).not.toHaveProperty("symptoms");
  });

  it("client form schema mirrors server rules", () => {
    const result = bookingFormSchema.safeParse({
      serviceId: "",
      professionalId: "",
      preferredDate: "",
      preferredTime: "",
      name: "",
      phone: "",
      email: "",
      consent: false,
      website: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(["serviceId", "preferredDate", "preferredTime", "name", "phone", "consent"]),
    );
  });
});

describe("opening hours & request times", () => {
  it("knows closed days", () => {
    expect(getOpeningForDate(hours, "2026-11-08")).toBeNull(); // Sunday
    expect(getOpeningForDate(hours, "2026-11-07")).toEqual({ open: "09:00", close: "13:00" }); // Saturday
  });

  it("only allows dates from today within the horizon on open days", () => {
    const today = "2026-11-02";
    expect(isRequestableDate(hours, "2026-11-01", today, 90)).toBe(false); // past
    expect(isRequestableDate(hours, "2026-11-08", today, 90)).toBe(false); // Sunday
    expect(isRequestableDate(hours, "2026-11-03", today, 90)).toBe(true);
    expect(isRequestableDate(hours, "2027-06-01", today, 90)).toBe(false); // beyond horizon
  });

  it("generates hourly options until one hour before closing", () => {
    const options = getRequestTimeOptions(hours, "2026-11-07", { today: "2026-11-02", minutes: 0 });
    expect(options).toEqual(["09:00", "10:00", "11:00", "12:00"]);
  });

  it("requires notice for same-day times", () => {
    const options = getRequestTimeOptions(hours, "2026-11-07", { today: "2026-11-07", minutes: 9 * 60 + 30 });
    expect(options).toEqual(["11:00", "12:00"]);
  });

  it("groups opening hours for display", () => {
    expect(groupOpeningHours(hours)).toEqual([
      { label: "Segunda a Quinta", value: "09:00 – 20:00" },
      { label: "Sexta", value: "09:00 – 19:00" },
      { label: "Sábado", value: "09:00 – 13:00" },
      { label: "Domingo", value: "Encerrado" },
    ]);
  });
});

describe("live slots", () => {
  const workingHours = parseWorkingHours({ "2": [{ start: "10:00", end: "13:00" }], "9": [{ start: "x" }] });

  it("parses only valid ranges", () => {
    expect(workingHours).toEqual({ "2": [{ start: "10:00", end: "13:00" }] });
  });

  it("rounds slot length to half hours", () => {
    expect(slotStepMinutes(50)).toBe(60);
    expect(slotStepMinutes(90)).toBe(90);
  });

  it("excludes busy intervals and never invents slots", () => {
    const now = { today: "2026-11-01", minutes: 0 };
    expect(computeLiveSlots({ workingHours, date: "2026-11-03", durationMinutes: 50, busy: [], now })).toEqual([
      "10:00",
      "11:00",
      "12:00",
    ]);
    expect(
      computeLiveSlots({ workingHours, date: "2026-11-03", durationMinutes: 50, busy: [{ start: 660, end: 710 }], now }),
    ).toEqual(["10:00", "12:00"]);
    // Monday: no working hours configured → no slots at all.
    expect(computeLiveSlots({ workingHours, date: "2026-11-02", durationMinutes: 50, busy: [], now })).toEqual([]);
  });
});

describe("time zone helpers", () => {
  it("converts clinic local time to UTC and back (Lisbon, winter UTC+0 / summer UTC+1)", () => {
    expect(clinicLocalToUtc("2026-01-15", "10:00").toISOString()).toBe("2026-01-15T10:00:00.000Z");
    expect(clinicLocalToUtc("2026-07-15", "10:00").toISOString()).toBe("2026-07-15T09:00:00.000Z");
    expect(utcToClinicMinutes(new Date("2026-07-15T09:00:00Z"))).toBe(600);
  });

  it("computes today in the clinic time zone", () => {
    expect(todayInClinic(new Date("2026-07-15T23:30:00Z"))).toBe("2026-07-16");
  });
});

describe("csvCell", () => {
  it("neutralises formula injection and escapes separators", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+351912345678")).toBe("'+351912345678");
    expect(csvCell('a;b"c')).toBe('"a;b""c"');
    expect(csvCell(null)).toBe("");
  });
});
