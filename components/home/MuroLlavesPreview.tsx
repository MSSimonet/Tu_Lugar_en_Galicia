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
      className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--po-luz)' }}
      aria-labelledby="muro-llaves-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="muro-llaves-heading"
          className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-muted)' }}
        >
          Resultados
        </h2>
        <p
          className="mb-[var(--space-12)] text-center [font-size:var(--text-xl)] md:[font-size:var(--text-2xl)]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-pedra)' }}
        >
          El muro de llaves
        </p>

        <ul className="grid grid-cols-2 gap-[var(--space-4)] md:grid-cols-3">
          {llaves.map(({ n, alt }) => (
            <li key={n}>
              <div
                className="relative overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg"
                style={{ paddingBottom: '100%', borderRadius: '4px' }}
              >
                <Image
                  src={`/images/llaves/llaves${n}.jpg`}
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
          <span
            className="[font-size:var(--text-sm)] cursor-default"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
          >
            Más entregas próximamente
          </span>
        </div>
      </div>
    </section>
  );
}
