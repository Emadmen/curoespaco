/**
 * Deletes appointment requests older than the configured retention period
 * (ClinicSettings.retentionDays). Schedule it (e.g. daily cron) in production:
 *
 *   npm run db:purge
 */
import "dotenv/config";
import { createPrismaClient } from "../src/lib/db";

const prisma = createPrismaClient();

async function main() {
  const settings = await prisma.clinicSettings.findUnique({ where: { id: 1 }, select: { retentionDays: true } });
  const days = settings?.retentionDays ?? 365;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const { count } = await prisma.appointment.deleteMany({ where: { createdAt: { lt: cutoff } } });
  // Expired admin sessions are also removed.
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  console.log(`Deleted ${count} appointment request(s) older than ${days} days.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
