import { testimonials } from "@/config/clinic";
import { getClinic, getProfessionals, getServices } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { ServicesSection } from "@/components/home/services";
import { Steps } from "@/components/home/steps";
import { TeamShowcase } from "@/components/home/team-showcase";
import {
  CtaBand,
  Highlights,
  TestimonialsSection,
} from "@/components/home/sections";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/contact/contact-section";

export default async function HomePage() {
  const [clinic, services, professionals] = await Promise.all([getClinic(), getServices(), getProfessionals()]);
  return (
    <>
      <Hero clinic={clinic} professionals={professionals} />
      <Journey statement={clinic.heroSubtitle} />
      <ServicesSection services={services} />
      <Steps />
      <TestimonialsSection items={testimonials} />
      <TeamShowcase professionals={professionals} />
      <Highlights />
      <FaqSection />
      <CtaBand whatsapp={clinic.whatsapp} />
      <ContactSection clinic={clinic} />
    </>
  );
}
