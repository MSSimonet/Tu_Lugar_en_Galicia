"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, fadeUp } from "@/lib/motion/variants";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

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

// Conteo animado: arranca una sola vez cuando El Marcador entra en viewport (ver
// ScrollTrigger en ElMarcador más abajo, start "top 80%"). Cifra que cuenta desde 0
// hasta su valor real vía gsap.to + snap (2s, power2.out) — excepción documentada al
// tope de 400ms de la skill motion-tu-lugar-en-galicia: un contador que sube comunica
// progreso real, mismo criterio que la excepción de "cargas con progreso real". Sin
// re-render por frame: gsap escribe directo en el DOM vía onUpdate.
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

  useGSAP(
    () => {
      const spanEl = spanRef.current;
      if (!activa || !spanEl) return;
      if (prefersReducedMotion) {
        spanEl.textContent = `${prefijo}${valor}${sufijo}`;
        return;
      }
      const contador = { valor: 0 };
      gsap.to(contador, {
        valor,
        duration: 2,
        ease: "power2.out",
        snap: { valor: 1 },
        onUpdate: () => {
          if (spanRef.current) {
            spanRef.current.textContent = `${prefijo}${Math.round(contador.valor)}${sufijo}`;
          }
        },
      });
    },
    { dependencies: [activa, valor, prefijo, sufijo, prefersReducedMotion] }
  );

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
  const gridRef = useRef<HTMLUListElement>(null);

  // AbortController: sin él, el doble montaje de StrictMode dejaba una segunda
  // petición a /api/marcador colgada que terminaba en ERR_ABORTED en consola, y
  // una respuesta tardía podía escribir estado sobre un componente ya
  // desmontado (auditoría 2026-07-25, M1).
  useEffect(() => {
    const controlador = new AbortController();
    fetch("/api/marcador", { signal: controlador.signal })
      .then((res) => res.json())
      .then((json: MarcadorData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return; // cancelación esperada, no es un fallo
        setData(FALLBACK);
        setLoading(false);
      });
    return () => controlador.abort();
  }, []);

  // Dispara el conteo una sola vez cuando el grid entra en viewport — reemplaza el
  // onViewportEnter de motion por un ScrollTrigger real (start "top 80%", once: true).
  useGSAP(
    () => {
      if (!gridRef.current) return;
      const trigger = ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => setEnViewport(true),
      });
      return () => trigger.kill();
    },
    { scope: gridRef }
  );

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
              fontWeight: 'var(--dz-weight-h2)',
              fontSize: 'var(--dz-text-h2)',
              lineHeight: 'var(--dz-leading-h2)',
              color: 'var(--dz-hero-text)',
            }}
          >
            El Marcador
          </h2>

          <motion.ul
            ref={gridRef}
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
