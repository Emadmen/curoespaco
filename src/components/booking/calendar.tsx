"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/content";
import { parseDateOnly, toDateOnly } from "@/lib/dates";

type Props = {
  /** Selected "yyyy-MM-dd" or "" */
  value: string;
  onChange: (value: string) => void;
  /** "yyyy-MM-dd" of today in the clinic's time zone */
  today: string;
  /** Last selectable date "yyyy-MM-dd" */
  maxDate: string;
  isDisabled: (date: string) => boolean;
};

/** Mobile-friendly month calendar (Monday first) with roving-tabindex keyboard navigation. */
export function Calendar({ value, onChange, today, maxDate, isDisabled }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(parseDateOnly(value || today)));
  const [focused, setFocused] = useState(value || today);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const list: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) list.push(d);
    return list;
  }, [month]);

  // The single tabbable day: the focused one if usable, otherwise the first enabled day of the month.
  const tabTarget = useMemo(() => {
    const inMonth = (d: string) => isSameMonth(parseDateOnly(d), month);
    if (inMonth(focused) && !isDisabled(focused)) return focused;
    return days.map(toDateOnly).find((d) => inMonth(d) && !isDisabled(d)) ?? "";
  }, [days, focused, month, isDisabled]);

  const minMonth = startOfMonth(parseDateOnly(today));
  const maxMonth = startOfMonth(parseDateOnly(maxDate));
  const canPrev = month > minMonth;
  const canNext = month < maxMonth;
  const monthLabel = format(month, "LLLL 'de' yyyy", { locale: pt });
  const title = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  function moveFocus(target: string) {
    if (target < today || target > maxDate) return;
    const targetDate = parseDateOnly(target);
    if (!isSameMonth(targetDate, month)) setMonth(startOfMonth(targetDate));
    setFocused(target);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)?.focus();
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, date: string) {
    const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
    if (!step) return;
    e.preventDefault();
    // Skip over closed/disabled days in the direction of travel.
    let candidate = parseDateOnly(date);
    for (let i = 0; i < 31; i++) {
      candidate = addDays(candidate, step);
      const next = toDateOnly(candidate);
      if (next < today || next > maxDate) return;
      if (!isDisabled(next)) return moveFocus(next);
    }
  }

  return (
    <div className="surface p-3 sm:p-5">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => canPrev && setMonth(addMonths(month, -1))}
          disabled={!canPrev}
          aria-label={t.booking.prevMonth}
          className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-sage-100 disabled:opacity-30"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="type-display-sm" aria-live="polite">
          {title}
        </p>
        <button
          type="button"
          onClick={() => canNext && setMonth(addMonths(month, 1))}
          disabled={!canNext}
          aria-label={t.booking.nextMonth}
          className="grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-sage-100 disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div role="grid" aria-label={title} ref={gridRef}>
        <div role="row" className="grid grid-cols-7 pb-1">
          {t.weekdaysShort.map((d) => (
            <span key={d} role="columnheader" className="py-1 text-center label-caps">
              {d}
            </span>
          ))}
        </div>
        {Array.from({ length: days.length / 7 }, (_, week) => (
          <div role="row" key={week} className="grid grid-cols-7 gap-1">
            {days.slice(week * 7, week * 7 + 7).map((day) => {
              const date = toDateOnly(day);
              const outside = !isSameMonth(day, month);
              const disabled = outside || isDisabled(date);
              const selected = value === date;
              const isToday = date === today;
              return (
                <div role="gridcell" key={date} aria-selected={selected} className="flex justify-center">
                  {outside ? (
                    <span className="aspect-square w-full max-w-12" />
                  ) : (
                    <button
                      type="button"
                      data-date={date}
                      tabIndex={date === tabTarget ? 0 : -1}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={format(day, "EEEE, d 'de' MMMM", { locale: pt }) + (disabled ? ` — ${t.booking.closedDay}` : "")}
                      onClick={() => {
                        setFocused(date);
                        onChange(date);
                      }}
                      onKeyDown={(e) => onKeyDown(e, date)}
                      className={cn(
                        "relative grid aspect-square w-full max-w-12 place-items-center rounded-full text-[0.9375rem] font-medium tabular-nums transition-all outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        disabled
                          ? "cursor-not-allowed text-foreground/25 line-through decoration-foreground/20"
                          : "text-foreground hover:bg-sage-100",
                        selected && "bg-primary text-primary-foreground hover:bg-primary",
                      )}
                    >
                      {format(day, "d")}
                      {isToday && !selected && (
                        <span className="absolute bottom-1.5 size-1 rounded-full bg-primary" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
