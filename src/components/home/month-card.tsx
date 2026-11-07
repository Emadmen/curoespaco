"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { t } from "@/content";
import { cn } from "@/lib/utils";
import { bookingHref } from "@/components/shared/book-link";

/* The calendar only knows today's date in the browser, so it shows an empty month on the server. */
const noSubscribe = () => () => {};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** This month as a small calendar, today filled in and past days dimmed. It leads to the booking page; it does not claim free slots. */
export function MonthCard({ className }: { className?: string }) {
  const key = useSyncExternalStore(noSubscribe, todayKey, () => null);
  const [year, month, day] = key ? key.split("-").map(Number) : [2026, 0, 0];
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const date = key ? `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}` : "";

  return (
    <div className={cn("w-[19rem] max-w-full rounded-[1.5rem] border border-white/15 bg-forest-900/70 p-5 text-white backdrop-blur-xl", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-2xl font-light tracking-[-0.02em] template-3:font-(family-name:--v3-display) template-3:font-normal template-3:tracking-normal leading-none">{t.heroV3.calendarTitle}</p>
        <Link href="/marcar-consulta" className="text-xs underline underline-offset-4 hover:no-underline">
          {t.heroV3.calendarLink}
        </Link>
      </div>
      <p className="mt-1.5 text-xs text-white/70">
        {t.hero.statValue} {t.hero.statLabel}
      </p>

      <div aria-hidden="true" className="mt-4 grid grid-cols-7 gap-1.5">
        {t.heroV3.calendarWeekdays.map((d, i) => (
          <span key={`wd-${i}`} className="pb-0.5 text-center text-[0.625rem] font-medium text-white/55">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const n = i + 1;
          const today = n === day;
          return (
            <span
              key={n}
              className={cn(
                "grid aspect-square place-items-center rounded-full border text-[0.625rem] tabular-nums",
                today ? "border-white bg-white font-semibold text-black" : "border-white/25 text-white/85",
                key && n < day && "opacity-35",
              )}
            >
              {key ? n : ""}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/20 pt-4">
        <span className="text-2xl font-light tracking-[-0.02em] template-3:font-(family-name:--v3-display) template-3:font-normal template-3:tracking-normal leading-none tabular-nums">{date}</span>
        <Link
          href={bookingHref()}
          className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-black transition-colors hover:bg-white/85"
        >
          {t.heroV3.calendarAction}
        </Link>
      </div>
    </div>
  );
}
