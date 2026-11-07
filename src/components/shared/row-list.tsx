import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

export type Row = { title: string; text: string };

/** Ruled rows: a title and its description, side by side or `stacked` in a narrow column. */
export function RowList({
  rows,
  numbered = false,
  stacked = false,
  compact = false,
  headingAs: Heading = "h3",
  className,
}: {
  rows: readonly Row[];
  numbered?: boolean;
  stacked?: boolean;
  /** Tighter rows, for a short list that should not fill the screen. */
  compact?: boolean;
  headingAs?: "h2" | "h3";
  className?: string;
}) {
  return (
    <Reveal as={numbered ? "ol" : "ul"} stagger className={cn("border-b", className)}>
      {rows.map((row, i) => (
        <li key={row.title} className="relative">
          <span data-reveal-line="" aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-border" />
          <div data-reveal-item="" className={cn("grid gap-3", compact ? "py-5 sm:py-6" : "py-8 sm:py-10", !stacked && "sm:grid-cols-2 sm:gap-12")}>
            <Heading className="type-display-sm">
              {numbered && (
                <span className="mr-4 tabular-nums" aria-hidden="true">
                  0{i + 1}
                </span>
              )}
              {numbered && <span className="sr-only">Passo {i + 1}: </span>}
              {row.title}
            </Heading>
            <p className="text-pretty-p self-center leading-relaxed text-muted-foreground">{row.text}</p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}

/** A short label (with an optional note) in the narrow column, rows in the wide one. */
export function LabelledRows({ label, note, children }: { label: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid-split">
      <div>
        <p className="eyebrow">{label}</p>
        {note && <div className="mt-2 text-sm">{note}</div>}
      </div>
      {children}
    </div>
  );
}
