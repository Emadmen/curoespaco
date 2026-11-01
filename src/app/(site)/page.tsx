import { galleryImages, testimonials } from "@/config/clinic";
import { getClinic, getProfessionals, getServices } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  CtaBand,
  Highlights,
  HowItWorks,
  ServicesSection,
  SpaceSection,
  Statement,
  TeamSection,
  TestimonialsSection,
} from "@/components/home/sections";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/contact/contact-section";

export default async function HomePage() {
  const [clinic, services, professionals] = await Promise.all([getClinic(), getServices(), getProfessionals()]);
  return (
    <>
      <Hero clinic={clinic} />
      <Statement text={clinic.heroSubtitle} />
      <Highlights />
      <AboutSection clinic={clinic} />
      <ServicesSection services={services} whatsapp={clinic.whatsapp} />
      <HowItWorks whatsapp={clinic.whatsapp} />
      <TeamSection professionals={professionals} whatsapp={clinic.whatsapp} />
      <SpaceSection images={galleryImages} />
      <TestimonialsSection items={testimonials} />
      <FaqSection whatsapp={clinic.whatsapp} />
      <CtaBand whatsapp={clinic.whatsapp} />
      <ContactSection clinic={clinic} />
    </>
  );
}
