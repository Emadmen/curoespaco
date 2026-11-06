export type BookingModeValue = "REQUEST" | "LIVE";

export type AppointmentStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED";

/** ISO weekday: 1 = Monday … 7 = Sunday. Times are "HH:mm" in clinic local time. */
export type OpeningHoursEntry =
  | { day: number; open: string; close: string; closed?: false }
  | { day: number; closed: true; open?: undefined; close?: undefined };

export type TimeRange = { start: string; end: string };

/** Keys are ISO weekdays as strings ("1" … "7"). */
export type WorkingHours = Partial<Record<string, TimeRange[]>>;

export type Socials = {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
};

export interface ClinicInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  mapsUrl?: string | null;
  mapsEmbedUrl?: string | null;
  openingHours: OpeningHoursEntry[];
  socials: Socials;
  bookingMode: BookingModeValue;
  heroTitle: string;
  heroSubtitle: string;
  aboutIntro: string;
  retentionDays: number;
}

export interface PublicService {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  durationMinutes: number;
  professionalIds: string[];
}

export interface PublicProfessional {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  registrationNumber?: string | null;
  expertise: string[];
  imageUrl?: string | null;
  serviceIds: string[];
}

export type GalleryVariant = "room" | "group" | "reception" | "waiting" | "kids";

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  /** Path/URL of a real photograph. When omitted an illustrated placeholder is shown. */
  src?: string;
  variant: GalleryVariant;
}

/**
 * Only add testimonials that are genuine, have documented written consent and
 * whose publication is permitted by the applicable professional/ethical rules.
 */
export interface Testimonial {
  id: string;
  quote: string;
  /** Initials or a pseudonym — never a full name without explicit consent. */
  author: string;
  /** A photograph shown beside the quote, only with that person's consent. */
  photo?: string;
  consentConfirmed: true;
}
