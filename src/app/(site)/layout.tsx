import { t } from "@/content";
import { getClinic } from "@/lib/data";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ClinicJsonLd } from "@/components/shared/json-ld";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const clinic = await getClinic();
  return (
    <>
      <SmoothScroll />
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t.nav.skipToContent}
      </a>
      <SiteHeader name={clinic.name} whatsapp={clinic.whatsapp} phone={clinic.phone} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter clinic={clinic} />
      <FloatingActions whatsapp={clinic.whatsapp} />
      <ClinicJsonLd clinic={clinic} />
    </>
  );
}
