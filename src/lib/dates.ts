import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { siteConfig } from "@/config/clinic";

export const CLINIC_TZ = siteConfig.timeZone;

/** Today's date ("yyyy-MM-dd") in the clinic's time zone. */
export function todayInClinic(now: Date = new Date()): string {
  return format(new TZDate(now.getTime(), CLINIC_TZ), "yyyy-MM-dd");
}

/** Minutes since midnight right now, in the clinic's time zone. */
export function nowMinutesInClinic(now: Date = new Date()): number {
  const local = new TZDate(now.getTime(), CLINIC_TZ);
  return local.getHours() * 60 + local.getMinutes();
}

/**
 * Parses "yyyy-MM-dd" into a local Date at midnight. Only use the result for
 * calendar arithmetic and formatting (weekday, month, …), never as an instant.
 */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Value for a Postgres DATE column (Prisma stores the UTC calendar day). */
export function dateOnlyToDb(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dbDateToDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** Converts a clinic-local date + "HH:mm" into a UTC instant. */
export function clinicLocalToUtc(dateValue: string, time: string): Date {
  const [y, m, d] = dateValue.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(new TZDate(y, m - 1, d, hh, mm, 0, CLINIC_TZ).getTime());
}

/** Minutes since midnight (clinic local) of a UTC instant. */
export function utcToClinicMinutes(instant: Date): number {
  const local = new TZDate(instant.getTime(), CLINIC_TZ);
  return local.getHours() * 60 + local.getMinutes();
}

/** "segunda-feira, 3 de novembro de 2026" */
export function formatDateLong(value: string): string {
  return format(parseDateOnly(value), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });
}

/** "seg., 3/11" style short label */
export function formatDateShort(value: string): string {
  return format(parseDateOnly(value), "EEE, d MMM", { locale: pt });
}

export function formatDateTime(value: Date): string {
  return format(new TZDate(value.getTime(), CLINIC_TZ), "dd/MM/yyyy HH:mm");
}
