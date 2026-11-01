import { expect, test } from "@playwright/test";
import { t } from "../src/content";
import { expectStep, fillContact, pickDateAndTime, query, textParam, uniquePhone, wizard } from "./helpers";

test.describe("Online appointment request", () => {
  test("visitor requests an appointment from the header CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: /Marcar/ }).click();
    await expect(page).toHaveURL(/\/marcar-consulta$/);

    // Step 1 — service (auto-advances)
    await expectStep(page, 0);
    await wizard(page).getByText("Psicologia Individual", { exact: true }).click();
    // Step 2 — professional is optional
    await expectStep(page, 1);
    await expect(page.getByRole("radio", { name: new RegExp(t.booking.noPreference) })).toBeChecked();
    await page.getByRole("button", { name: t.booking.skip }).click();
    // Step 3 — date/time, clearly a preference
    await expect(page.getByText(t.booking.requestModeNotice)).toBeVisible();
    const { date, time } = await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();
    // Step 4 — minimal contact details
    const phone = uniquePhone();
    await fillContact(page, { name: "Teste Feliz", phone, email: "teste@example.com" });
    await page.getByTestId("submit-booking").click();

    // Success only after the server saved the request.
    await expect(page.getByTestId("booking-success")).toBeVisible();
    await expect(page.getByRole("heading", { name: t.booking.successTitle })).toBeVisible();
    await expect(page.getByText(t.booking.successText)).toBeVisible();
    const reference = (await page.getByTestId("booking-reference").textContent())!.trim();
    expect(reference).toMatch(/^CR-[A-Z2-9]{6}$/);

    const rows = await query<{ status: string; preferred_time: string; service: string; prof: string | null; d: string }>(
      `SELECT status, "preferredTime" AS preferred_time, "serviceName" AS service, "professionalName" AS prof,
              to_char("preferredDate", 'YYYY-MM-DD') AS d
         FROM "Appointment" WHERE reference = $1`,
      [reference],
    );
    expect(rows).toEqual([{ status: "PENDING", preferred_time: time, service: "Psicologia Individual", prof: null, d: date }]);

    // "Continuar no WhatsApp" carries the non-sensitive preferences.
    const text = textParam(await page.getByTestId("success-whatsapp").getAttribute("href"));
    expect(text).toContain("Serviço: Psicologia Individual");
    expect(text).toContain("Profissional: Sem preferência");
    expect(text).toContain(`Horário preferido: ${time}`);
    expect(text).not.toContain("Teste Feliz");
    expect(text).not.toContain(phone);
  });

  test("therapist chosen on the team page is preserved through the booking", async ({ page }) => {
    await page.goto("/equipa");
    await page.getByRole("link", { name: `${t.cta.bookWithProfessional}: Rui Exemplo` }).click();
    await expect(page).toHaveURL(/profissional=rui-exemplo/);

    await expectStep(page, 0);
    await expect(wizard(page).getByText("Rui Exemplo")).toBeVisible();
    // Only Rui's services are offered; choosing one skips straight to date/time.
    await expect(wizard(page).getByText("Psicologia Infantil", { exact: true })).toHaveCount(0);
    await wizard(page).getByText("Terapia de Casal", { exact: true }).click();
    await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();
    await expect(page.getByLabel(t.booking.summary)).toContainText("Rui Exemplo");

    await fillContact(page, { name: "Casal Teste", phone: uniquePhone() });
    await page.getByTestId("submit-booking").click();
    await expect(page.getByTestId("booking-success")).toBeVisible();
    const reference = (await page.getByTestId("booking-reference").textContent())!.trim();
    const rows = await query<{ prof: string; service: string }>(
      `SELECT "professionalName" AS prof, "serviceName" AS service FROM "Appointment" WHERE reference = $1`,
      [reference],
    );
    expect(rows).toEqual([{ prof: "Rui Exemplo", service: "Terapia de Casal" }]);
  });

  test("service chosen on a service card carries into the booking", async ({ page }) => {
    await page.goto("/servicos");
    await page.getByRole("link", { name: `${t.cta.book}: Terapia Familiar` }).click();
    await expect(page).toHaveURL(/servico=terapia-familiar/);
    await expectStep(page, 1);
    await page.getByRole("button", { name: t.booking.back }).click();
    await expect(page.getByRole("radio", { name: /Terapia Familiar/ })).toBeChecked();
  });

  test("invalid details show helpful validation and nothing is sent", async ({ page }) => {
    let posted = 0;
    page.on("request", (r) => r.url().endsWith("/api/bookings") && r.method() === "POST" && posted++);

    await page.goto("/marcar-consulta?servico=psicologia-individual");
    await page.getByRole("button", { name: t.booking.skip }).click();

    // Can't continue without a date/time.
    await page.getByRole("button", { name: t.booking.next }).click();
    await expect(page.getByText(t.booking.validation.date)).toBeVisible();
    await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();

    await fillContact(page, { name: "A", phone: "123", email: "não-é-email", consent: false });
    await page.getByTestId("submit-booking").click();
    await expect(page.getByText(t.booking.validation.name)).toBeVisible();
    await expect(page.getByText(t.booking.validation.phone)).toBeVisible();
    await expect(page.getByText(t.booking.validation.email)).toBeVisible();
    await expect(page.getByText(t.booking.validation.consent)).toBeVisible();
    await expect(page.getByLabel(t.booking.phone)).toHaveAttribute("aria-invalid", "true");
    expect(posted).toBe(0);
    await expect(page.getByTestId("booking-success")).toHaveCount(0);
  });

  test("double submission creates a single appointment request", async ({ page }) => {
    const phone = uniquePhone();
    await page.goto("/marcar-consulta?servico=avaliacao-psicologica");
    await page.getByRole("button", { name: t.booking.skip }).click();
    await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();
    await fillContact(page, { name: "Duplo Clique", phone });

    // Slow the response down so a second click lands while the first is in flight.
    await page.route("**/api/bookings", async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.continue();
    });
    const submit = page.getByTestId("submit-booking");
    await submit.click();
    await submit.click({ force: true }).catch(() => {});
    await page.evaluate(() => (document.querySelector("form") as HTMLFormElement | null)?.requestSubmit());

    await expect(page.getByTestId("booking-success")).toBeVisible();
    const rows = await query(`SELECT id FROM "Appointment" WHERE phone = $1`, [`+351${phone}`]);
    expect(rows).toHaveLength(1);
  });

  test("a server error never results in a false confirmation", async ({ page }) => {
    await page.route("**/api/bookings", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, code: "SERVER_ERROR" }) }),
    );
    await page.goto("/marcar-consulta?servico=psicologia-individual&profissional=marta-exemplo");
    await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();
    await fillContact(page, { name: "Erro Servidor", phone: uniquePhone() });
    await page.getByTestId("submit-booking").click();

    const alert = page.getByRole("alert").filter({ hasText: t.booking.errorTitle });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("NÃO foi registado");
    await expect(page.getByTestId("booking-success")).toHaveCount(0);
    // WhatsApp fallback still works when the backend is down.
    const text = textParam(await alert.getByRole("link", { name: t.booking.whatsappFallback }).getAttribute("href"));
    expect(text).toContain("Profissional: Marta Exemplo");
  });

  test("a network failure or malformed response is not treated as success", async ({ page }) => {
    await page.goto("/marcar-consulta?servico=psicologia-individual");
    await page.getByRole("button", { name: t.booking.skip }).click();
    await pickDateAndTime(page);
    await page.getByRole("button", { name: t.booking.next }).click();
    await fillContact(page, { name: "Sem Rede", phone: uniquePhone() });

    await page.route("**/api/bookings", (route) => route.abort("internetdisconnected"));
    await page.getByTestId("submit-booking").click();
    await expect(page.getByText(t.booking.errorNetwork)).toBeVisible();

    // 200 OK without an explicit ok:true + reference is still an error.
    await page.unroute("**/api/bookings");
    await page.route("**/api/bookings", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
    await page.getByTestId("submit-booking").click();
    await expect(page.getByText(t.booking.errorGeneric)).toBeVisible();
    await expect(page.getByTestId("booking-success")).toHaveCount(0);
  });
});
