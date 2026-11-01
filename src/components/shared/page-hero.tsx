import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Contours } from "@/components/shared/decor";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";

/**
 * Sage header band shared by every page. Slides under the transparent site
 * header and fills the screen; `compact` is for pages that must start working
 * straight away (the booking form, legal text).
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  aside,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative -mt-[4.5rem] overflow-hidden bg-sage-300 pt-[4.5rem] lg:-mt-20 lg:pt-20",
        !compact && "flex min-h-svh flex-col justify-center lg:justify-start",
      )}
    >
      <Contours />
      <div className={cn("container-page grid-split relative", compact ? "py-14 sm:py-20" : "hero-offset py-16")}>
        <Reveal immediate delay={0.1}>
          <p className="eyebrow">{eyebrow}</p>
          {aside && <div className="mt-6">{aside}</div>}
        </Reveal>
        <div className="max-w-4xl">
          <SplitTitle as="h1" immediate delay={0.15} className="type-display-lg">
            {title}
          </SplitTitle>
          {intro && (
            <Reveal immediate delay={0.6}>
              <p className="text-pretty-p mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">{intro}</p>
            </Reveal>
          )}
          {children && (
            <Reveal immediate delay={0.8} className="mt-12">
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
