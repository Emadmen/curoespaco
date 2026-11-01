import type { Metadata } from "next";
import { t } from "@/content";
import { getClinic, getServices } from "@/lib/data";
import { PageHero } from "@/components/shared/page-hero";
import { CtaBand, HowItWorks, ServicesPanel } from "@/components/home/sections";

export const metadata: Metadata = {
  title: t.nav.services,
  description: t.services.intro,
  alternates: { canonical: "/servicos" },
};

export default async function ServicesPage() {
  const [clinic, services] = await Promise.all([getClinic(), getServices()]);
  return (
    <>
      <PageHero eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro} />
      <ServicesPanel services={services} whatsapp={clinic.whatsapp} />
      <HowItWorks whatsapp={clinic.whatsapp} />
      <CtaBand whatsapp={clinic.whatsapp} />
    </>
  );
}
