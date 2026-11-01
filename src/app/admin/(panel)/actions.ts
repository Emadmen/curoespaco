"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { AppointmentStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_TAG } from "@/lib/data";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  professionalSchema,
  serviceSchema,
  settingsSchema,
  workingHoursLineSchema,
} from "@/lib/validations";
import type { WorkingHours } from "@/types";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED"] as const;

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function isUnique(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// ─── Appointments ────────────────────────────────────────────────────────────

export async function updateAppointmentStatus(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  const status = z.enum(STATUSES).parse(str(formData, "status")) as AppointmentStatus;
  await prisma.appointment.update({ where: { id }, data: { status, statusUpdatedAt: new Date() } });
  logger.info("appointment_status_updated", { appointmentId: id, status, adminId: admin.id });
  revalidatePath("/admin");
}

export async function deleteAppointment(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  await prisma.appointment.delete({ where: { id } });
  logger.info("appointment_deleted", { appointmentId: id, adminId: admin.id });
  revalidatePath("/admin");
}

/** Data minimisation: removes requests older than the configured retention period. */
export async function purgeExpiredAppointments(_prev: FormState): Promise<FormState> {
  const admin = await requireAdmin();
  const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 }, select: { retentionDays: true } });
  const cutoff = new Date(Date.now() - (settings?.retentionDays ?? 365) * 24 * 60 * 60 * 1000);
  const { count } = await prisma.appointment.deleteMany({ where: { createdAt: { lt: cutoff } } });
  logger.info("appointments_purged", { count, adminId: admin.id });
  revalidatePath("/admin");
  return { ok: true, message: `${count} pedido(s) antigo(s) eliminado(s).` };
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function saveService(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id");
  const parsed = serviceSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    shortDescription: str(formData, "shortDescription"),
    description: str(formData, "description"),
    icon: str(formData, "icon"),
    durationMinutes: str(formData, "durationMinutes"),
    sortOrder: str(formData, "sortOrder") || "0",
    enabled: formData.get("enabled") === "on",
    professionalIds: formData.getAll("professionalIds").map(String),
  });
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, message: "Verifique os campos." };

  const { professionalIds, ...data } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const service = id
        ? await tx.service.update({ where: { id }, data })
        : await tx.service.create({ data });
      await tx.professionalService.deleteMany({ where: { serviceId: service.id } });
      if (professionalIds.length) {
        await tx.professionalService.createMany({
          data: professionalIds.map((professionalId) => ({ professionalId, serviceId: service.id })),
          skipDuplicates: true,
        });
      }
    });
  } catch (error) {
    if (isUnique(error)) return { ok: false, errors: { slug: ["Já existe um serviço com este identificador."] } };
    throw error;
  }
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos");
}

export async function toggleService(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  const enabled = str(formData, "enabled") === "true";
  await prisma.service.update({ where: { id }, data: { enabled } });
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/servicos");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  await prisma.service.delete({ where: { id } });
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos");
}

// ─── Professionals ───────────────────────────────────────────────────────────

const IMAGE_TYPES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45,
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function parseWorkingHoursForm(formData: FormData): { value: WorkingHours; error?: string } {
  const value: WorkingHours = {};
  for (let day = 1; day <= 7; day++) {
    const line = str(formData, `wh-${day}`).trim();
    const check = workingHoursLineSchema.safeParse(line);
    if (!check.success) return { value, error: check.error.issues[0]?.message };
    if (!line) continue;
    value[String(day)] = line.split(",").map((part) => {
      const [start, end] = part.split("-").map((s) => s.trim());
      return { start, end };
    });
    if (value[String(day)]!.some((r) => r.start >= r.end)) {
      return { value, error: "A hora de fim deve ser posterior à de início." };
    }
  }
  return { value };
}

export async function saveProfessional(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id");
  const parsed = professionalSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
    registrationNumber: str(formData, "registrationNumber"),
    expertise: str(formData, "expertise")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    sortOrder: str(formData, "sortOrder") || "0",
    enabled: formData.get("enabled") === "on",
    serviceIds: formData.getAll("serviceIds").map(String),
  });
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, message: "Verifique os campos." };

  const workingHours = parseWorkingHoursForm(formData);
  if (workingHours.error) return { ok: false, errors: { workingHours: [workingHours.error] } };

  // Optional portrait upload (validated by size, declared type and magic bytes).
  let imageData: { mimeType: string; size: number; data: Uint8Array<ArrayBuffer> } | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, errors: { image: ["A imagem deve ter no máximo 2 MB."] } };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const check = IMAGE_TYPES[file.type];
    if (!check || !check(bytes)) return { ok: false, errors: { image: ["Use uma imagem JPG, PNG ou WebP."] } };
    imageData = { mimeType: file.type, size: file.size, data: bytes };
  }
  const removeImage = formData.get("removeImage") === "on";

  const { serviceIds, ...data } = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      let imageId: string | null | undefined;
      if (imageData) imageId = (await tx.mediaAsset.create({ data: imageData, select: { id: true } })).id;
      else if (removeImage) imageId = null;

      const payload = {
        ...data,
        workingHours: Object.keys(workingHours.value).length ? workingHours.value : Prisma.DbNull,
        ...(imageId !== undefined ? { imageId } : {}),
      };
      const previous = id ? await tx.professional.findUnique({ where: { id }, select: { imageId: true } }) : null;
      const professional = id
        ? await tx.professional.update({ where: { id }, data: payload })
        : await tx.professional.create({ data: payload });

      if (previous?.imageId && imageId !== undefined && previous.imageId !== imageId) {
        await tx.mediaAsset.deleteMany({ where: { id: previous.imageId, professionals: { none: {} } } });
      }
      await tx.professionalService.deleteMany({ where: { professionalId: professional.id } });
      if (serviceIds.length) {
        await tx.professionalService.createMany({
          data: serviceIds.map((serviceId) => ({ serviceId, professionalId: professional.id })),
          skipDuplicates: true,
        });
      }
    });
  } catch (error) {
    if (isUnique(error)) return { ok: false, errors: { slug: ["Já existe um profissional com este identificador."] } };
    throw error;
  }
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/profissionais");
  redirect("/admin/profissionais");
}

export async function toggleProfessional(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  const enabled = str(formData, "enabled") === "true";
  await prisma.professional.update({ where: { id }, data: { enabled } });
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/profissionais");
}

export async function deleteProfessional(formData: FormData) {
  await requireAdmin();
  const id = z.string().min(1).max(64).parse(str(formData, "id"));
  const removed = await prisma.professional.delete({ where: { id }, select: { imageId: true } });
  if (removed.imageId) await prisma.mediaAsset.deleteMany({ where: { id: removed.imageId, professionals: { none: {} } } });
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/profissionais");
  redirect("/admin/profissionais");
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const openingHours = [1, 2, 3, 4, 5, 6, 7].map((day) =>
    formData.get(`closed-${day}`) === "on"
      ? { day, closed: true as const }
      : { day, open: str(formData, `open-${day}`), close: str(formData, `close-${day}`) },
  );
  const parsed = settingsSchema.safeParse({
    name: str(formData, "name"),
    tagline: str(formData, "tagline"),
    phone: str(formData, "phone"),
    whatsapp: str(formData, "whatsapp"),
    email: str(formData, "email"),
    addressLine1: str(formData, "addressLine1"),
    addressLine2: str(formData, "addressLine2"),
    postalCode: str(formData, "postalCode"),
    city: str(formData, "city"),
    country: str(formData, "country") || "PT",
    mapsUrl: str(formData, "mapsUrl"),
    mapsEmbedUrl: str(formData, "mapsEmbedUrl"),
    bookingMode: str(formData, "bookingMode"),
    heroTitle: str(formData, "heroTitle"),
    heroSubtitle: str(formData, "heroSubtitle"),
    aboutIntro: str(formData, "aboutIntro"),
    retentionDays: str(formData, "retentionDays"),
    instagram: str(formData, "instagram"),
    facebook: str(formData, "facebook"),
    linkedin: str(formData, "linkedin"),
    openingHours,
  });
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return { ok: false, errors: flat, message: "Verifique os campos assinalados." };
  }
  const { instagram, facebook, linkedin, whatsapp, ...rest } = parsed.data;
  const data = {
    ...rest,
    whatsapp: whatsapp.replace(/[^\d]/g, ""),
    socials: { instagram, facebook, linkedin },
  };
  await prisma.clinicSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  updateTag(PUBLIC_TAG);
  revalidatePath("/admin/definicoes");
  return { ok: true, message: "Definições guardadas." };
}
