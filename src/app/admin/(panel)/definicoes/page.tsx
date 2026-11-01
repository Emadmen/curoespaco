import type { Metadata } from "next";
import { defaultClinic } from "@/config/clinic";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settingsToClinic } from "@/lib/mappers";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Definições" };

export default async function SettingsPage() {
  await requireAdmin();
  const row = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
  const clinic = row ? settingsToClinic(row) : defaultClinic;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="type-display-md">Definições da clínica</h1>
      <p className="mt-1 mb-6 text-muted-foreground">As alterações ficam visíveis no site de imediato.</p>
      <SettingsForm clinic={clinic} />
    </div>
  );
}
