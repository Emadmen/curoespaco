import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseWorkingHours } from "@/lib/availability";
import { mediaUrl } from "@/lib/mappers";
import { ProfessionalForm } from "@/components/admin/professional-form";
import { SubmitButton } from "@/components/admin/confirm-button";
import { deleteProfessional } from "../../actions";

export const metadata: Metadata = { title: "Editar profissional" };

export default async function EditProfessionalPage(props: PageProps<"/admin/profissionais/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const isNew = id === "novo";
  const [professional, services] = await Promise.all([
    isNew ? null : prisma.professional.findUnique({ where: { id }, include: { services: { select: { serviceId: true } } } }),
    prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!isNew && !professional) notFound();

  const workingHours = professional
    ? Object.fromEntries(
        Object.entries(parseWorkingHours(professional.workingHours)).map(([day, ranges]) => [
          day,
          (ranges ?? []).map((r) => `${r.start}-${r.end}`).join(", "),
        ]),
      )
    : {};

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/profissionais" className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Profissionais
      </Link>
      <h1 className="mt-3 mb-6 type-display-md">{isNew ? "Novo profissional" : professional!.name}</h1>
      <ProfessionalForm
        services={services}
        professional={
          professional
            ? {
                id: professional.id,
                name: professional.name,
                slug: professional.slug,
                title: professional.title,
                bio: professional.bio,
                registrationNumber: professional.registrationNumber ?? "",
                expertise: professional.expertise,
                sortOrder: professional.sortOrder,
                enabled: professional.enabled,
                serviceIds: professional.services.map((s) => s.serviceId),
                imageUrl: mediaUrl(professional.imageId),
                workingHours,
              }
            : undefined
        }
      />
      {professional && (
        <form action={deleteProfessional} className="mt-6 flex justify-end">
          <input type="hidden" name="id" value={professional.id} />
          <SubmitButton
            confirmMessage={`Remover o perfil de ${professional.name}? Os pedidos existentes mantêm o nome.`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:underline"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Remover profissional
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
