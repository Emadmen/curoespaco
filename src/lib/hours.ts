import { t } from "@/content";
import type { OpeningHoursEntry } from "@/types";

export type HoursGroup = { label: string; value: string };

/** Groups consecutive days with identical hours: "Segunda a Quinta · 09:00 – 20:00". */
export function groupOpeningHours(hours: OpeningHoursEntry[]): HoursGroup[] {
  const sorted = [...hours].sort((a, b) => a.day - b.day);
  const valueOf = (h: OpeningHoursEntry) => (h.closed ? t.contact.closed : `${h.open} – ${h.close}`);
  const groups: { from: number; to: number; value: string }[] = [];
  for (const h of sorted) {
    const value = valueOf(h);
    const last = groups.at(-1);
    if (last && last.value === value && last.to === h.day - 1) last.to = h.day;
    else groups.push({ from: h.day, to: h.day, value });
  }
  const name = (d: number) => t.weekdays[d - 1];
  return groups.map((g) => ({
    label: g.from === g.to ? name(g.from) : `${name(g.from)} a ${name(g.to)}`,
    value: g.value,
  }));
}

/** schema.org openingHoursSpecification for structured data. */
export function openingHoursSpecification(hours: OpeningHoursEntry[]) {
  const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return hours
    .filter((h) => !h.closed)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${names[h.day - 1]}`,
      opens: h.open,
      closes: h.close,
    }));
}
