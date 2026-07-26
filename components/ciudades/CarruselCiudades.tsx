"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { CIUDADES, type Ciudad } from "@/lib/ciudades/data";
import { useSlideInCards } from "@/lib/gsap/useSlideInCards";

// Carrusel de ciudades compartido — antes existían dos implementaciones distintas
// (CiudadesDestacadas.tsx en Home con scroll pineado + tarjetas con video en hover,
// CiudadesGrid.tsx en /ciudades con grid estático + fadeUp). Se unifican en un solo
// componente parametrizable por `variant`; ambas páginas muestran las 5 ciudades reales
// (ninguna es un subconjunto — "preview" vs "listado" es solo diferencia de encabezado
// y contexto de página, no de contenido).
//
// Grid en vez de scroll lateral (sesión 2026-07-19): el pin/scroll horizontal con GSAP
// generaba reportes de "scroll errático" y obligaba a hacer scroll lateral para ver las
// 5 ciudades. Ahora es un grid responsivo (2/3/5 columnas) — las 5 tarjetas se ven
// completas sin scroll, y la animación de entrada es un fadeUp escalonado al hacer
// scroll hasta la sección (whileInView), no un scroll pineado.

// El nivel del titular de la tarjeta depende de la variante: en "preview" (Home)
// hay un <h2> de sección encima, así que la ciudad es <h3>; en "listado"
// (/ciudades) no existe ese <h2> y el <h3> colgaba directo del <h1> de la
// página — único salto de jerarquía del sitio (auditoría 2026-07-25, I5).
function CiudadCard({ ciudad, headingLevel }: { ciudad: Ciudad; headingLevel: "h2" | "h3" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const Heading = headingLevel;

  const reproducir = () => {
    if (prefersReducedMotion) return;
    videoRef.current?.play().catch(() => {});
  };
  const detener = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <Link
      href={`/ciudades/${ciudad.slug}`}
      className="group relative block aspect-[3/4] w-full overflow-hidden transition-brand hover:-translate-y-1"
      style={{ borderRadius: "var(--dz-radius-card)", boxShadow: "var(--dz-shadow-md)" }}
      onMouseEnter={reproducir}
      onMouseLeave={detener}
      onFocus={reproducir}
      onBlur={detener}
    >
      <Image
        src={ciudad.imagen}
        alt=""
        fill
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover"
      />
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          src={ciudad.video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(10,9,6,.85) 0%, transparent 55%)" }}
      />
      {!prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "#fff" }}
        >
          <Play size={13} fill="currentColor" strokeWidth={0} />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {/* clamp: a 1.5rem fijo, "Santiago de Compostela" envolvía a 3 líneas en las
            tarjetas de 208px del grid de 5 columnas y tapaba el 53% de la foto
            (auditoría 2026-07-19) */}
        <Heading
          style={{
            fontFamily: "var(--font-dz-display)",
            fontWeight: "var(--dz-weight-h3)",
            fontSize: "var(--dz-text-h3)",
            color: "#F3EFE4",
            margin: 0,
          }}
        >
          {ciudad.nombre}
        </Heading>
        <p
          style={{
            fontFamily: "var(--font-dz-ui)",
            fontWeight: 400,
            fontSize: "0.78rem",
            lineHeight: 1.4,
            color: "rgba(243,239,228,0.82)",
            margin: "0.3rem 0 0",
          }}
        >
          {ciudad.tag}
        </p>
      </div>
    </Link>
  );
}

export interface CarruselCiudadesProps {
  /** "preview": vive dentro de otra página (Home) y muestra su propio encabezado corto.
   *  "listado": es el contenido principal de /ciudades, que ya tiene su propio hero arriba
   *  — no repite encabezado. Ambas variantes muestran las 5 ciudades reales, sin recortar. */
  variant: "preview" | "listado";
}

export function CarruselCiudades({ variant }: CarruselCiudadesProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useSlideInCards(gridRef, ".ciudad-card", !!prefersReducedMotion);

  return (
    <section
      style={{ backgroundColor: "var(--dz-papel)" }}
      aria-labelledby={variant === "preview" ? "ciudades-carrusel-heading" : undefined}
    >
      {variant === "preview" && (
        <div className="mx-auto max-w-6xl px-[var(--space-6)] pb-[var(--space-8)] pt-[var(--space-16)] md:pt-[var(--space-24)]">
          <p
            className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
            style={{ fontFamily: "var(--font-dz-ui)", fontWeight: 700, color: "var(--dz-muted)" }}
          >
            Cinco ciudades activas
          </p>
          <h2
            id="ciudades-carrusel-heading"
            className="text-center"
            style={{ fontFamily: "var(--font-dz-display)", fontWeight: "var(--dz-weight-h2)", color: "var(--dz-ink)", fontSize: "var(--dz-text-h2)", lineHeight: "var(--dz-leading-h2)" }}
          >
            Pasa el cursor sobre cada ciudad — cobra vida.
          </h2>
        </div>
      )}

      <div
        ref={gridRef}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-[var(--space-4)] px-[var(--space-6)] pb-[var(--space-16)] sm:grid-cols-3 lg:grid-cols-5"
        style={variant === "listado" ? { paddingTop: "var(--space-16)" } : undefined}
      >
        {CIUDADES.map((ciudad) => (
          <div key={ciudad.slug} className="ciudad-card">
            {/* headingLevel: ver comentario en CiudadCard */}
            <CiudadCard ciudad={ciudad} headingLevel={variant === "listado" ? "h2" : "h3"} />
          </div>
        ))}
      </div>
    </section>
  );
}
