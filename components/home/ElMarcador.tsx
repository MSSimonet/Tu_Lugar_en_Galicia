"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate, useReducedMotion } from "motion/react";
import { staggerContainer, fadeUp, BRAND_EASE } from "@/lib/motion/variants";

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
const cifrasEstaticas: { valor: number; prefijo?: string; etiqueta: string }[] = [
  { valor: 200, prefijo: "+", etiqueta: "Familias" },
  { valor: 57, etiqueta: "En 2025" },
  { valor: 4, etiqueta: "Años" },
];

// Conteo animado: arranca cuando el marcador entra en viewport (entrada de contenido,
// tope de 400ms — motion-tu-lugar-en-galicia). Sin re-render por frame: escribe
// directo en el DOM vía onUpdate, como recomienda motion para evitar miles de
// setState durante la animación.
function CifraAnimada({
  valor,
  prefijo = "",
  sufijo = "",
  activa,
}: {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  activa: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const spanEl = spanRef.current;
    if (!activa || !spanEl) return;
    if (prefersReducedMotion) {
      spanEl.textContent = `${prefijo}${valor}${sufijo}`;
      return;
    }
    const controls = animate(0, valor, {
      duration: 0.4,
      ease: BRAND_EASE,
      onUpdate: (v) => {
        if (spanRef.current) spanRef.current.textContent = `${prefijo}${Math.round(v)}${sufijo}`;
      },
    });
    return () => controls.stop();
  }, [activa, valor, prefijo, sufijo, prefersReducedMotion]);

  return <span ref={spanRef}>{prefijo}0{sufijo}</span>;
}

// En tiempo real — vía /api/marcador (Google Sheets)
const cifrasDinamicas: { key: keyof MarcadorData; etiqueta: string; unidad?: string }[] =
  [
    { key: "anunciosContactados", etiqueta: "Anuncios contactados" },
    { key: "propietariosDijeronNo", etiqueta: "Propietarios que dijeron no" },
    { key: "familiasUbicadas", etiqueta: "Familias ubicadas este mes" },
    { key: "tiempoMedioSemanas", etiqueta: "Semanas de tiempo medio", unidad: "sem" },
  ];

// --dz-hero-text (fijo) en vez de --dz-ink (invierte en dark): --dz-hero-bg tampoco invierte,
// así que el texto necesita un token igual de fijo para mantener contraste.
const numberStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-dz-display)',
  fontWeight: 700,
  fontSize: '32px',
  lineHeight: 1,
  color: 'var(--dz-hero-text)',
};

const labelStyle: React.CSSProperties = {
  marginTop: '6px',
  display: 'block',
  fontFamily: 'var(--font-dz-ui)',
  fontSize: '9px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--dz-hero-text)',
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  borderRadius: 'var(--dz-radius-card)',
  background: 'rgba(255,255,255,0.12)',
  padding: '18px 10px',
};

export function ElMarcador() {
  const [data, setData] = useState<MarcadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enViewport, setEnViewport] = useState(false);

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
            /* Señal de que hay más tarjetas a la derecha — sin esto el scroll lateral
               solo se insinuaba por el corte de una card (auditoría 2026-07-19). */
            -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent);
            mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent);
          }
        }
        @media (max-width: 640px) {
          .marcador-section { padding: 24px 20px; }
        }
      `}</style>
      <section
        className="marcador-section"
        style={{ backgroundColor: 'var(--dz-hero-bg)' }}
        aria-label="El marcador — cifras de trayectoria y en tiempo real"
      >
        <div className="mx-auto max-w-6xl">
          {/* Eyebrow como <p> y título visual como <h2> — antes estaban invertidos y el
              outline del documento no reflejaba lo que se ve (auditoría 2026-07-19, A2.1) */}
          <p
            style={{
              marginBottom: '6px',
              textAlign: 'center',
              fontFamily: 'var(--font-dz-ui)',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--dz-hero-text)',
            }}
          >
            En tiempo real
          </p>
          <h2
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-dz-display)',
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: 1.1,
              color: 'var(--dz-hero-text)',
            }}
          >
            El Marcador
          </h2>

          <motion.ul
            className="marcador-grid"
            style={{ listStyle: 'none', margin: 0, padding: 0 }}
            tabIndex={0}
            aria-label="Estadísticas de El Marcador, desplazate con las flechas del teclado"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            onViewportEnter={() => setEnViewport(true)}
          >
            {todasLasCifras.map((cifra) => (
              <motion.li
                key={cifra.tipo === 'estatica' ? cifra.etiqueta : cifra.key}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: 'var(--dz-shadow-md)' }}
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
                  <span style={numberStyle} aria-label={`${cifra.prefijo ?? ''}${cifra.valor} — ${cifra.etiqueta}`}>
                    <CifraAnimada valor={cifra.valor} prefijo={cifra.prefijo} activa={enViewport} />
                  </span>
                ) : (
                  <span
                    style={numberStyle}
                    aria-label={`${display[cifra.key]}${cifra.unidad ? " " + cifra.unidad : ""} — ${cifra.etiqueta}`}
                  >
                    <CifraAnimada
                      valor={display[cifra.key]}
                      sufijo={cifra.unidad ? ` ${cifra.unidad}` : ""}
                      activa={enViewport && !loading}
                    />
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
