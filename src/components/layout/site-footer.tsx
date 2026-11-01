import Link from "next/link";
import { siteConfig } from "@/config/clinic";
import { t } from "@/content";
import { getCurrentYear } from "@/lib/data";
import { groupOpeningHours } from "@/lib/hours";
import { buildWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo } from "@/types";
import { Logo } from "@/components/shared/logo";
import { TextLink, textLinkVariants } from "@/components/ui/text-link";
import { navItems } from "@/components/layout/nav-items";

const quiet = textLinkVariants({ variant: "quiet" });
const columnTitle = "eyebrow font-sans";

export async function SiteFooter({ clinic }: { clinic: ClinicInfo }) {
  const year = await getCurrentYear();
  const socials = Object.entries(clinic.socials).filter(([, url]) => !!url) as [string, string][];
  const socialLabel: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn" };

  return (
    <footer className="tone-forest mt-auto bg-background text-foreground">
      <div className="container-page grid gap-12 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:pt-20">
        <div className="max-w-xs">
          <Logo name={clinic.name} />
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">{t.footer.description}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={textLinkVariants({ variant: "inline" })}>
                    {socialLabel[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label={t.footer.navigation}>
          <h2 className={columnTitle}>{t.footer.navigation}</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {navItems.map((item) => (
              <li key={item.href}>
                <TextLink href={item.href} variant="quiet">
                  {item.label}
                </TextLink>
              </li>
            ))}
            <li>
              <TextLink href="/marcar-consulta" variant="quiet" arrow>
                {t.cta.book}
              </TextLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={columnTitle}>{t.footer.contacts}</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            <li>
              <address className="text-muted-foreground not-italic">
                {clinic.addressLine1}
                {clinic.addressLine2 && <><br />{clinic.addressLine2}</>}
                <br />
                {clinic.postalCode} {clinic.city}
              </address>
            </li>
            <li>
              <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className={quiet}>{clinic.phone}</a>
            </li>
            <li>
              <a
                href={buildWhatsAppUrl(clinic.whatsapp, whatsappMessages.general())}
                target="_blank"
                rel="noopener noreferrer"
                className={quiet}
              >
                {t.cta.whatsappLong}
              </a>
            </li>
            <li>
              <a href={`mailto:${clinic.email}`} className={`${quiet} break-all`}>{clinic.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={columnTitle}>{t.contact.hours}</h2>
          <dl className="mt-5 space-y-2.5 text-[0.9375rem]">
            {groupOpeningHours(clinic.openingHours).map((g) => (
              <div key={g.label} className="flex justify-between gap-4 border-b pb-2.5">
                <dt className="text-muted-foreground">{g.label}</dt>
                <dd className="tabular-nums">{g.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} {clinic.name}. {t.footer.rights}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t.footer.legal}>
            <li><Link href="/politica-de-privacidade" className={quiet}>{t.footer.privacy}</Link></li>
            <li><Link href="/termos-e-condicoes" className={quiet}>{t.footer.terms}</Link></li>
            <li>
              <a href={siteConfig.complaintsBookUrl} target="_blank" rel="noopener noreferrer" className={quiet}>
                {t.footer.complaints}
              </a>
            </li>
          </ul>
        </div>
        <p className="container-page pb-28 text-xs leading-relaxed text-muted-foreground md:pb-8">{t.footer.emergency}</p>
      </div>
    </footer>
  );
}
