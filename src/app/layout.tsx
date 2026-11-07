import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter_Tight } from "next/font/google";
import { siteConfig } from "@/config/clinic";
import { getClinic } from "@/lib/data";
import { DEFAULT_TEMPLATE, templateScript } from "@/lib/template";
import "./globals.css";

const sans = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

/** TEMPORARY: template 3's display face, a narrow grotesque for its headings. */
const condensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const clinic = await getClinic();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${clinic.name} · ${clinic.tagline}`, template: `%s · ${clinic.name}` },
    description: clinic.heroSubtitle,
    applicationName: clinic.name,
    openGraph: {
      type: "website",
      locale: "pt_PT",
      siteName: clinic.name,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#1a100b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${sans.variable} ${condensed.variable} h-full`} data-template={DEFAULT_TEMPLATE} suppressHydrationWarning>
      <head>
        {/* TEMPORARY: applies the chosen UI template before the page paints. */}
        <script dangerouslySetInnerHTML={{ __html: templateScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
