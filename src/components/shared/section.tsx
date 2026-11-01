import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("relative", {
  variants: {
    tone: {
      white: "bg-background",
      sage: "bg-sage-300",
      sand: "bg-sand-200",
      paper: "bg-sand-100",
      forest: "tone-forest bg-background text-foreground",
    },
    space: {
      none: "",
      md: "py-16 sm:py-20",
      lg: "py-24 lg:py-[clamp(6rem,11svh,8rem)]",
    },
    /** Fills the height of the screen, with the content centred. */
    fill: {
      true: "flex min-h-svh flex-col justify-center",
      false: "",
    },
  },
  defaultVariants: { tone: "white", space: "lg", fill: true },
});

/** Full-bleed colour band: the basic building block of every page. */
export function Section({
  tone,
  space,
  fill,
  className,
  children,
  ...props
}: ComponentProps<"section"> & VariantProps<typeof sectionVariants>) {
  return (
    <section className={cn(sectionVariants({ tone, space, fill }), className)} {...props}>
      <div className="container-page">{children}</div>
    </section>
  );
}
