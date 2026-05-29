const metricas = [
  { valor: "+200", etiqueta: "Familias reubicadas" },
  { valor: "4", etiqueta: "Años de experiencia" },
  { valor: "57", etiqueta: "Familias ubicadas en 2025" },
];

export function Metricas() {
  return (
    <section
      className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-label="Métricas del servicio"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-4)] md:px-[var(--space-8)]">
        <ul className="flex flex-col items-center gap-[var(--space-12)] sm:flex-row sm:justify-around sm:gap-[var(--space-8)]">
          {metricas.map(({ valor, etiqueta }) => (
            <li key={etiqueta} className="text-center">
              <span
                className="block font-[family-name:var(--font-titular)] font-bold text-[var(--text-3xl)] leading-[var(--leading-titulo)] text-[var(--color-granito)]"
                aria-label={`${valor} ${etiqueta}`}
              >
                {valor}
              </span>
              <span className="mt-[var(--space-2)] block font-[family-name:var(--font-ui)] text-[var(--text-sm)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase">
                {etiqueta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
