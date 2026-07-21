"use client";

// TODO: reemplazar avatares placeholder con fotos reales

import Image from "next/image";
import { motion } from "motion/react";
import { staggerContainer, fadeUp, cardHover } from "@/lib/motion/variants";

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

function TarjetaTestimonio({ t, destacar }: { t: (typeof testimonios)[number]; destacar?: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      {...cardHover}
      className={destacar ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : undefined}
      style={{
        borderRadius: 'var(--dz-radius-card)',
        backgroundColor: 'var(--dz-luz)',
        border: '1px solid var(--dz-borde)',
        boxShadow: 'var(--dz-shadow-sm)',
        padding: 'var(--space-6)',
      }}
    >
      <blockquote>
        <p
          className="[font-size:var(--text-sm)] italic leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 500, color: 'var(--dz-ink)' }}
        >
          &ldquo;{t.texto}&rdquo;
        </p>
      </blockquote>

      <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-3)]">
        <Image
          src={t.avatar}
          alt=""
          width={36}
          height={36}
          className="rounded-full flex-shrink-0"
        />
        <div className="text-left">
          <p
            className="[font-size:var(--text-xs)] font-bold"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
          >
            {t.nombre}
          </p>
          <p
            className="[font-size:0.7rem]"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            {t.ciudadOrigen} → {t.ciudadGalicia}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonios() {
  return (
    <section
      id="testimonios"
      className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--dz-papel)' }}
      aria-labelledby="testimonios-heading"
    >
      <div className="mx-auto max-w-3xl">
        {/* Eyebrow como <p> y título visual como <h2> (auditoría 2026-07-19, A2.1) */}
        <p
          className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-muted)' }}
        >
          Lo que dicen las familias
        </p>
        <h2
          id="testimonios-heading"
          className="mb-[var(--space-8)] text-center [font-size:var(--text-xl)] md:[font-size:var(--text-2xl)]"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
        >
          Testimonios
        </h2>

        <motion.div
          className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonios.map((t, i) => (
            <TarjetaTestimonio key={t.nombre} t={t} destacar={i === testimonios.length - 1 && testimonios.length % 2 === 1} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
