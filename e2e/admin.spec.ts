import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "../playwright.config";
import { t } from "../src/content";
import { fillContact, pickDateAndTime, uniquePhone } from "./helpers";

test.describe("Admin security", () => {
  test("unauthenticated visitors are redirected to the login page", async ({ page }) => {
    for (const path of ["/admin", "/admin/servicos", "/admin/profissionais/novo", "/admin/definicoes"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("admin APIs reject requests without a valid session", async ({ request, context, page }) => {
    const res = await request.get("/api/admin/appointments/export");
    expect(res.status()).toBe(401);
    expect(await res.text()).not.toContain("CR-");

    // A forged cookie passes the cheap proxy check but fails the database check.
    await context.addCookies([{ name: "cora_admin_session", value: "forged-token", url: "http://localhost:3100" }]);
    const forged = await page.request.get("/api/admin/appointments/export");
    expect(forged.status()).toBe(401);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("wrong password is rejected", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Palavra-passe").fill("wrong-password-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "incorretos" })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test("admin reviews and confirms a new appointment request", async ({ page, browser }) => {
  // A visitor submits a request…
  const visitor = await browser.newPage();
  await visitor.goto("/marcar-consulta?servico=psicologia-individual");
  await visitor.getByRole("button", { name: t.booking.skip }).click();
  await pickDateAndTime(visitor);
  await visitor.getByRole("button", { name: t.booking.next }).click();
  await fillContact(visitor, { name: "Paciente Admin", phone: uniquePhone() });
  await visitor.getByTestId("submit-booking").click();
  const reference = (await visitor.getByTestId("booking-reference").textContent())!.trim();
  await visitor.close();

  // …and the admin reviews it.
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Palavra-passe").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Pedidos de marcação" })).toBeVisible();

  await page.getByPlaceholder("Nome, telefone, email ou referência").fill(reference);
  await page.getByRole("button", { name: "Pesquisar" }).click();
  const row = page.locator(`[data-reference="${reference}"]`);
  await expect(row).toBeVisible();
  await expect(row.getByTestId("appointment-status")).toHaveText("Pendente");
  await expect(row).toContainText("Paciente Admin");
  await expect(row).toContainText("Psicologia Individual");

  await row.getByRole("button", { name: "Confirmar" }).click();
  await expect(row.getByTestId("appointment-status")).toHaveText("Confirmado");

  // Filter by status and export.
  await page.goto("/admin?status=CONFIRMED");
  await expect(page.locator(`[data-reference="${reference}"]`)).toBeVisible();
  const csv = await page.request.get(`/api/admin/appointments/export?q=${reference}`);
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const body = await csv.text();
  expect(body).toContain(reference);
  expect(body).toContain("Confirmado");

  // Logout ends the session.
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  const after = await page.request.get("/api/admin/appointments/export");
  expect(after.status()).toBe(401);
});
