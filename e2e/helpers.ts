import { expect, type Page } from "@playwright/test";
import mariadb from "mariadb";
import { t } from "../src/content";

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "mysql://cora:cora_dev_password@localhost:3307/cora_e2e";

/** Runs a read-only query against the e2e database. */
export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await mariadb.createConnection(E2E_DATABASE_URL.replace(/^mysql:/, "mariadb:"));
  try {
    return [...(await client.query(sql, params))] as T[];
  } finally {
    await client.end();
  }
}

export function uniquePhone() {
  return `91${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;
}

export function wizard(page: Page) {
  return page.getByTestId("booking-wizard");
}

export async function expectStep(page: Page, step: number) {
  await expect(wizard(page)).toHaveAttribute("data-step", String(step));
}

/** Picks the first open day that still has time options, then the first time. Returns { date, time }. */
export async function pickDateAndTime(page: Page) {
  await expectStep(page, 2);
  const days = page.locator("[data-date]:not([disabled])");
  await expect(days.first()).toBeVisible();
  const count = await days.count();
  for (let i = 0; i < count; i++) {
    const day = days.nth(i);
    const date = (await day.getAttribute("data-date"))!;
    await day.click();
    const firstTime = wizard(page).getByRole("radio").first();
    const none = page.getByText(t.booking.noTimes);
    await expect(firstTime.or(none)).toBeVisible();
    if (await firstTime.isVisible()) {
      const time = (await firstTime.textContent())!.trim();
      await firstTime.click();
      return { date, time };
    }
  }
  throw new Error("No bookable date found");
}

export async function fillContact(page: Page, data: { name: string; phone: string; email?: string; consent?: boolean }) {
  await expectStep(page, 3);
  await page.getByLabel(t.booking.name).fill(data.name);
  await page.getByLabel(t.booking.phone).fill(data.phone);
  if (data.email) await page.getByLabel(/^Email/).fill(data.email);
  if (data.consent !== false) await page.getByRole("checkbox").check();
}

export function textParam(href: string | null) {
  return href ? new URL(href).searchParams.get("text") : null;
}
