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

const numberStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-playfair)',
  fontWeight: 700,
  fontSize: '40px',
  lineHeight: 1,
  color: '#F5EFE4',
};

const labelStyle: React.CSSProperties = {
  marginTop: '6px',
  display: 'block',
  fontFamily: 'var(--font-lato)',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#F5EFE4',
  opacity: 0.9,
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.12)',
  padding: '20px 16px',
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
        className="marcador-section"
        style={{ backgroundColor: 'var(--po-terra)' }}
        aria-label="El marcador — cifras de trayectoria y en tiempo real"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            style={{
              marginBottom: '6px',
              textAlign: 'center',
              fontFamily: 'var(--font-lato)',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.80)',
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
              color: '#F5EFE4',
            }}
          >
            El Marcador
          </p>

          <ul className="marcador-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {cifrasEstaticas.map(({ valor, etiqueta }) => (
              <li key={etiqueta} style={cardStyle}>
                <span style={numberStyle} aria-label={`${valor} — ${etiqueta}`}>
                  {valor}
                </span>
                <span style={labelStyle}>{etiqueta}</span>
              </li>
            ))}

            {cifrasDinamicas.map(({ key, etiqueta, unidad }) => (
              <li key={key} style={cardStyle}>
                {loading ? (
                  <div
                    style={{
                      margin: '0 auto 8px',
                      height: '40px',
                      width: '80px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.22)',
                      animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  <span style={numberStyle} aria-label={`${display[key]}${unidad ? " " + unidad : ""} — ${etiqueta}`}>
                    {display[key]}
                    {unidad && (
                      <span style={{ fontSize: '24px' }}> {unidad}</span>
                    )}
                  </span>
                )}
                <span style={labelStyle}>{etiqueta}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
