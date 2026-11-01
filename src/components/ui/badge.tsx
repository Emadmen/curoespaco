import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-sand-200 text-forest-700",
      sage: "bg-sage-200 text-forest-700",
      warning: "bg-warning-100 text-warning-800",
      danger: "bg-danger-100 text-danger-700",
      outline: "border border-input text-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
})

function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />
}

export { Badge, badgeVariants }
