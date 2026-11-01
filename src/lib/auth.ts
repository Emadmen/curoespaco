import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "cora_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.adminSession.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  // Opportunistic cleanup of expired sessions.
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

/** The authenticated admin for this request, or null. Validated against the database. */
export const getCurrentAdmin = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, user: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

/** Use in admin pages, layouts and server actions. Redirects to login when not authenticated. */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
