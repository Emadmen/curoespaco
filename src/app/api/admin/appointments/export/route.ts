import { type NextRequest } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentWhere, parseAppointmentFilters, statusLabels } from "@/lib/admin-queries";
import { dbDateToDateOnly, formatDateTime, todayInClinic } from "@/lib/dates";
import { logger } from "@/lib/logger";
import { csvCell } from "@/lib/csv";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });

  const filters = parseAppointmentFilters(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await prisma.appointment.findMany({
    where: appointmentWhere(filters),
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });
  logger.info("appointments_exported", { count: rows.length, adminId: admin.id });

  const header = ["Referência", "Estado", "Recebido em", "Nome", "Telefone", "Email", "Serviço", "Profissional", "Data", "Hora", "Modo"];
  // Semicolon separator: what Excel expects with Portuguese regional settings.
  const lines = [header.join(";")];
  for (const a of rows) {
    lines.push(
      [
        a.reference,
        statusLabels[a.status],
        formatDateTime(a.createdAt),
        a.name,
        a.phone,
        a.email,
        a.serviceName,
        a.professionalName ?? "Sem preferência",
        dbDateToDateOnly(a.preferredDate),
        a.preferredTime,
        a.mode === "LIVE" ? "Horário reservado" : "Pedido",
      ]
        .map(csvCell)
        .join(";"),
    );
  }

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${todayInClinic()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
