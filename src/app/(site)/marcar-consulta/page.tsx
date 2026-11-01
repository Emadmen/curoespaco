import type { Metadata } from "next";
import { Suspense } from "react";
import { Phone } from "lucide-react";
import { siteConfig } from "@/config/clinic";
import { t } from "@/content";
import { getClinic, getProfessionals, getServices } from "@/lib/data";
import { whatsappMessages } from "@/lib/whatsapp";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: t.booking.pageTitle,
  description: t.booking.pageIntro,
  alternates: { canonical: "/marcar-consulta" },
};

async function Wizard({ searchParams }: { searchParams: PageProps<"/marcar-consulta">["searchParams"] }) {
  const [params, clinic, services, professionals] = await Promise.all([
    searchParams,
    getClinic(),
    getServices(),
    getProfessionals(),
  ]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const service = services.find((s) => s.slug === one(params.servico));
  const professional = professionals.find((p) => p.slug === one(params.profissional));

  return (
    <BookingWizard
      services={services.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        icon: s.icon,
        durationMinutes: s.durationMinutes,
        professionalIds: s.professionalIds,
      }))}
      professionals={professionals.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        title: p.title,
        imageUrl: p.imageUrl,
        serviceIds: p.serviceIds,
      }))}
      whatsapp={clinic.whatsapp}
      openingHours={clinic.openingHours}
      bookingMode={clinic.bookingMode}
      horizonDays={siteConfig.bookingHorizonDays}
      initialServiceId={service?.id}
      initialProfessionalId={professional?.id}
    />
  );
}

function WizardSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-0.5 bg-foreground/10" />
        ))}
      </div>
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-sage-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-sage-100" />
        ))}
      </div>
    </div>
  );
}

export default async function BookingPage(props: PageProps<"/marcar-consulta">) {
  const clinic = await getClinic();
  const reassurance = [
    "Sem criar conta nem palavra-passe",
    "Leva menos de um minuto",
    "Pedimos apenas o essencial para o contactar",
  ];

  return (
    <>
      <PageHero compact eyebrow={t.cta.book} title={t.booking.pageTitle} intro={t.booking.pageIntro} />
      <Section space="md" fill={false} aria-label={t.booking.pageTitle}>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="min-w-0">
            <Suspense fallback={<WizardSkeleton />}>
              <Wizard searchParams={props.searchParams} />
            </Suspense>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="tone-forest rounded-xl bg-background p-6 text-foreground">
              <p className="type-display-sm">{t.booking.whatsappAlternative}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.services.notSureText}</p>
              <div className="mt-5 flex flex-col gap-2.5">
                <WhatsAppLink variant="default" number={clinic.whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
                <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className={buttonVariants({ variant: "outline" })}>
                  <Phone aria-hidden="true" />
                  {clinic.phone}
                </a>
              </div>
            </div>
            <ul className="border-b text-[0.9375rem]">
              {reassurance.map((text) => (
                <li key={text} className="border-t py-3">
                  {text}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
