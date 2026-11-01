import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { defaultClinic, defaultProfessionals, defaultServices } from "@/config/clinic";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  professionalInclude,
  serviceInclude,
  settingsToClinic,
  toPublicProfessional,
  toPublicService,
} from "@/lib/mappers";
import type { ClinicInfo, PublicProfessional, PublicService } from "@/types";

/** Cache tag for everything the public site reads; admin mutations call updateTag(PUBLIC_TAG). */
export const PUBLIC_TAG = "public-content";

/**
 * Public read model (cached with Cache Components). Every loader falls back to
 * the static configuration when the database is unreachable, so the website —
 * and WhatsApp booking — keep working even if the booking backend is down.
 * A fallback result is only cached briefly so the site recovers on its own.
 */
async function withFallback<T>(source: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    logger.warn("public_data_fallback", { source }, error);
    cacheLife("minutes");
    return fallback;
  }
}

export async function getClinic(): Promise<ClinicInfo> {
  "use cache";
  cacheLife("hours");
  cacheTag(PUBLIC_TAG);
  return withFallback(
    "clinic",
    async () => {
      const row = await prisma.clinicSettings.findUnique({ where: { id: 1 } });
      return row ? settingsToClinic(row) : defaultClinic;
    },
    defaultClinic,
  );
}

export async function getServices(): Promise<PublicService[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PUBLIC_TAG);
  return withFallback(
    "services",
    async () => {
      const rows = await prisma.service.findMany({
        where: { enabled: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: serviceInclude,
      });
      return rows.map(toPublicService);
    },
    defaultServices,
  );
}

export async function getProfessionals(): Promise<PublicProfessional[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PUBLIC_TAG);
  return withFallback(
    "professionals",
    async () => {
      const rows = await prisma.professional.findMany({
        where: { enabled: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: professionalInclude,
      });
      return rows.map(toPublicProfessional);
    },
    defaultProfessionals,
  );
}

export async function getServiceBySlug(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

export async function getProfessionalBySlug(slug: string) {
  return (await getProfessionals()).find((p) => p.slug === slug) ?? null;
}

/** Current year for the footer (cached so it can be part of the static shell). */
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
