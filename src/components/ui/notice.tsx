import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const noticeVariants = cva("flex gap-2.5 rounded-lg p-3.5 text-sm leading-snug [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    tone: {
      info: "bg-sand-100 text-forest-700",
      success: "bg-sage-100 text-forest-700",
      error: "bg-danger-100 text-danger-700",
    },
  },
  defaultVariants: { tone: "info" },
})

/** Inline message for hints, confirmations and errors. */
function Notice({ className, tone, ...props }: ComponentProps<"div"> & VariantProps<typeof noticeVariants>) {
  return <div data-slot="notice" className={cn(noticeVariants({ tone }), className)} {...props} />
}

export { Notice, noticeVariants }
