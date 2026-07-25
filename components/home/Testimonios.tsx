"use client";

// TODO: reemplazar avatares placeholder con fotos reales

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=VR",
  },
  {
    nombre: "Martín y Lucía Ferreira",
    ciudadOrigen: "Montevideo, Uruguay",
    ciudadGalicia: "A Coruña",
    texto:
      "Llevábamos meses mirando Idealista sin entender nada. Contratamos a Tu Lugar en Galicia y en tres semanas teníamos piso. Nos ahorró meses de angustia. Vale cada euro.",
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=MF",
  },
  {
    nombre: "Diego Castillo",
    ciudadOrigen: "Buenos Aires, Argentina",
    ciudadGalicia: "Santiago de Compostela",
    texto:
      "Lo que más me sorprendió fue que el equipo entendía exactamente lo que estábamos viviendo. No era una agencia fría dando respuestas de manual — era gente que realmente quería que nos instaláramos bien.",
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=DC",
  },
];

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
        <Image src={t.avatar} alt="" width={36} height={36} className="rounded-full flex-shrink-0" />
        <div className="text-left">
          <p
            className="[font-size:var(--text-xs)] font-bold"
            style={{ fontFamily: "var(--font-dz-ui)", color: "var(--dz-ink)" }}
          >
            {t.nombre}
          </p>
          <p
            className="[font-size:0.7rem]"
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

        <div className="mt-[var(--space-5)] flex justify-center gap-[var(--space-2)]">
          {testimonios.map((t, i) => (
            <button
              key={t.nombre}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir al testimonio de ${t.nombre}`}
              aria-current={i === index}
              className="transition-brand rounded-full"
              style={{
                width: 7,
                height: 7,
                backgroundColor: i === index ? "var(--dz-accent)" : "var(--dz-borde)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
