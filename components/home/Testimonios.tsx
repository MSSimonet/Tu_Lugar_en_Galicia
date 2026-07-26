"use client";

// PENDIENTE DE CONTENIDO: los tres testimonios muestran un monograma con las
// iniciales, no una foto real. Antes apuntaban a `placehold.co`, un servicio
// externo que en la auditoría 2026-07-25 (C3) devolvía `naturalWidth: 0` — es
// decir, se veían como imagen ROTA en la home, el peor resultado posible en la
// sección de prueba social. El monograma local no depende de red, no puede
// romperse y se lee como una decisión de diseño. Reemplazar por fotos reales
// cuando estén disponibles.

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

const testimonios = [
  {
    nombre: "Valentina Rojas",
    ciudadOrigen: "Bogotá, Colombia",
    ciudadGalicia: "Vigo",
    texto:
      "Yo no creía que fuera posible alquilar sin estar presente. El equipo nos mandó videos de los departamentos, nos explicó el barrio, habló con el propietario y cuando llegamos con las valijas, las llaves ya nos esperaban.",
  },
  {
    nombre: "Martín y Lucía Ferreira",
    ciudadOrigen: "Montevideo, Uruguay",
    ciudadGalicia: "A Coruña",
    texto:
      "Llevábamos meses mirando Idealista sin entender nada. Contratamos a Tu Lugar en Galicia y en tres semanas teníamos piso. Nos ahorró meses de angustia. Vale cada euro.",
  },
  {
    nombre: "Diego Castillo",
    ciudadOrigen: "Buenos Aires, Argentina",
    ciudadGalicia: "Santiago de Compostela",
    texto:
      "Lo que más me sorprendió fue que el equipo entendía exactamente lo que estábamos viviendo. No era una agencia fría dando respuestas de manual — era gente que realmente quería que nos instaláramos bien.",
  },
];

// Iniciales a partir del nombre ("Martín y Lucía Ferreira" → "MF"): la conjunción
// se descarta para que un testimonio de pareja no quede como "MYL".
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter((p) => p.length > 1 && p.toLowerCase() !== "y")
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

const AUTOPLAY_MS = 5000;

function TarjetaTestimonio({ t }: { t: (typeof testimonios)[number] }) {
  return (
    <div
      style={{
        borderRadius: "var(--dz-radius-card)",
        backgroundColor: "var(--dz-luz)",
        border: "1px solid var(--dz-borde)",
        boxShadow: "var(--dz-shadow-sm)",
        padding: "var(--space-6)",
      }}
    >
      <blockquote>
        <p
          className="[font-size:var(--text-sm)] italic leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: "var(--font-playfair)", fontWeight: 500, color: "var(--dz-ink)" }}
        >
          &ldquo;{t.texto}&rdquo;
        </p>
      </blockquote>

      <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-3)]">
        <span
          aria-hidden="true"
          className="flex flex-shrink-0 items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "var(--dz-borde)",
            color: "var(--dz-accent-text)",
            fontFamily: "var(--font-dz-display)",
            fontWeight: "var(--dz-weight-h3)",
            // 12px, no 0.72rem (11,5px) — minimo legible. Entra sin problema en
            // el circulo de 36px (auditoria responsive 2026-07-26).
            fontSize: "12px",
            letterSpacing: "0.02em",
          }}
        >
          {iniciales(t.nombre)}
        </span>
        <div className="text-left">
          <p
            className="[font-size:var(--text-xs)] font-bold"
            style={{ fontFamily: "var(--font-dz-ui)", color: "var(--dz-ink)" }}
          >
            {t.nombre}
          </p>
          {/* 12px, no 0.7rem (11,2px) — minimo legible (auditoria responsive 2026-07-26) */}
          <p
            className="[font-size:12px]"
            style={{ fontFamily: "var(--font-dz-ui)", color: "var(--dz-muted)" }}
          >
            {t.ciudadOrigen} → {t.ciudadGalicia}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonios() {
  const [index, setIndex] = useState(0);
  const [pausado, setPausado] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Autoplay cada 5s, se reinicia en cada cambio de índice (manual o automático) y se
  // pausa con el mouse encima. Sin autoplay si el usuario pide menos movimiento.
  useEffect(() => {
    if (pausado || prefersReducedMotion) return;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % testimonios.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, pausado, prefersReducedMotion]);

  // Fade-in de toda la sección al entrar en viewport (GSAP ScrollTrigger, una sola vez).
  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  function anterior() {
    setIndex((i) => (i - 1 + testimonios.length) % testimonios.length);
  }
  function siguiente() {
    setIndex((i) => (i + 1) % testimonios.length);
  }

  const actual = testimonios[index];

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="px-[var(--space-6)] py-[var(--dz-section-y)]"
      style={{ backgroundColor: "var(--dz-papel)" }}
      aria-labelledby="testimonios-heading"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="mx-auto max-w-2xl">
        <p
          className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ fontFamily: "var(--font-dz-ui)", fontWeight: 700, color: "var(--dz-muted)" }}
        >
          Lo que dicen las familias
        </p>
        <h2
          id="testimonios-heading"
          className="mb-[var(--space-8)] text-center"
          style={{ fontFamily: "var(--font-dz-display)", fontWeight: "var(--dz-weight-h2)", color: "var(--dz-ink)", fontSize: "var(--dz-text-h2)", lineHeight: "var(--dz-leading-h2)" }}
        >
          Testimonios
        </h2>

        <div className="flex items-center gap-[var(--space-3)]">
          <button
            type="button"
            onClick={anterior}
            aria-label="Testimonio anterior"
            className="transition-brand flex shrink-0 items-center justify-center rounded-full hover:[color:var(--dz-accent-text)]"
            style={{ width: 36, height: 36, color: "var(--dz-muted)" }}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={actual.nombre}
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, transition: { duration: 0.3 } }}
              >
                <TarjetaTestimonio t={actual} />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={siguiente}
            aria-label="Testimonio siguiente"
            className="transition-brand flex shrink-0 items-center justify-center rounded-full hover:[color:var(--dz-accent-text)]"
            style={{ width: 36, height: 36, color: "var(--dz-muted)" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* El punto sigue midiendo 7px, pero el área clicleable pasa a 24×24 — el
            mínimo de WCAG 2.2 (2.5.8 Target Size). Antes el botón entero medía
            7×7px y era casi imposible de acertar en móvil (auditoría 2026-07-25,
            I7). El indicador visual va en un <span> interno para no engordar el
            punto. */}
        <div className="mt-[var(--space-5)] flex justify-center">
          {testimonios.map((t, i) => (
            <button
              key={t.nombre}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir al testimonio de ${t.nombre}`}
              aria-current={i === index}
              className="flex items-center justify-center"
              style={{ width: 24, height: 24, background: "none", border: 0, padding: 0, cursor: "pointer" }}
            >
              <span
                aria-hidden="true"
                className="transition-brand rounded-full"
                style={{
                  display: "block",
                  width: 7,
                  height: 7,
                  backgroundColor: i === index ? "var(--dz-accent)" : "var(--dz-borde)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
