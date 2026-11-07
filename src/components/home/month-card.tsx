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

/** The two looks: frosted dark over a photograph, or a lighter tinted glass that holds its own on the paper. */
const TONES = {
  glass: {
    card: "border-white/15 bg-forest-900/70 text-white backdrop-blur-xl",
    soft: "text-white/70",
    weekday: "text-white/55",
    day: "border-white/25 text-white/85",
    today: "border-white bg-white text-black",
    rule: "border-white/20",
    action: "bg-white text-black hover:bg-white/85",
  },
  frost: {
    card: "border-white/40 bg-forest-900/55 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] backdrop-blur-xl",
    soft: "text-white/75",
    weekday: "text-white/60",
    day: "border-white/30 bg-white/5 text-white/90",
    today: "border-white bg-white text-black",
    rule: "border-white/25",
    action: "bg-white text-black hover:bg-white/85",
  },
};

/** This month as a small calendar, today filled in and past days dimmed. It leads to the booking page; it does not claim free slots. */
export function MonthCard({ className, tone = "glass" }: { className?: string; tone?: keyof typeof TONES }) {
  const look = TONES[tone];
  const key = useSyncExternalStore(noSubscribe, todayKey, () => null);
  const [year, month, day] = key ? key.split("-").map(Number) : [2026, 0, 0];
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const date = key ? `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}` : "";

  return (
    <div className={cn("w-[19rem] max-w-full rounded-[1.5rem] border p-5", look.card, className)}>
      <div className="relative flex items-baseline justify-between gap-4">
        <p className="text-2xl font-light tracking-[-0.02em] template-3:font-(family-name:--v3-display) template-3:font-normal template-3:tracking-normal leading-none">{t.heroV3.calendarTitle}</p>
        <Link href="/marcar-consulta" className="text-xs underline underline-offset-4 hover:no-underline">
          {t.heroV3.calendarLink}
        </Link>
      </div>
      <p className={cn("relative mt-1.5 text-xs", look.soft)}>
        {t.hero.statValue} {t.hero.statLabel}
      </p>

      <div aria-hidden="true" className="relative mt-4 grid grid-cols-7 gap-1.5">
        {t.heroV3.calendarWeekdays.map((d, i) => (
          <span key={`wd-${i}`} className={cn("pb-0.5 text-center text-[0.625rem] font-medium", look.weekday)}>
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
                today ? cn("font-semibold", look.today) : look.day,
                key && n < day && "opacity-35",
              )}
            >
              {key ? n : ""}
            </span>
          );
        })}
      </div>

      <div className={cn("relative mt-4 flex items-center justify-between gap-4 border-t pt-4", look.rule)}>
        <span className="text-2xl font-light tracking-[-0.02em] template-3:font-(family-name:--v3-display) template-3:font-normal template-3:tracking-normal leading-none tabular-nums">{date}</span>
        <Link
          href={bookingHref()}
          className={cn("inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold transition-colors", look.action)}
        >
          {t.heroV3.calendarAction}
        </Link>
      </div>
    </div>
  );
}
