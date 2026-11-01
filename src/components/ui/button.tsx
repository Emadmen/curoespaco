import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/85",
        outline:
          "border-input text-foreground hover:bg-foreground hover:text-background aria-expanded:bg-muted",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70 aria-expanded:bg-secondary",
        ghost: "border-transparent text-foreground hover:bg-foreground/8 aria-expanded:bg-muted",
        destructive:
          "border-transparent bg-danger-100 text-destructive hover:bg-destructive hover:text-white focus-visible:ring-destructive",
        link: "rounded-none border-transparent px-0 text-foreground underline underline-offset-4",
      },
      size: {
        default: "h-11 gap-2 px-5",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-[0.9375rem]",
        xl: "h-14 gap-2.5 px-8 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
