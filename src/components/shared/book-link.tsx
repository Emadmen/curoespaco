import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LinkArrow, textLinkVariants } from "@/components/ui/text-link";
import { t } from "@/content";

export function bookingHref(params?: { service?: string | null; professional?: string | null }) {
  const search = new URLSearchParams();
  if (params?.service) search.set("servico", params.service);
  if (params?.professional) search.set("profissional", params.professional);
  const qs = search.toString();
  return `/marcar-consulta${qs ? `?${qs}` : ""}`;
}

type Props = {
  /** Service slug to preselect. */
  service?: string | null;
  /** Professional slug to preselect. */
  professional?: string | null;
  label?: string;
  className?: string;
  /** Renders the ruled CTA link instead of a button. */
  cta?: boolean;
  /** Renders a plain text link, for lists and cards. */
  quiet?: boolean;
  ariaLabel?: string;
} & VariantProps<typeof buttonVariants>;

/** Primary booking CTA. Carries service/professional selection into the booking flow. */
export function BookLink({
  service,
  professional,
  label = t.cta.book,
  className,
  cta = false,
  quiet = false,
  ariaLabel,
  variant,
  size,
}: Props) {
  return (
    <Link
      href={bookingHref({ service, professional })}
      aria-label={ariaLabel}
      data-book-link
      className={cn(
        quiet
          ? textLinkVariants({ variant: "quiet" })
          : cta
            ? textLinkVariants({ variant: "cta", size: "lg" })
            : buttonVariants({ variant, size }),
        className,
      )}
    >
      <span>{label}</span>
      <LinkArrow />
    </Link>
  );
}
