import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { GinaWidget } from "@/components/gina/GinaWidget";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${plusJakarta.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        {/* Anti-flash: primer elemento del body, ejecuta síncrono antes del primer paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){const s=localStorage.getItem('tlg-theme');const p=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',s?s==='dark':p);})();` }} />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <GinaWidget />
      </body>
    </html>
  );
}
