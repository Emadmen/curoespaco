import { t } from "@/content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LogoMark } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SplitTitle } from "@/components/shared/split-text";

export function FaqSection() {
  return (
    <Section id="perguntas-frequentes" aria-labelledby="faq-title">
      <div className="grid-side items-start">
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <p className="eyebrow">
              <LogoMark className="h-2" />
              {t.faq.eyebrow}
            </p>
          </Reveal>
          <SplitTitle id="faq-title" className="mt-5 type-display-md font-light">
            {t.faq.title}
          </SplitTitle>
        </div>
        <Reveal delay={0.15}>
          <Accordion defaultValue={[0]} className="gap-2">
            {t.faq.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={i}
                className="rounded-lg border border-foreground/6 bg-card transition-colors duration-500 data-open:border-transparent data-open:bg-primary data-open:text-primary-foreground"
              >
                <AccordionTrigger className="items-center rounded-lg px-5 py-4 text-base! font-normal! tracking-normal!">{item.q}</AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-sm text-primary-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}
