import { testimonials } from "@/config/clinic";
import { getClinic, getProfessionals, getServices } from "@/lib/data";
import { Hero } from "@/components/home/hero";
import { HeroV2 } from "@/components/home/hero-v2";
import { HeroV3 } from "@/components/home/hero-v3";
import { Journey } from "@/components/home/journey";
import { ServicesSection } from "@/components/home/services";
import { ServicesV2 } from "@/components/home/services-v2";
import { Steps } from "@/components/home/steps";
import { TeamShowcase } from "@/components/home/team-showcase";
import { TeamCarouselV2 } from "@/components/home/team-carousel-v2";
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
      {/* TEMPORARY: every hero renders; the template switcher shows one of them. Template 3
          reuses template 1's sections, re-coloured by its tokens in globals.css. */}
      <div className="template-2:hidden template-3:hidden">
        <Hero clinic={clinic} />
      </div>
      <div className="hidden template-2:block">
        <HeroV2 clinic={clinic} />
      </div>
      <div className="hidden template-3:block">
        <HeroV3 clinic={clinic} professionals={professionals} />
      </div>
      <Journey statement={clinic.heroSubtitle} />
      <div className="template-2:hidden">
        <ServicesSection services={services} />
      </div>
      <div className="hidden template-2:block">
        <ServicesV2 services={services} />
      </div>
      <Steps />
      <TestimonialsSection items={testimonials} />
      <div className="template-2:hidden">
        <TeamShowcase professionals={professionals} />
      </div>
      <div className="hidden template-2:block">
        <TeamCarouselV2 clinicName={clinic.name} professionals={professionals} />
      </div>
      <Highlights />
      <FaqSection />
      <CtaBand whatsapp={clinic.whatsapp} />
      <ContactSection clinic={clinic} />
    </>
  );
}
