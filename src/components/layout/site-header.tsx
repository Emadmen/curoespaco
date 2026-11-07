"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/content";
import { buildWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";
import { Logo } from "@/components/shared/logo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { LinkArrow, textLinkVariants } from "@/components/ui/text-link";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isActive, navItems } from "@/components/layout/nav-items";
import { TemplateSwitcher, useTemplate } from "@/components/layout/template-switcher";

type Props = { name: string; whatsapp: string; phone: string };

export function SiteHeader({ name, whatsapp, phone }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(whatsapp, whatsappMessages.general());
  const template = useTemplate();
  // The home hero is a dark photograph, so the header starts out inverted. Templates 2 and 3 open on light paper.
  const overPhoto = pathname === "/" && !scrolled && template === "1";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-border bg-background" : "border-transparent bg-transparent",
        overPhoto && "tone-forest",
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-3 lg:grid lg:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-12">
        <Logo name={name} />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(textLinkVariants({ variant: "quiet" }), "text-[0.9375rem] whitespace-nowrap", active && "underline")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2 lg:gap-3">
          {/* TEMPORARY: lets the client compare UI templates. Remove once one is chosen. */}
          <TemplateSwitcher />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.cta.whatsappAria}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "hidden sm:inline-flex")}
          >
            <WhatsAppIcon className="size-5" />
          </a>
          <Link
            href="/marcar-consulta"
            className={cn(buttonVariants({ size: "sm" }), "template-2:bg-(--v2-cocoa) template-2:text-(--v2-cream) template-2:hover:bg-(--v2-cocoa)/85")}
          >
            <span className="hidden min-[400px]:inline">{t.cta.book}</span>
            <span className="min-[400px]:hidden">{t.cta.bookShort}</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
              aria-label={t.nav.menu}
            >
              <Menu className="size-6" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm border-none bg-sand-100 p-0">
              <SheetTitle className="sr-only">{t.nav.menu}</SheetTitle>
              <div className="flex h-full flex-col px-6 pt-6 pb-8">
                <div onClick={() => setOpen(false)}>
                  <Logo name={name} />
                </div>
                <nav aria-label="Menu móvel" className="mt-10">
                  <ul className="flex flex-col border-b">
                    {navItems.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center justify-between border-t py-4 type-display-sm text-foreground",
                              active && "underline decoration-1 underline-offset-4",
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <div className="mt-auto flex flex-col gap-3 pt-8">
                  <Link
                    href="/marcar-consulta"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ size: "lg" })}
                  >
                    {t.cta.book}
                    <LinkArrow />
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.cta.whatsappAria}
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    <WhatsAppIcon className="size-5" />
                    {t.cta.whatsappLong}
                  </a>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                    <Phone aria-hidden="true" />
                    {phone}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
