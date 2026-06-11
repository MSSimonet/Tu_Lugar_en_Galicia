import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { GinaWidget } from "@/components/gina/GinaWidget";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tulugarengalicia.com'),
  title: {
    template: '%s | Tu Lugar en Galicia',
    default: 'Tu Lugar en Galicia',
  },
  description: 'El primer servicio de relocation especializado en Galicia para familias latinoamericanas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <GinaWidget />
      </body>
    </html>
  );
}
