import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ServiceIcon } from "@/components/services/service-icon";
import { SubmitButton } from "@/components/admin/confirm-button";
import { toggleService } from "../actions";

export const metadata: Metadata = { title: "Serviços" };

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { professionals: true } } },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display-md">Serviços</h1>
          <p className="mt-1 text-muted-foreground">Ative apenas os serviços que a clínica realmente presta.</p>
        </div>
        <Link href="/admin/servicos/novo" className={buttonVariants()}>
          <Plus aria-hidden="true" /> Novo serviço
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {services.map((s) => (
          <li key={s.id} className={cn("flex flex-wrap items-center gap-4 surface p-4", !s.enabled && "opacity-70")}>
            <span className="grid size-11 place-items-center rounded-full bg-sage-100 text-foreground">
              <ServiceIcon name={s.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {s.name}{" "}
                {!s.enabled && <Badge className="ml-1">Desativado</Badge>}
              </p>
              <p className="text-sm text-muted-foreground">
                /servicos/{s.slug} · {s.durationMinutes} min · {s._count.professionals} profissional(ais)
              </p>
            </div>
            <form action={toggleService}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="enabled" value={String(!s.enabled)} />
              <SubmitButton className={buttonVariants({ variant: "outline", size: "sm" })}>
                {s.enabled ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {s.enabled ? "Desativar" : "Ativar"}
              </SubmitButton>
            </form>
            <Link href={`/admin/servicos/${s.id}`} className={buttonVariants({ size: "sm" })}>
              <Pencil aria-hidden="true" /> Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
