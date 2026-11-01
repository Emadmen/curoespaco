import { z } from "zod";
import { t } from "@/content";

const v = t.booking.validation;

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Normalises a phone number to E.164-like form ("+351912345678").
 * Accepts Portuguese numbers without country code. Returns null if invalid.
 */
export function normalizePhone(raw: string): string | null {
  let value = raw.trim().replace(/[\s().-]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (/^[29]\d{8}$/.test(value)) value = `+351${value}`;
  if (/^\d{10,15}$/.test(value)) value = `+${value}`;
  return /^\+[1-9]\d{8,14}$/.test(value) ? value : null;
}

const nameField = z
  .string()
  .trim()
  .min(2, v.name)
  .max(80, v.name)
  .refine((s) => /\p{L}/u.test(s), v.name);

const phoneField = z
  .string()
  .trim()
  .max(30, v.phone)
  .refine((s) => normalizePhone(s) !== null, v.phone);

const emailField = z.union([z.literal(""), z.email(v.email).max(120, v.email)]).optional();

/** Client-side form schema (React Hook Form). */
export const bookingFormSchema = z.object({
  serviceId: z.string().min(1, v.service),
  /** "" = no preference */
  professionalId: z.string(),
  preferredDate: z.string().regex(DATE_RE, v.date),
  preferredTime: z.string().regex(TIME_RE, v.time),
  name: nameField,
  phone: phoneField,
  email: z.string().trim().max(120, v.email).refine((s) => s === "" || z.email().safeParse(s).success, v.email),
  consent: z.boolean().refine((value) => value === true, v.consent),
  /** Honeypot — must stay empty. */
  website: z.string().max(0),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/** Server-side schema for POST /api/bookings. */
export const bookingRequestSchema = z.object({
  serviceId: z.string().min(1, v.service).max(64),
  professionalId: z
    .string()
    .max(64)
    .nullish()
    .transform((value) => value || null),
  preferredDate: z.string().regex(DATE_RE, v.date),
  preferredTime: z.string().regex(TIME_RE, v.time),
  name: nameField,
  phone: phoneField.transform((s) => normalizePhone(s)!),
  email: emailField.transform((s) => (s ? s.toLowerCase() : null)),
  consent: z.literal(true, { error: v.consent }),
  idempotencyKey: z.uuid(),
  website: z.string().max(0).optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

// ─── Admin ────────────────────────────────────────────────────────────────────

const slugField = z
  .string()
  .trim()
  .min(2, "Indique um identificador.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.");

export const loginSchema = z.object({
  email: z.email("Email inválido.").max(120),
  password: z.string().min(1, "Indique a palavra-passe.").max(200),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Indique o nome.").max(80),
  slug: slugField,
  shortDescription: z.string().trim().min(10, "Descrição demasiado curta.").max(220),
  description: z.string().trim().min(10, "Descrição demasiado curta.").max(4000),
  icon: z.string().trim().min(1).max(40),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  sortOrder: z.coerce.number().int().min(0).max(999),
  enabled: z.boolean(),
  professionalIds: z.array(z.string().max(64)).max(100),
});

export const professionalSchema = z.object({
  name: z.string().trim().min(2, "Indique o nome.").max(80),
  slug: slugField,
  title: z.string().trim().min(2, "Indique a especialidade.").max(120),
  bio: z.string().trim().min(10, "Biografia demasiado curta.").max(2000),
  registrationNumber: z
    .string()
    .trim()
    .max(80)
    .transform((s) => s || null),
  expertise: z.array(z.string().trim().min(1).max(60)).max(20),
  sortOrder: z.coerce.number().int().min(0).max(999),
  enabled: z.boolean(),
  serviceIds: z.array(z.string().max(64)).max(100),
});

const timeOrEmpty = z.string().regex(TIME_RE, "Hora inválida (HH:MM).");

export const openingHoursSchema = z
  .array(
    z.union([
      z.object({ day: z.number().int().min(1).max(7), closed: z.literal(true) }),
      z
        .object({ day: z.number().int().min(1).max(7), open: timeOrEmpty, close: timeOrEmpty })
        .refine((h) => h.open < h.close, "A hora de fecho deve ser posterior à abertura."),
    ]),
  )
  .length(7);

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((s) => s === "" || /^https:\/\//.test(s), "Use um endereço https://")
  .transform((s) => s || null);

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120),
  phone: z.string().trim().min(6, "Telefone inválido.").max(30),
  whatsapp: z
    .string()
    .trim()
    .refine((s) => /^\+?\d[\d\s]{7,18}$/.test(s), "Número inválido. Ex.: 351912345678"),
  email: z.email("Email inválido.").max(120),
  addressLine1: z.string().trim().min(3).max(160),
  addressLine2: z
    .string()
    .trim()
    .max(160)
    .transform((s) => s || null),
  postalCode: z.string().trim().min(3).max(20),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().length(2),
  mapsUrl: optionalUrl,
  mapsEmbedUrl: optionalUrl.refine(
    (s) => s === null || s.startsWith("https://www.google.com/maps/embed"),
    "Use o URL de incorporação do Google Maps (https://www.google.com/maps/embed?...).",
  ),
  bookingMode: z.enum(["REQUEST", "LIVE"]),
  heroTitle: z.string().trim().min(5).max(120),
  heroSubtitle: z.string().trim().min(5).max(300),
  aboutIntro: z.string().trim().min(10).max(1200),
  retentionDays: z.coerce.number().int().min(30).max(3650),
  instagram: optionalUrl,
  facebook: optionalUrl,
  linkedin: optionalUrl,
  openingHours: openingHoursSchema,
});

export const workingHoursLineSchema = z
  .string()
  .trim()
  .refine(
    (s) =>
      s === "" ||
      s.split(",").every((part) => /^\s*([01]\d|2[0-3]):[0-5]\d\s*-\s*([01]\d|2[0-3]):[0-5]\d\s*$/.test(part)),
    "Formato: 09:00-13:00, 14:00-19:00",
  );
