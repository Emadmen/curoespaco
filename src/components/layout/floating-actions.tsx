"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/content";
import { buildWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";

/**
 * Persistent booking access:
 *  - mobile: bottom bar with "Marcar" + "WhatsApp" (hidden on the booking page itself)
 *  - desktop (and the mobile booking page): floating WhatsApp button
 */
export function FloatingActions({ whatsapp }: { whatsapp: string }) {
  const pathname = usePathname();
  const onBookingPage = pathname.startsWith("/marcar-consulta");
  const href = buildWhatsAppUrl(whatsapp, whatsappMessages.general());

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.cta.whatsappAria}
        data-floating-whatsapp
        className={cn(
          "group fixed right-4 bottom-4 z-30 items-center rounded-full border border-forest-700/20 bg-white p-[9px] text-forest-700 transition-colors hover:border-white/40 hover:bg-forest-700 hover:text-white focus-visible:bg-forest-700 focus-visible:text-white",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          onBookingPage ? "flex" : "hidden md:flex",
        )}
      >
        <WhatsAppIcon className="size-6" />
        <span className="hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-40 group-hover:pr-1.5 group-focus-visible:ml-2 group-focus-visible:max-w-40 group-focus-visible:pr-1.5 md:inline">
          {t.cta.whatsappLong}
        </span>
      </a>

      {!onBookingPage && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t bg-background px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
          data-mobile-booking-bar
        >
          <div className="mx-auto flex max-w-md gap-2.5">
            <Link href="/marcar-consulta" className={cn(buttonVariants({ size: "lg" }), "flex-1")}>
              {t.cta.book}
            </Link>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.cta.whatsappAria}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex-1")}
            >
              <WhatsAppIcon className="size-5" />
              {t.cta.whatsapp}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
