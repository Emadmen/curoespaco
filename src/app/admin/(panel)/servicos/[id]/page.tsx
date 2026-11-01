import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ServiceForm } from "@/components/admin/service-form";
import { SubmitButton } from "@/components/admin/confirm-button";
import { deleteService } from "../../actions";

export const metadata: Metadata = { title: "Editar serviço" };

export default async function EditServicePage(props: PageProps<"/admin/servicos/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const isNew = id === "novo";
  const [service, professionals] = await Promise.all([
    isNew ? null : prisma.service.findUnique({ where: { id }, include: { professionals: { select: { professionalId: true } } } }),
    prisma.professional.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!isNew && !service) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/servicos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Serviços
      </Link>
      <h1 className="mt-3 mb-6 type-display-md">{isNew ? "Novo serviço" : service!.name}</h1>
      <ServiceForm
        professionals={professionals}
        service={
          service
            ? {
                id: service.id,
                name: service.name,
                slug: service.slug,
                shortDescription: service.shortDescription,
                description: service.description,
                icon: service.icon,
                durationMinutes: service.durationMinutes,
                sortOrder: service.sortOrder,
                enabled: service.enabled,
                professionalIds: service.professionals.map((p) => p.professionalId),
              }
            : undefined
        }
      />
      {service && (
        <form action={deleteService} className="mt-6 flex justify-end">
          <input type="hidden" name="id" value={service.id} />
          <SubmitButton
            confirmMessage={`Remover o serviço "${service.name}"? Os pedidos existentes mantêm o nome do serviço.`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:underline"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Remover serviço
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
