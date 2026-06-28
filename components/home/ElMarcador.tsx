"use client";

import { useEffect, useState } from "react";

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

const cifras: { key: keyof MarcadorData; etiqueta: string; unidad?: string }[] =
  [
    { key: "anunciosContactados", etiqueta: "Anuncios contactados" },
    { key: "propietariosDijeronNo", etiqueta: "Propietarios que dijeron no" },
    { key: "familiasUbicadas", etiqueta: "Familias ubicadas este mes" },
    { key: "tiempoMedioSemanas", etiqueta: "Semanas de tiempo medio", unidad: "sem" },
  ];

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

  return (
    <>
      <style>{`
        .marcador-section { padding: 32px 80px; }
        .marcador-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 640px) {
          .marcador-section { padding: 24px 20px; }
          .marcador-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
      <section
        className="marcador-section bg-[var(--color-atlantico)]"
        aria-label="El marcador — cifras en tiempo real"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            style={{
              marginBottom: '6px',
              textAlign: 'center',
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.75)',
            }}
          >
            En tiempo real
          </h2>
          <p
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontFamily: 'var(--font-titular)',
              fontSize: '32px',
              lineHeight: 1.1,
              color: '#FFFFFF',
            }}
          >
            El Marcador
          </p>

          <ul className="marcador-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {cifras.map(({ key, etiqueta, unidad }) => (
              <li
                key={key}
                style={{
                  textAlign: 'center',
                  borderRadius: 'var(--radius-card)',
                  background: 'rgba(255,255,255,0.10)',
                  padding: '20px 16px',
                }}
              >
                {loading ? (
                  <div
                    style={{
                      margin: '0 auto 8px',
                      height: '40px',
                      width: '80px',
                      borderRadius: 'var(--radius-card)',
                      background: 'var(--color-atlantico-claro)',
                      animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-titular)',
                      fontSize: '40px',
                      lineHeight: 1,
                      color: '#FFFFFF',
                    }}
                    aria-label={`${display[key]}${unidad ? " " + unidad : ""} — ${etiqueta}`}
                  >
                    {display[key]}
                    {unidad && (
                      <span style={{ fontSize: '24px' }}> {unidad}</span>
                    )}
                  </span>
                )}
                <span
                  style={{
                    marginTop: '6px',
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.75)',
                    opacity: 1,
                  }}
                >
                  {etiqueta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
