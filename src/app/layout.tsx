import type { Metadata, Viewport } from "next";
import { Libre_Franklin } from "next/font/google";
import { siteConfig } from "@/config/clinic";
import { getClinic } from "@/lib/data";
import "./globals.css";

const sans = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin", "latin-ext"],
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
  themeColor: "#b2c1ba",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
