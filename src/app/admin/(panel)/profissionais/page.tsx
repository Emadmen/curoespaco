import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/confirm-button";
import { toggleProfessional } from "../actions";

export const metadata: Metadata = { title: "Profissionais" };

export default async function AdminProfessionalsPage() {
  await requireAdmin();
  const professionals = await prisma.professional.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { services: true } } },
  });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display-md">Profissionais</h1>
          <p className="mt-1 text-muted-foreground">Perfis apresentados na página Equipa e no fluxo de marcação.</p>
        </div>
        <Link href="/admin/profissionais/novo" className={buttonVariants()}>
          <Plus aria-hidden="true" /> Novo profissional
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {professionals.map((p) => {
          const img = mediaUrl(p.imageId);
          return (
            <li key={p.id} className={cn("flex flex-wrap items-center gap-4 surface p-4", !p.enabled && "opacity-70")}>
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-sage-100 text-foreground">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="size-full object-cover" />
                ) : (
                  p.name.slice(0, 1)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {p.name}{" "}
                  {!p.enabled && <Badge className="ml-1">Oculto</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.title} · {p._count.services} serviço(s)
                </p>
              </div>
              <form action={toggleProfessional}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="enabled" value={String(!p.enabled)} />
                <SubmitButton className={buttonVariants({ variant: "outline", size: "sm" })}>
                  {p.enabled ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  {p.enabled ? "Ocultar" : "Mostrar"}
                </SubmitButton>
              </form>
              <Link href={`/admin/profissionais/${p.id}`} className={buttonVariants({ size: "sm" })}>
                <Pencil aria-hidden="true" /> Editar
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
