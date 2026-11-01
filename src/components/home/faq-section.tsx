import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";

export function FaqSection({ whatsapp }: { whatsapp: string }) {
  return (
    <Section id="perguntas-frequentes" aria-labelledby="faq-title">
      <div className="grid-side items-center">
        <div>
          <SectionHeading id="faq-title" stacked eyebrow={t.faq.eyebrow} title={t.faq.title} intro={t.faq.intro} />
          <WhatsAppLink cta number={whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} className="mt-12" />
        </div>
        <Accordion>
          {t.faq.items.map((item, i) => (
            <AccordionItem key={item.q} value={i}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
