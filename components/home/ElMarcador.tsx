"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { staggerContainer, fadeUp } from "@/lib/motion/variants";

interface MarcadorData {
  anunciosContactados: number;
  propietariosDijeronNo: number;
  familiasUbicadas: number;
  tiempoMedioSemanas: number;
}

const FALLBACK: MarcadorData = {
  anunciosContactados: 0,
  propietariosDijeronNo: 0,
  familiasUbicadas: 0,
  tiempoMedioSemanas: 0,
};

// Trayectoria — cifras fijas (antes vivían superpuestas al video del hero)
const cifrasEstaticas: { valor: string; etiqueta: string }[] = [
  { valor: "+200", etiqueta: "Familias" },
  { valor: "57", etiqueta: "En 2025" },
  { valor: "4", etiqueta: "Años" },
];

// En tiempo real — vía /api/marcador (Google Sheets)
const cifrasDinamicas: { key: keyof MarcadorData; etiqueta: string; unidad?: string }[] =
  [
    { key: "anunciosContactados", etiqueta: "Anuncios contactados" },
    { key: "propietariosDijeronNo", etiqueta: "Propietarios que dijeron no" },
    { key: "familiasUbicadas", etiqueta: "Familias ubicadas este mes" },
    { key: "tiempoMedioSemanas", etiqueta: "Semanas de tiempo medio", unidad: "sem" },
  ];

// --color-sobre-laton (#fff, fijo) en vez de --color-blanco (invierte en dark): --po-terra
// tampoco invierte, así que el texto necesita un token igual de fijo para mantener contraste.
const numberStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-playfair)',
  fontWeight: 700,
  fontSize: '32px',
  lineHeight: 1,
  color: 'var(--color-sobre-laton)',
};

const labelStyle: React.CSSProperties = {
  marginTop: '6px',
  display: 'block',
  fontFamily: 'var(--font-lato)',
  fontSize: '9px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-sobre-laton)',
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  borderRadius: 'var(--po-radius-card)',
  background: 'rgba(255,255,255,0.12)',
  padding: '18px 10px',
};

export function ElMarcador() {
  const [data, setData] = useState<MarcadorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marcador")
      .then((res) => res.json())
      .then((json: MarcadorData) => setData(json))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const display = data ?? FALLBACK;
  const todasLasCifras = [
    ...cifrasEstaticas.map((c) => ({ tipo: 'estatica' as const, ...c })),
    ...cifrasDinamicas.map((c) => ({ tipo: 'dinamica' as const, ...c })),
  ];

  return (
    <>
      <style>{`
        .marcador-section { padding: 32px 40px; }
        .marcador-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) {
          .marcador-grid {
            grid-template-columns: none;
            grid-auto-flow: column;
            grid-auto-columns: minmax(130px, 1fr);
            overflow-x: auto;
            padding-bottom: 4px;
          }
        }
        @media (max-width: 640px) {
          .marcador-section { padding: 24px 20px; }
        }
      `}</style>
      <section
        className="marcador-section"
        style={{ backgroundColor: 'var(--po-terra)' }}
        aria-label="El marcador — cifras de trayectoria y en tiempo real"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            style={{
              marginBottom: '6px',
              textAlign: 'center',
              fontFamily: 'var(--font-lato)',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-sobre-laton)',
            }}
          >
            En tiempo real
          </h2>
          <p
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: 1.1,
              color: 'var(--color-sobre-laton)',
            }}
          >
            El Marcador
          </p>

          <motion.ul
            className="marcador-grid"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
            tabIndex={0}
            aria-label="Estadísticas de El Marcador, desplazate con las flechas del teclado"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {todasLasCifras.map((cifra) => (
              <motion.li
                key={cifra.tipo === 'estatica' ? cifra.etiqueta : cifra.key}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: 'var(--po-shadow-md)' }}
                style={cardStyle}
              >
                {cifra.tipo === 'dinamica' && loading ? (
                  <div
                    style={{
                      margin: '0 auto 8px',
                      height: '32px',
                      width: '64px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.22)',
                      animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                    }}
                    aria-hidden="true"
                  />
                ) : cifra.tipo === 'estatica' ? (
                  <span style={numberStyle} aria-label={`${cifra.valor} — ${cifra.etiqueta}`}>
                    {cifra.valor}
                  </span>
                ) : (
                  <span
                    style={numberStyle}
                    aria-label={`${display[cifra.key]}${cifra.unidad ? " " + cifra.unidad : ""} — ${cifra.etiqueta}`}
                  >
                    {display[cifra.key]}
                    {cifra.unidad && (
                      <span style={{ fontSize: '18px' }}> {cifra.unidad}</span>
                    )}
                  </span>
                )}
                <span style={labelStyle}>{cifra.etiqueta}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>
    </>
  );
}
