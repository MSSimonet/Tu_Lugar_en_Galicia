import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond, Syne, Nunito_Sans, Fraunces, DM_Sans, Jost, Playfair_Display, Lato } from "next/font/google";
import { headers } from "next/headers";
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

/* Atlántico Editorial — tipografías (rama design/exploration) */
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-jost",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-dmsans",
  display: "swap",
});

/* Pedra e Ouro — tipografías (rama design/exploration) */
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

/* Mar Abierto — tipografías (rama design/exploration) */
const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-syne",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-nunito",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${cormorant.variable} ${syne.variable} ${nunitoSans.variable} ${fraunces.variable} ${dmSans.variable} ${jost.variable} ${playfair.variable} ${lato.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-ui)]">
        {/* Anti-flash: ejecuta síncrono antes del primer paint. suppressHydrationWarning porque
            el browser elimina el atributo nonce del DOM después de evaluar el script (seguridad),
            lo que causaría un falso mismatch de hidratación. */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){const s=localStorage.getItem('tlg-theme');const p=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',s?s==='dark':p);})();` }} />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <GinaWidget />
      </body>
    </html>
  );
}
