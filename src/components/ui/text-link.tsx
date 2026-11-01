import type { ComponentProps } from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ArrowUpRight } from "lucide-react"

const textLinkVariants = cva(
  "group/link inline-flex items-center rounded-xs text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        /** The signature call to action: uppercase, with a rising arrow. */
        cta: "gap-2 tracking-[-0.015em] uppercase underline-offset-4 hover:underline",
        /** Links inside running text. */
        inline: "underline decoration-1 underline-offset-4 hover:no-underline",
        /** Navigation and lists: no rule until hovered. */
        quiet: "gap-1.5 underline-offset-4 hover:underline",
      },
      size: {
        sm: "text-[0.8125rem]",
        default: "",
        lg: "text-base sm:text-lg",
      },
    },
    defaultVariants: { variant: "inline", size: "default" },
  }
)

function LinkArrow({ className }: { className?: string }) {
  return (
    <ArrowUpRight
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn(
        "size-[1.15em] shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5",
        className
      )}
    />
  )
}

type TextLinkProps = ComponentProps<typeof Link> &
  VariantProps<typeof textLinkVariants> & {
    /** Shows the rising arrow. Defaults to on for `cta`. */
    arrow?: boolean
  }

/** Any link that is not a button. Pass `target="_blank"` and `rel` for external links. */
function TextLink({
  variant,
  size,
  arrow = variant === "cta",
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link data-slot="text-link" className={cn(textLinkVariants({ variant, size }), className)} {...props}>
      {children}
      {arrow && <LinkArrow />}
    </Link>
  )
}

export { LinkArrow, TextLink, textLinkVariants }
