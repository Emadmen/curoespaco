import type { Prisma } from "@/generated/prisma/client";
import { dateOnlyToDb } from "@/lib/dates";
import { DATE_RE } from "@/lib/validations";

export const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED"] as const;
export type StatusFilter = (typeof APPOINTMENT_STATUSES)[number] | "ALL";

export type AppointmentFilters = { status: StatusFilter; q: string; date: string };

export function parseAppointmentFilters(params: Record<string, string | string[] | undefined>): AppointmentFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const status = one(params.status).toUpperCase();
  return {
    status: (APPOINTMENT_STATUSES as readonly string[]).includes(status) ? (status as StatusFilter) : "ALL",
    q: one(params.q).trim().slice(0, 80),
    date: DATE_RE.test(one(params.date)) ? one(params.date) : "",
  };
}

export function appointmentWhere({ status, q, date }: AppointmentFilters): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {};
  if (status !== "ALL") where.status = status;
  if (date) where.preferredDate = dateOnlyToDb(date);
  if (q) {
    const digits = q.replace(/\D/g, "");
    where.OR = [
      // MySQL's default collation already compares case-insensitively.
      { name: { contains: q } },
      { email: { contains: q } },
      { reference: { contains: q.toUpperCase() } },
      ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
    ];
  }
  return where;
}

export const statusLabels: Record<(typeof APPOINTMENT_STATUSES)[number], string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  REJECTED: "Recusado",
};
