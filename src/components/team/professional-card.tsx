import Link from "next/link";
import { t } from "@/content";
import { whatsappMessages } from "@/lib/whatsapp";
import type { PublicProfessional } from "@/types";
import { BookLink } from "@/components/shared/book-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Portrait } from "@/components/team/portrait";

export function ProfessionalCard({
  professional,
  whatsapp,
  index = 0,
}: {
  professional: PublicProfessional;
  whatsapp: string;
  index?: number;
}) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/equipa/${professional.slug}`} className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Portrait name={professional.name} imageUrl={professional.imageUrl} index={index} />
      </Link>
      <h3 className="mt-6 type-display-sm">
        <Link href={`/equipa/${professional.slug}`} className="underline-offset-4 hover:underline">
          {professional.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{professional.title}</p>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        <BookLink
          quiet
          professional={professional.slug}
          label={t.cta.bookShort}
          ariaLabel={`${t.cta.bookWithProfessional}: ${professional.name}`}
        />
        <WhatsAppLink quiet number={whatsapp} message={whatsappMessages.therapist(professional.name)} />
      </div>
    </article>
  );
}
