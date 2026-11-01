import { format, t } from "@/content";
import { formatDateLong } from "@/lib/dates";

/**
 * Normalises a configured WhatsApp number into the digits-only international
 * format required by wa.me (no "+", no leading "00", no spaces).
 * Returns null when the number is unusable.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  digits = digits.replace(/\D/g, "");
  // Portuguese national number without country code (9 digits starting with 2 or 9).
  if (/^[29]\d{8}$/.test(digits)) digits = `351${digits}`;
  return /^\d{8,15}$/.test(digits) ? digits : null;
}

/** Builds an official wa.me click-to-chat URL with an optional prefilled message. */
export function buildWhatsAppUrl(number: string, message?: string): string {
  const normalized = normalizeWhatsAppNumber(number);
  // Without a valid number wa.me lets the visitor pick a contact; better than a broken link.
  const base = normalized ? `https://wa.me/${normalized}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type BookingMessageDetails = {
  service: string;
  therapist?: string | null;
  /** "yyyy-MM-dd" */
  date?: string | null;
  /** "HH:mm" */
  time?: string | null;
};

/**
 * Prefilled messages. They only ever contain non-sensitive booking preferences
 * (service, professional, date, time) — never symptoms or health details.
 */
export const whatsappMessages = {
  general: () => t.whatsapp.general,
  service: (service: string) => format(t.whatsapp.service, { service }),
  therapist: (therapist: string) => format(t.whatsapp.therapist, { therapist }),
  booking: ({ service, therapist, date, time }: BookingMessageDetails) =>
    format(t.whatsapp.booking, {
      service,
      therapist: therapist || t.whatsapp.noPreference,
      date: date ? formatDateLong(date) : t.whatsapp.noPreference,
      time: time || t.whatsapp.noPreference,
    }),
};

/** Human-readable phone number: "351910000000" → "+351 910 000 000". */
export function formatPhoneDisplay(raw: string): string {
  const digits = normalizeWhatsAppNumber(raw);
  if (!digits) return raw;
  if (digits.startsWith("351") && digits.length === 12) {
    const n = digits.slice(3);
    return `+351 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return `+${digits}`;
}
