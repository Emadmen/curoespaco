import type { ClinicSettings, Prisma } from "@/generated/prisma/client";
import { defaultClinic } from "@/config/clinic";
import { openingHoursSchema } from "@/lib/validations";
import type { ClinicInfo, OpeningHoursEntry, PublicProfessional, PublicService, Socials } from "@/types";

export function parseOpeningHours(value: unknown): OpeningHoursEntry[] {
  const parsed = openingHoursSchema.safeParse(value);
  return parsed.success ? (parsed.data as OpeningHoursEntry[]) : defaultClinic.openingHours;
}

function parseSocials(value: unknown): Socials {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const pick = (k: string) => (typeof v[k] === "string" && v[k] ? (v[k] as string) : undefined);
  return { instagram: pick("instagram"), facebook: pick("facebook"), linkedin: pick("linkedin") };
}

export function settingsToClinic(row: ClinicSettings): ClinicInfo {
  return {
    name: row.name,
    tagline: row.tagline,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    postalCode: row.postalCode,
    city: row.city,
    country: row.country,
    mapsUrl: row.mapsUrl,
    mapsEmbedUrl: row.mapsEmbedUrl,
    openingHours: parseOpeningHours(row.openingHours),
    socials: parseSocials(row.socials),
    bookingMode: row.bookingMode,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    aboutIntro: row.aboutIntro,
    retentionDays: row.retentionDays,
  };
}

export const serviceInclude = {
  professionals: { where: { professional: { enabled: true } }, select: { professionalId: true } },
} satisfies Prisma.ServiceInclude;

export type ServiceRow = Prisma.ServiceGetPayload<{ include: typeof serviceInclude }>;

export function toPublicService(row: ServiceRow): PublicService {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    icon: row.icon,
    durationMinutes: row.durationMinutes,
    professionalIds: row.professionals.map((p) => p.professionalId),
  };
}

export const professionalInclude = {
  services: { where: { service: { enabled: true } }, select: { serviceId: true } },
} satisfies Prisma.ProfessionalInclude;

export type ProfessionalRow = Prisma.ProfessionalGetPayload<{ include: typeof professionalInclude }>;

export function mediaUrl(id: string | null | undefined) {
  return id ? `/api/media/${id}` : null;
}

export function toPublicProfessional(row: ProfessionalRow): PublicProfessional {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    registrationNumber: row.registrationNumber,
    expertise: row.expertise,
    imageUrl: mediaUrl(row.imageId),
    serviceIds: row.services.map((s) => s.serviceId),
  };
}
