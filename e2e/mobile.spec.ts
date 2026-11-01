import { expect, test } from "@playwright/test";
import { t } from "../src/content";

const pages = ["/", "/sobre", "/servicos", "/servicos/psicologia-individual", "/equipa", "/equipa/marta-exemplo", "/espaco", "/contactos", "/marcar-consulta"];

test.describe("Mobile", () => {
  for (const width of [320, 360]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      for (const path of pages) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("sticky booking bar keeps Marcar and WhatsApp one tap away", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("[data-mobile-booking-bar]");
    await expect(bar).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(bar).toBeInViewport();
    await expect(bar.getByRole("link", { name: new RegExp(t.cta.book) })).toBeVisible();
    await expect(bar.getByRole("link", { name: t.cta.whatsappAria })).toHaveAttribute("href", /^https:\/\/wa\.me\//);

    // Touch targets are comfortably large.
    const box = await bar.getByRole("link").first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("mobile menu opens and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: t.nav.menu }).click();
    await page.getByRole("navigation", { name: "Menu móvel" }).getByRole("link", { name: t.nav.team }).click();
    await expect(page).toHaveURL(/\/equipa$/);
  });
});
