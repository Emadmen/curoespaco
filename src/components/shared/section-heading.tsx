import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";
import { SplitTitle } from "@/components/shared/split-text";

/**
 * Section title. By default the eyebrow sits in the narrow column of the page
 * grid and the title in the wide one; use `stacked` inside a column of its own.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  stacked = false,
  as = "h2",
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  stacked?: boolean;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(!stacked && "grid-split", className)}>
      {eyebrow ? (
        <Reveal>
          <p className={cn("eyebrow", stacked && "mb-6")}>{eyebrow}</p>
        </Reveal>
      ) : (
        !stacked && <span className="max-lg:hidden" />
      )}
      <div className="max-w-3xl">
        <SplitTitle as={as} id={id} className="type-display-lg">
          {title}
        </SplitTitle>
        {intro && (
          <Reveal delay={0.25}>
            <p className="text-pretty-p mt-8 text-xl leading-relaxed text-muted-foreground">{intro}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
