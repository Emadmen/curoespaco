import type { ReactNode } from "react";
import { t } from "@/content";
import { groupOpeningHours } from "@/lib/hours";
import { formatPhoneDisplay, whatsappMessages } from "@/lib/whatsapp";
import type { ClinicInfo } from "@/types";
import { textLinkVariants } from "@/components/ui/text-link";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { MapEmbed } from "@/components/contact/map-embed";

const quiet = textLinkVariants({ variant: "quiet" });

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 border-t py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
      <h3 className="eyebrow pt-0.5 tracking-normal">{title}</h3>
      <div className="min-w-0 text-[1.0625rem]">{children}</div>
    </div>
  );
}

function ContactRows({ clinic, address }: { clinic: ClinicInfo; address: string }) {
  return (
    <div className="border-b">
      <Item title={t.contact.address}>
        <address className="not-italic">{address}</address>
      </Item>
      <Item title={t.contact.hours}>
        <dl className="space-y-1.5 text-base">
          {groupOpeningHours(clinic.openingHours).map((g) => (
            <div key={g.label} className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{g.label}:</dt>
              <dd className="tabular-nums">{g.value}</dd>
            </div>
          ))}
        </dl>
      </Item>
      <Item title={t.contact.phone}>
        <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className={quiet}>
          {clinic.phone}
        </a>
      </Item>
      <Item title={t.contact.whatsapp}>
        <span>{formatPhoneDisplay(clinic.whatsapp)}</span>
      </Item>
      <Item title={t.contact.email}>
        <a href={`mailto:${clinic.email}`} className={`${quiet} break-all`}>
          {clinic.email}
        </a>
      </Item>
    </div>
  );
}

function formatAddress(clinic: ClinicInfo) {
  return `${clinic.addressLine1}${clinic.addressLine2 ? `, ${clinic.addressLine2}` : ""}, ${clinic.postalCode} ${clinic.city}`;
}

function ContactActions({ clinic }: { clinic: ClinicInfo }) {
  return (
    <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
      <BookLink cta />
      <WhatsAppLink cta number={clinic.whatsapp} message={whatsappMessages.general()} label={t.cta.whatsappLong} />
    </div>
  );
}

/** Contact page: the map beside the details. */
export function ContactDetails({ clinic }: { clinic: ClinicInfo }) {
  const address = formatAddress(clinic);
  return (
    <Reveal className="grid-side items-center">
      <div className="min-h-80 overflow-hidden rounded-xl lg:h-[68svh]">
        <MapEmbed embedUrl={clinic.mapsEmbedUrl} mapsUrl={clinic.mapsUrl} address={address} />
      </div>
      <div>
        <ContactRows clinic={clinic} address={address} />
        <ContactActions clinic={clinic} />
      </div>
    </Reveal>
  );
}

export function ContactSection({ clinic }: { clinic: ClinicInfo }) {
  return (
    <Section id="contactos" aria-labelledby="contact-title">
      <div className="grid-side items-center">
        <div>
          <SectionHeading id="contact-title" stacked eyebrow={t.contact.eyebrow} title={t.contact.title} intro={t.contact.intro} />
          <ContactActions clinic={clinic} />
        </div>
        <Reveal>
          <ContactRows clinic={clinic} address={formatAddress(clinic)} />
        </Reveal>
      </div>
    </Section>
  );
}
