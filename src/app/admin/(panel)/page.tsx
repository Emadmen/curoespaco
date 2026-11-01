import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail, Phone, RotateCcw, Search, Trash2, X, Ban } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  APPOINTMENT_STATUSES,
  appointmentWhere,
  parseAppointmentFilters,
  statusLabels,
} from "@/lib/admin-queries";
import { dbDateToDateOnly, formatDateLong, formatDateTime } from "@/lib/dates";
import { buildWhatsAppUrl, formatPhoneDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { SubmitButton } from "@/components/admin/confirm-button";
import { PurgeButton } from "@/components/admin/purge-button";
import { deleteAppointment, updateAppointmentStatus } from "./actions";

export const metadata: Metadata = { title: "Pedidos de marcação" };

const PAGE_SIZE = 25;

const statusTone = {
  PENDING: "warning",
  CONFIRMED: "sage",
  CANCELLED: "neutral",
  REJECTED: "danger",
} as const;

export default async function AppointmentsPage(props: PageProps<"/admin">) {
  await requireAdmin();
  const params = await props.searchParams;
  const filters = parseAppointmentFilters(params);
  const page = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);
  const where = appointmentWhere(filters);

  const [appointments, total, counts, settings] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.appointment.count({ where }),
    prisma.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.clinicSettings.findUnique({ where: { id: 1 }, select: { retentionDays: true } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (overrides: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: filters.status, q: filters.q, date: filters.date, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "status" && v === "ALL")) sp.set(k, v);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="type-display-md">Pedidos de marcação</h1>
          <p className="mt-1 text-muted-foreground">Pedidos feitos pelo site. Confirme cada pedido com o paciente antes de o marcar como confirmado.</p>
        </div>
        <a href={`/api/admin/appointments/export${qs({})}`} className={buttonVariants({ variant: "outline" })}>
          <Download aria-hidden="true" />
          Exportar CSV
        </a>
      </div>

      {/* Status tabs */}
      <nav aria-label="Filtrar por estado" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {(["ALL", ...APPOINTMENT_STATUSES] as const).map((s) => {
          const active = filters.status === s;
          const count = s === "ALL" ? counts.reduce((n, c) => n + c._count._all, 0) : countOf(s);
          return (
            <Link
              key={s}
              href={`/admin${qs({ status: s, page: "" })}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors",
                active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-input hover:bg-sage-100",
              )}
            >
              {s === "ALL" ? "Todos" : statusLabels[s]}
              <span className={cn("rounded-full px-2 text-xs", active ? "bg-card/20" : s === "PENDING" && count ? "bg-warning-100 text-warning-800" : "bg-sage-100")}>
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Search */}
      <form className="mt-4 flex flex-col gap-2 surface p-3 sm:flex-row" role="search">
        {filters.status !== "ALL" && <input type="hidden" name="status" value={filters.status} />}
        <label className="sr-only" htmlFor="q">Pesquisar por nome, telefone, email ou referência</label>
        <Input id="q" name="q" defaultValue={filters.q} placeholder="Nome, telefone, email ou referência" className="h-10 flex-1" />
        <label className="sr-only" htmlFor="date">Data preferida</label>
        <Input id="date" name="date" type="date" defaultValue={filters.date} className="h-10 sm:w-44" />
        <button type="submit" className={buttonVariants()}>
          <Search aria-hidden="true" />
          Pesquisar
        </button>
        {(filters.q || filters.date) && (
          <Link href={`/admin${qs({ q: "", date: "" })}`} className={buttonVariants({ variant: "ghost" })}>
            Limpar
          </Link>
        )}
      </form>

      {/* List */}
      {appointments.length === 0 ? (
        <p className="mt-8 rounded-xl bg-card p-10 text-center text-muted-foreground border border-border">
          Não há pedidos para mostrar.
        </p>
      ) : (
        <ul className="mt-6 space-y-3" data-testid="appointments-list">
          {appointments.map((a) => {
            const date = dbDateToDateOnly(a.preferredDate);
            const contactMessage = `Olá ${a.name.split(" ")[0]}! Recebemos o seu pedido de marcação (${a.reference}) para ${formatDateLong(date)} às ${a.preferredTime}. Podemos confirmar consigo?`;
            return (
              <li key={a.id} className="surface p-4 sm:p-5" data-testid="appointment-row" data-reference={a.reference}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone[a.status]} data-testid="appointment-status">
                        {statusLabels[a.status]}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{a.reference}</span>
                      <span className="text-xs text-muted-foreground">· recebido {formatDateTime(a.createdAt)}</span>
                      {a.mode === "LIVE" && <Badge tone="sage">Horário reservado</Badge>}
                    </div>
                    <p className="text-lg font-semibold text-foreground">{a.name}</p>
                    <p className="text-[0.9375rem] text-foreground">
                      <strong className="font-semibold">{a.serviceName}</strong>
                      {" · "}
                      {a.professionalName ?? "Sem preferência de profissional"}
                    </p>
                    <p className="text-[0.9375rem] text-muted-foreground first-letter:uppercase">
                      {formatDateLong(date)} · {a.preferredTime}
                      {a.mode === "REQUEST" && " (preferência)"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
                      <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {formatPhoneDisplay(a.phone)}
                      </a>
                      <a
                        href={buildWhatsAppUrl(a.phone, contactMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
                      >
                        <WhatsAppIcon className="size-3.5" />
                        WhatsApp
                      </a>
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline">
                          <Mail className="size-3.5" aria-hidden="true" />
                          {a.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <form action={updateAppointmentStatus} className="flex flex-wrap gap-2 lg:justify-end">
                    <input type="hidden" name="id" value={a.id} />
                    {a.status !== "CONFIRMED" && (
                      <SubmitButton name="status" value="CONFIRMED" className={buttonVariants({ size: "sm" })}>
                        <Check aria-hidden="true" /> Confirmar
                      </SubmitButton>
                    )}
                    {a.status === "PENDING" && (
                      <SubmitButton name="status" value="REJECTED" className={buttonVariants({ size: "sm", variant: "outline" })}>
                        <X aria-hidden="true" /> Recusar
                      </SubmitButton>
                    )}
                    {a.status === "CONFIRMED" && (
                      <SubmitButton name="status" value="CANCELLED" className={buttonVariants({ size: "sm", variant: "outline" })}>
                        <Ban aria-hidden="true" /> Cancelar
                      </SubmitButton>
                    )}
                    {a.status !== "PENDING" && (
                      <SubmitButton name="status" value="PENDING" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                        <RotateCcw aria-hidden="true" /> Pendente
                      </SubmitButton>
                    )}
                  </form>
                </div>
                <form action={deleteAppointment} className="mt-3 flex justify-end border-t border-border pt-3">
                  <input type="hidden" name="id" value={a.id} />
                  <SubmitButton
                    confirmMessage={`Eliminar definitivamente o pedido ${a.reference}? Esta ação não pode ser anulada.`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                    aria-label={`Eliminar pedido ${a.reference}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" /> Eliminar dados
                  </SubmitButton>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={`/admin${qs({ page: String(page - 1) })}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Anterior</Link>}
          <span className="px-3 text-muted-foreground">Página {page} de {pages}</span>
          {page < pages && <Link href={`/admin${qs({ page: String(page + 1) })}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Seguinte</Link>}
        </nav>
      )}

      <section className="mt-12 surface p-5">
        <h2 className="text-base font-semibold text-foreground">Conservação de dados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos com mais de {settings?.retentionDays ?? 365} dias podem ser eliminados (minimização de dados). O prazo é configurável em Definições.
        </p>
        <PurgeButton />
      </section>
    </div>
  );
}
