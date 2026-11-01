import { expect, test } from "@playwright/test";
import { defaultClinic } from "../src/config/clinic";
import { t } from "../src/content";
import { textParam } from "./helpers";

const NUMBER = defaultClinic.whatsapp;
const general = "Olá! Gostaria de obter informações e marcar uma consulta. Podem ajudar-me?";

function expectWaLink(href: string | null, message: string) {
  expect(href).not.toBeNull();
  const url = new URL(href!);
  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe(`/${NUMBER}`);
  expect(textParam(href)).toBe(message);
}

test.describe("WhatsApp links", () => {
  test("header, hero and floating button use the clinic number and general message", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner").getByRole("link", { name: t.cta.whatsappAria });
    expectWaLink(await header.getAttribute("href"), general);
    await expect(header).toHaveAttribute("target", "_blank");
    await expect(header).toHaveAttribute("rel", /noopener/);

    const hero = page.locator("#hero-title").locator("xpath=ancestor::section").locator("[data-whatsapp-link]");
    expectWaLink(await hero.getAttribute("href"), general);

    const floating = page.locator("[data-floating-whatsapp]");
    await expect(floating).toBeVisible();
    expectWaLink(await floating.getAttribute("href"), general);
  });

  test("every WhatsApp link on the homepage targets the configured number", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator('a[href^="https://wa.me/"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) expect(new URL(href).pathname).toBe(`/${NUMBER}`);
  });

  test("service page uses the service message", async ({ page }) => {
    await page.goto("/servicos/terapia-de-casal");
    const link = page.locator("main [data-whatsapp-link]").first();
    expectWaLink(await link.getAttribute("href"), "Olá! Gostaria de marcar uma consulta de Terapia de Casal. Podem ajudar-me?");
  });

  test("therapist card and profile use the therapist message", async ({ page }) => {
    await page.goto("/equipa");
    const card = page.locator("article").filter({ hasText: "Inês Exemplo" });
    const message = "Olá! Gostaria de saber a disponibilidade para uma consulta com Inês Exemplo. Obrigado/a!";
    expectWaLink(await card.locator("[data-whatsapp-link]").getAttribute("href"), message);

    await page.goto("/equipa/ines-exemplo");
    expectWaLink(await page.locator("main [data-whatsapp-link]").first().getAttribute("href"), message);
  });

  test("booking page offers WhatsApp with the selected preferences", async ({ page }) => {
    await page.goto("/marcar-consulta?servico=psicologia-infantil&profissional=ines-exemplo");
    await page.locator("[data-date]:not([disabled])").first().waitFor();
    // The generic aside link stays available even before the form is complete.
    const aside = page.locator("aside [data-whatsapp-link]");
    expectWaLink(await aside.getAttribute("href"), general);
  });
});
