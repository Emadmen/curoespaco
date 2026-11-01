import type { Metadata } from "next";
import { t } from "@/content";
import { getClinic, getProfessionals } from "@/lib/data";
import { whatsappMessages } from "@/lib/whatsapp";
import { PageHero } from "@/components/shared/page-hero";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { CtaBand, HowItWorks, PillarsSection, TeamSection } from "@/components/home/sections";

export const metadata: Metadata = {
  title: t.nav.about,
  description: t.about.philosophy,
  alternates: { canonical: "/sobre" },
};

export default async function AboutPage() {
  const [clinic, professionals] = await Promise.all([getClinic(), getProfessionals()]);
  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} intro={clinic.aboutIntro}>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <BookLink cta />
          <WhatsAppLink cta number={clinic.whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
        </div>
      </PageHero>
      <PillarsSection />
      <HowItWorks whatsapp={clinic.whatsapp} />
      <TeamSection professionals={professionals} whatsapp={clinic.whatsapp} />
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
