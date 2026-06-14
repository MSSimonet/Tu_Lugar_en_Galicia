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
    {
      key: "propietariosDijeronNo",
      etiqueta: "Propietarios que dijeron no",
    },
    { key: "familiasUbicadas", etiqueta: "Familias ubicadas este mes" },
    {
      key: "tiempoMedioSemanas",
      etiqueta: "Semanas de tiempo medio",
      unidad: "sem",
    },
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
    <section
      className="bg-[var(--color-atlantico)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-label="El marcador — cifras en tiempo real"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ color: 'var(--color-niebla)' }}
        >
          En tiempo real
        </h2>
        <p
          className="mb-[var(--space-12)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] md:text-[var(--text-2xl)]"
          style={{ color: '#FFFFFF' }}
        >
          El Marcador
        </p>

        <ul className="grid grid-cols-2 gap-[var(--space-6)] md:grid-cols-4 md:gap-[var(--space-8)]">
          {cifras.map(({ key, etiqueta, unidad }) => (
            <li key={key} className="text-center rounded-[var(--radius-card)] bg-white/10 px-[var(--space-4)] py-[var(--space-6)]">
              {loading ? (
                /* Skeleton */
                <div
                  className="mx-auto mb-[var(--space-3)] h-12 w-24 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-atlantico-claro)]"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="block font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-[var(--leading-titulo)]"
                  style={{ color: '#FFFFFF' }}
                  aria-label={`${display[key]}${unidad ? " " + unidad : ""} — ${etiqueta}`}
                >
                  {display[key]}
                  {unidad && (
                    <span className="text-[var(--text-lg)]"> {unidad}</span>
                  )}
                </span>
              )}
              <span
                className="mt-[var(--space-2)] block font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
                style={{ color: 'var(--color-niebla)', opacity: 0.8 }}
              >
                {etiqueta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
