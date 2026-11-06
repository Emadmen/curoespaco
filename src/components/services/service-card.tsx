import Link from "next/link";
import { t } from "@/content";
import type { PublicService } from "@/types";
import { BookLink } from "@/components/shared/book-link";

/** One service in the ruled list: the name opens its page, the link starts a booking. */
export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <article className="flex items-start justify-between gap-8 border-t py-6">
      <div className="min-w-0">
        <h3 className="type-display-sm">
          <Link href={`/servicos/${service.slug}`} className="underline-offset-4 outline-none hover:underline focus-visible:underline">
            {service.name}
          </Link>
        </h3>
        <p className="text-pretty-p mt-2 leading-relaxed text-muted-foreground">{service.shortDescription}</p>
      </div>
      <BookLink
        quiet
        service={service.slug}
        label={t.cta.bookShort}
        className="mt-1 shrink-0"
        ariaLabel={`${t.cta.book}: ${service.name}`}
      />
    </article>
  );
}
