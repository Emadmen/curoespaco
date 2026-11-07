/**
 * Seeds sample, non-sensitive development content and the bootstrap admin.
 * Safe to run repeatedly: existing content is left untouched (only missing
 * rows are created) and the admin password is updated from the environment.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defaultClinic, defaultProfessionals, defaultServices } from "../src/config/clinic";
import { createPrismaClient } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";

const prisma = createPrismaClient();

/** Sample weekly schedule, only used when booking mode is switched to LIVE. */
const sampleWorkingHours = {
  "1": [{ start: "10:00", end: "13:00" }, { start: "14:00", end: "19:00" }],
  "2": [{ start: "10:00", end: "13:00" }, { start: "14:00", end: "19:00" }],
  "3": [{ start: "14:00", end: "20:00" }],
  "4": [{ start: "10:00", end: "13:00" }, { start: "14:00", end: "19:00" }],
  "5": [{ start: "09:00", end: "13:00" }],
};

/** Stores a photograph from /public as a MediaAsset, the same way an admin upload is kept. */
async function storePortrait(imageUrl: string) {
  const data = await readFile(path.join(process.cwd(), "public", imageUrl));
  const ext = path.extname(imageUrl).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const asset = await prisma.mediaAsset.create({ data: { mimeType, size: data.length, data } });
  return asset.id;
}

async function main() {
  const { openingHours, socials, ...clinic } = defaultClinic;
  await prisma.clinicSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...clinic, openingHours, socials },
  });

  for (const [index, s] of defaultServices.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        id: s.id,
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        icon: s.icon,
        durationMinutes: s.durationMinutes,
        sortOrder: index,
      },
    });
  }

  for (const [index, p] of defaultProfessionals.entries()) {
    const existing = await prisma.professional.findUnique({ where: { slug: p.slug } });
    if (existing) {
      // Give a default portrait to anyone still without one; never replace an admin upload.
      if (!existing.imageId && p.imageUrl) {
        await prisma.professional.update({ where: { id: existing.id }, data: { imageId: await storePortrait(p.imageUrl) } });
        console.log(`Portrait added: ${p.name}`);
      }
      continue;
    }
    await prisma.professional.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        title: p.title,
        bio: p.bio,
        registrationNumber: p.registrationNumber,
        expertise: p.expertise,
        workingHours: sampleWorkingHours,
        sortOrder: index,
        imageId: p.imageUrl ? await storePortrait(p.imageUrl) : null,
        services: { create: p.serviceIds.map((serviceId) => ({ serviceId })) },
      },
    });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must have at least 12 characters.");
    const passwordHash = await hashPassword(password);
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, name: "Administração", passwordHash },
    });
    console.log(`Admin account ready: ${email}`);
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin account created.");
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
