/**
 * Central clinic configuration.
 *
 * Everything here is PLACEHOLDER content meant to be replaced with the real
 * clinic information. Values editable from the admin area (clinic settings,
 * services, professionals) are stored in the database; the values below are
 * used to seed it and as a safe fallback if the database is unavailable, so
 * the public site — and WhatsApp booking — keep working.
 */
import type {
  ClinicInfo,
  GalleryImage,
  PublicProfessional,
  PublicService,
  Testimonial,
} from "@/types";

export const siteConfig = {
  locale: "pt-PT",
  /** All dates/times shown and validated in the clinic's local time. */
  timeZone: "Europe/Lisbon",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** How far ahead visitors may request appointments. */
  bookingHorizonDays: 90,
  /** Bump when the booking consent text changes; stored with each request. */
  consentVersion: "2026-10-v1",
  /** Official complaints book (mandatory link for businesses in Portugal). */
  complaintsBookUrl: "https://www.livroreclamacoes.pt/",
} as const;

export const defaultClinic: ClinicInfo = {
  name: "Cora Psicologia",
  tagline: "Psicologia & Bem-Estar",
  phone: "+351 210 000 000",
  whatsapp: "351910000000",
  email: "ola@exemplo.pt",
  addressLine1: "Rua do Exemplo, 123, 1.º Esq.",
  addressLine2: null,
  postalCode: "1000-000",
  city: "Lisboa",
  country: "PT",
  mapsUrl: "https://maps.google.com/?q=Lisboa",
  mapsEmbedUrl: null,
  openingHours: [
    { day: 1, open: "09:00", close: "20:00" },
    { day: 2, open: "09:00", close: "20:00" },
    { day: 3, open: "09:00", close: "20:00" },
    { day: 4, open: "09:00", close: "20:00" },
    { day: 5, open: "09:00", close: "19:00" },
    { day: 6, open: "09:00", close: "13:00" },
    { day: 7, closed: true },
  ],
  socials: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
  bookingMode: "REQUEST",
  heroTitle: "Um espaço para cuidar de si, ao seu ritmo.",
  heroSubtitle:
    "Acompanhamento psicológico num ambiente acolhedor, seguro e pensado para o seu bem-estar.",
  aboutIntro:
    "Somos uma equipa de psicologia que acredita que pedir ajuda é um gesto de coragem. Criámos um espaço tranquilo, onde cada pessoa é escutada sem pressa e sem julgamentos, e onde o acompanhamento é construído à sua medida.",
  retentionDays: 365,
};

/** Sample services — not claims about a real clinic. Toggle them in /admin/servicos. */
export const defaultServices: PublicService[] = [
  {
    id: "svc-individual",
    slug: "psicologia-individual",
    name: "Psicologia Individual",
    shortDescription:
      "Um espaço só seu para compreender o que sente, ganhar clareza e encontrar novos caminhos.",
    description:
      "As consultas individuais são um espaço confidencial para falar sobre o que o preocupa, ao seu ritmo. Em conjunto, procuramos compreender o que está a viver e construir estratégias que façam sentido para si e para a sua vida.\n\nO acompanhamento é ajustado a cada pessoa: a frequência e os objetivos são definidos em conjunto e revistos ao longo do processo.",
    icon: "user",
    durationMinutes: 50,
    professionalIds: ["pro-marta", "pro-rui"],
  },
  {
    id: "svc-infantil",
    slug: "psicologia-infantil",
    name: "Psicologia Infantil",
    shortDescription:
      "Acompanhamento pensado para crianças, com espaço para brincar, expressar e crescer.",
    description:
      "Com as crianças, o brincar é muitas vezes a forma mais natural de comunicar. As consultas usam recursos adequados a cada idade e incluem momentos com os pais ou cuidadores, para que todos possam acompanhar o processo.\n\nNa primeira consulta conversamos com a família para perceber o que a traz até nós e definir os próximos passos.",
    icon: "blocks",
    durationMinutes: 50,
    professionalIds: ["pro-ines"],
  },
  {
    id: "svc-adolescentes",
    slug: "psicologia-adolescentes",
    name: "Psicologia para Adolescentes",
    shortDescription:
      "Um lugar de confiança para os desafios e as descobertas da adolescência.",
    description:
      "A adolescência traz mudanças intensas. Oferecemos um espaço onde o adolescente se pode sentir ouvido e respeitado, com a confidencialidade adequada à sua idade, e onde a família é envolvida quando faz sentido.",
    icon: "sprout",
    durationMinutes: 50,
    professionalIds: ["pro-ines", "pro-marta"],
  },
  {
    id: "svc-casal",
    slug: "terapia-de-casal",
    name: "Terapia de Casal",
    shortDescription:
      "Para reencontrar a comunicação, compreender padrões e cuidar da relação a dois.",
    description:
      "A terapia de casal ajuda a criar um espaço seguro para que ambos se possam ouvir. Trabalhamos a comunicação, a gestão de conflitos e aquilo que cada um precisa para que a relação se sinta mais próxima.",
    icon: "heart-handshake",
    durationMinutes: 60,
    professionalIds: ["pro-rui"],
  },
  {
    id: "svc-familiar",
    slug: "terapia-familiar",
    name: "Terapia Familiar",
    shortDescription:
      "Apoio para fases de mudança, conflitos ou desafios que envolvem toda a família.",
    description:
      "Cada família tem a sua história e a sua forma de funcionar. Nas sessões familiares procuramos melhorar a comunicação e encontrar, em conjunto, formas mais tranquilas de lidar com as dificuldades.",
    icon: "home",
    durationMinutes: 60,
    professionalIds: ["pro-rui", "pro-ines"],
  },
  {
    id: "svc-grupo",
    slug: "terapia-de-grupo",
    name: "Terapia de Grupo",
    shortDescription:
      "Partilhar e aprender com outras pessoas num grupo pequeno e acompanhado.",
    description:
      "Os grupos terapêuticos reúnem um número reduzido de participantes, com um tema comum e um acompanhamento próximo. Partilhar experiências num ambiente seguro pode ser uma fonte importante de apoio.",
    icon: "users",
    durationMinutes: 90,
    professionalIds: ["pro-marta"],
  },
  {
    id: "svc-avaliacao",
    slug: "avaliacao-psicologica",
    name: "Avaliação Psicológica",
    shortDescription:
      "Uma avaliação cuidada para compreender melhor e orientar os próximos passos.",
    description:
      "A avaliação psicológica é feita através de entrevistas e instrumentos adequados a cada situação. No final, os resultados são explicados com tempo e clareza, juntamente com as recomendações que daí resultam.",
    icon: "clipboard",
    durationMinutes: 60,
    professionalIds: ["pro-ines", "pro-marta"],
  },
];

/**
 * The team. Ana Carol and Talita Ramos are real; their titles, bios and registration
 * numbers, and Rui Exemplo entirely, are placeholders to replace with verified information.
 */
export const defaultProfessionals: PublicProfessional[] = [
  {
    id: "pro-marta",
    slug: "ana-carol",
    name: "Ana Carol",
    title: "Psicóloga Clínica",
    bio: "Texto de apresentação de exemplo. Aqui pode descrever, numa linguagem próxima, a forma como acompanha as pessoas e o que valoriza na relação terapêutica.",
    registrationNumber: "OPP n.º 00000 (exemplo)",
    expertise: ["Adultos", "Adolescentes", "Grupos"],
    imageUrl: "/images/team/ana-carol.jpg",
    serviceIds: ["svc-individual", "svc-adolescentes", "svc-grupo", "svc-avaliacao"],
  },
  {
    id: "pro-rui",
    slug: "rui-exemplo",
    name: "Rui Exemplo",
    title: "Psicólogo · Terapia de Casal e Família",
    bio: "Texto de apresentação de exemplo. Substitua por uma breve biografia real, com a abordagem de trabalho e os contextos em que acompanha casais e famílias.",
    registrationNumber: "OPP n.º 00000 (exemplo)",
    expertise: ["Casais", "Famílias", "Adultos"],
    imageUrl: null,
    serviceIds: ["svc-individual", "svc-casal", "svc-familiar"],
  },
  {
    id: "pro-ines",
    slug: "talita-ramos",
    name: "Talita Ramos",
    title: "Psicóloga · Infância e Adolescência",
    bio: "Texto de apresentação de exemplo. Use este espaço para apresentar o trabalho com crianças, adolescentes e famílias, de forma simples e acolhedora.",
    registrationNumber: "OPP n.º 00000 (exemplo)",
    expertise: ["Crianças", "Adolescentes", "Pais"],
    imageUrl: "/images/team/talita-ramos.jpg",
    serviceIds: ["svc-infantil", "svc-adolescentes", "svc-familiar", "svc-avaliacao"],
  },
];

/** Replace `src` with real photographs (e.g. /images/espaco/sala-1.jpg) when available. */
export const galleryImages: GalleryImage[] = [
  {
    id: "sala-1",
    title: "Sala de consulta",
    description: "Um espaço calmo e reservado, com luz natural e conforto.",
    variant: "room",
  },
  {
    id: "grupo",
    title: "Sala de grupo",
    description: "Pensada para sessões de grupo e de família.",
    variant: "group",
  },
  {
    id: "rececao",
    title: "Receção",
    description: "Recebemo-lo com tempo e sem pressas.",
    variant: "reception",
  },
  {
    id: "espera",
    title: "Zona de espera",
    description: "Um lugar confortável para aguardar a sua consulta.",
    variant: "waiting",
  },
  {
    id: "sala-infantil",
    title: "Sala para crianças",
    description: "Materiais e cores pensados para os mais pequenos.",
    variant: "kids",
  },
];

/**
 * Leave empty unless you have genuine testimonials with documented consent and
 * publication is appropriate under applicable professional rules. The section
 * is not rendered while this list is empty.
 */
export const testimonials: Testimonial[] = [];
