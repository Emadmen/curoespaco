import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(connectionString = process.env.DATABASE_URL ?? "") {
  // Prisma's CLI wants a mysql:// URL; the MariaDB driver (which also speaks MySQL) wants mariadb://.
  const url = new URL(connectionString.replace(/^mysql:/, "mariadb:"));
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    // Fail fast so the public site can fall back to static content.
    connectTimeout: 4000,
    acquireTimeout: 5000,
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type Db = PrismaClient;
