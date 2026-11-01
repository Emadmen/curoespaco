import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { textLinkVariants } from "@/components/ui/text-link";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { t } from "@/content";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  number: string;
  message?: string;
  label?: string;
  className?: string;
  /** Hide the icon (e.g. when the label already makes it obvious). */
  hideIcon?: boolean;
  /** Renders the ruled CTA link instead of a button. */
  cta?: boolean;
  /** Renders a plain text link, for lists and cards. */
  quiet?: boolean;
} & VariantProps<typeof buttonVariants>;

/** WhatsApp click-to-chat link. Always opens in a new tab. */
export function WhatsAppLink({
  number,
  message,
  label = t.cta.whatsapp,
  className,
  hideIcon,
  cta = false,
  quiet = false,
  variant = "outline",
  size,
}: Props) {
  return (
    <a
      href={buildWhatsAppUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — ${t.cta.whatsappAria}`}
      data-whatsapp-link
      className={cn(
        quiet
          ? textLinkVariants({ variant: "quiet" })
          : cta
            ? textLinkVariants({ variant: "cta", size: "lg" })
            : buttonVariants({ variant, size }),
        className,
      )}
    >
      {!hideIcon && <WhatsAppIcon className="size-[1.15em]" />}
      <span>{label}</span>
    </a>
  );
}
