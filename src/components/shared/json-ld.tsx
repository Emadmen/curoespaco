import { siteConfig } from "@/config/clinic";
import { openingHoursSpecification } from "@/lib/hours";
import type { ClinicInfo } from "@/types";

/** LocalBusiness structured data built only from configured, factual clinic information. */
export function ClinicJsonLd({ clinic }: { clinic: ClinicInfo }) {
  const sameAs = Object.values(clinic.socials).filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinic.name,
    url: siteConfig.url,
    telephone: clinic.phone,
    email: clinic.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: [clinic.addressLine1, clinic.addressLine2].filter(Boolean).join(", "),
      postalCode: clinic.postalCode,
      addressLocality: clinic.city,
      addressCountry: clinic.country,
    },
    openingHoursSpecification: openingHoursSpecification(clinic.openingHours),
    ...(clinic.mapsUrl ? { hasMap: clinic.mapsUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
