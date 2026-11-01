"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getDummyHash, verifyPassword } from "@/lib/password";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "Indique o email e a palavra-passe." };

  const ip = getClientIp(await headers());
  const ipLimit = rateLimit(`login-ip:${ip}`, 20, 15 * 60_000);
  const accountLimit = rateLimit(`login-acc:${parsed.data.email}`, 5, 15 * 60_000);
  if (!ipLimit.ok || !accountLimit.ok) {
    return { error: "Demasiadas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Always run a hash comparison so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    logger.warn("admin_login_failed");
    return { error: "Email ou palavra-passe incorretos." };
  }

  await createSession(user.id);
  logger.info("admin_login_success", { userId: user.id });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
