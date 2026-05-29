// TODO: reemplazar imágenes placeholder con fotos reales en /public

import Image from "next/image";

const llaves = [
  { n: 1, alt: "Entrega de llaves — familia Rojas, Vigo" },
  { n: 2, alt: "Entrega de llaves — familia Ferreira, A Coruña" },
  { n: 3, alt: "Entrega de llaves — familia Castillo, Santiago de Compostela" },
  { n: 4, alt: "Entrega de llaves — familia Méndez, Pontevedra" },
  { n: 5, alt: "Entrega de llaves — familia García, Vigo" },
  { n: 6, alt: "Entrega de llaves — familia López, A Coruña" },
];

export function MuroLlavesPreview() {
  return (
    <section
      className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="muro-llaves-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="muro-llaves-heading"
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase"
        >
          Resultados
        </h2>
        <p className="mb-[var(--space-12)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] md:text-[var(--text-2xl)]">
          El muro de llaves
        </p>

        <ul className="grid grid-cols-2 gap-[var(--space-4)] md:grid-cols-3">
          {llaves.map(({ n, alt }) => (
            <li key={n}>
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] shadow-md transition-shadow duration-300 hover:shadow-lg">
                <Image
                  src={`https://placehold.co/300x300/9A7A2E/FFFFFF?text=Llave+${n}`}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-[var(--space-8)] text-center">
          {/* TODO Fase 2: crear página /muro-de-llaves con galería completa */}
          <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] cursor-default">
            Más entregas próximamente
          </span>
        </div>
      </div>
    </section>
  );
}
