import type { Metadata } from "next";
import { t } from "@/content";
import { getClinic } from "@/lib/data";
import { ContactDetails } from "@/components/contact/contact-section";
import { FaqSection } from "@/components/home/faq-section";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";

export const metadata: Metadata = {
  title: t.nav.contact,
  description: t.contact.intro,
  alternates: { canonical: "/contactos" },
};

export default async function ContactPage() {
  const clinic = await getClinic();
  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.title} intro={t.contact.intro} />
      <Section id="contactos" aria-label={t.nav.contact}>
        <ContactDetails clinic={clinic} />
      </Section>
      <FaqSection whatsapp={clinic.whatsapp} />
    </>
  );
}
