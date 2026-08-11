import type { Metadata } from "next";
// Se descargaban 13 familias (24 archivos woff2 en una sola carga de la home,
// medido en la auditoría 2026-07-25, I6). Salieron 6: Fraunces, Lora y Work Sans
// no estaban referenciadas en ningún archivo, y Syne, Nunito Sans y DM Sans solo
// alimentaban los tokens de los sistemas de diseño dormidos (--font-mar-*,
// --font-ae-*), que tienen cero usos en componentes. Se conservan Cormorant y
// Playfair (sí se usan en Header/Hero/Testimonios/LoQueNoSomos) y Jost, Lato y
// Plus Jakarta, que son el fallback real de los tokens activos.
import { Plus_Jakarta_Sans, Cormorant_Garamond, Jost, Playfair_Display, Lato, Unbounded, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { GinaWidget } from "@/components/gina/GinaWidget";
import { MotionProvider } from "@/components/shared/MotionProvider";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

// preload:false en las tres familias que hoy solo existen como FALLBACK dentro
// de un `font-family` (Plus Jakarta en --font-ui, Jost en --font-dz-display,
// Lato en --font-dz-ui). next/font precarga por defecto todo lo que se declara,
// así que se estaban descargando en cada visita para no usarse nunca — el
// navegador solo baja el primer tipo disponible del stack. Sin preload siguen
// disponibles si la primaria falla, pero dejan de costar red (auditoría
// 2026-07-25, I6).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: false,
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
  preload: false, // solo fallback de --font-dz-display (ver nota arriba)
});

/* Deslumbrante — display geométrica del mockup aprobado (design-drafts/deslumbrante),
   reemplaza a Jost como --font-dz-display (ver app/globals.css). Jost queda cargada como
   fallback del propio token, no se descarga para nadie. */
const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

/* Deslumbrante — UI/cuerpo del mockup aprobado, reemplaza a Lato como --font-dz-ui en toda
   la web (extensión de sesión 2 a Header/Footer/Gina/páginas interiores). Lato queda cargada
   como fallback del propio token — sigue siendo la fuente real de --font-lato para quien lo
   use directo (dormido: Pedra e Ouro). */
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
  preload: false, // solo fallback de --font-dz-ui (ver nota arriba)
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
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') ?? ''
  // Seteado en middleware.ts para toda ruta /admin/* — el panel interno no
  // muestra el header/footer/widget de Gina del sitio público.
  const isAdminRoute = requestHeaders.get('x-admin-route') === '1'
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${cormorant.variable} ${jost.variable} ${playfair.variable} ${lato.variable} ${unbounded.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-dz-ui)]">
        {/* Anti-flash: ejecuta síncrono antes del primer paint. suppressHydrationWarning porque
            el browser elimina el atributo nonce del DOM después de evaluar el script (seguridad),
            lo que causaría un falso mismatch de hidratación. */}
        {/* Además del anti-flash inicial, escucha los cambios de tema del sistema
            operativo: antes el tema se decidía una sola vez al cargar y no
            reaccionaba hasta recargar la página (auditoría 2026-07-25, M3). La
            preferencia guardada se relee dentro del handler, así una elección
            explícita del usuario siempre gana sobre la del sistema.
            OJO: si se edita este texto hay que recalcular su hash SHA-256 en
            middleware.ts o el CSP lo bloquea. */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){var m=window.matchMedia('(prefers-color-scheme: dark)');var a=function(){var s=localStorage.getItem('tlg-theme');document.documentElement.classList.toggle('dark',s?s==='dark':m.matches)};a();m.addEventListener('change',a);})();` }} />
        <MotionProvider>
          <ScrollToTop />
          {!isAdminRoute && <Header />}
          <main id="main-content" className="flex-1">{children}</main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <GinaWidget />}
        </MotionProvider>
      </body>
    </html>
  );
}
