import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Cormorant_Garamond, Mulish, Space_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { GinaWidget } from "@/components/gina/GinaWidget";
import { ContactoFlotante } from "@/components/shared/ContactoFlotante";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mulish",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
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
      className={`${fraunces.variable} ${plusJakarta.variable} ${cormorant.variable} ${mulish.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        {/* Anti-flash: primer elemento del body, ejecuta síncrono antes del primer paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){const s=localStorage.getItem('tlg-theme');const p=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',s?s==='dark':p);})();` }} />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <GinaWidget />
        <ContactoFlotante />
      </body>
    </html>
  );
}
