import { MuroLlavesMarquee, type FotoMuroLlaves } from "./MuroLlavesMarquee";

const llaves: FotoMuroLlaves[] = [
  { src: "/images/llaves/llaves1.jpg", alt: "Entrega de llaves — familia Rojas, Vigo" },
  { src: "/images/llaves/llaves2.jpg", alt: "Entrega de llaves — familia Ferreira, A Coruña" },
  { src: "/images/llaves/llaves3.jpg", alt: "Entrega de llaves — familia Castillo, Santiago de Compostela" },
  { src: "/images/llaves/llaves4.jpg", alt: "Entrega de llaves — familia Méndez, Pontevedra" },
  { src: "/images/llaves/llaves5.jpg", alt: "Entrega de llaves — familia García, Vigo" },
  { src: "/images/llaves/llaves6.jpg", alt: "Entrega de llaves — familia López, A Coruña" },
];

export function MuroLlavesPreview() {
  return (
    <section
      className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--dz-luz)' }}
      aria-labelledby="muro-llaves-heading"
    >
      <div className="mx-auto max-w-4xl">
        {/* Eyebrow como <p> y título visual como <h2> (auditoría 2026-07-19, A2.1) */}
        <p
          className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ fontFamily: 'var(--font-dz-ui)', fontWeight: 700, color: 'var(--dz-muted)' }}
        >
          Resultados
        </p>
        <h2
          id="muro-llaves-heading"
          className="mb-[var(--space-12)] text-center [font-size:var(--text-xl)] md:[font-size:var(--text-2xl)]"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
        >
          El muro de llaves
        </h2>

        <MuroLlavesMarquee fotos={llaves} />

        <div className="mt-[var(--space-8)] text-center">
          {/* TODO Fase 2: crear página /muro-de-llaves con galería completa */}
          <span
            className="[font-size:var(--text-sm)] cursor-default"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            Más entregas próximamente
          </span>
        </div>
      </div>
    </section>
  );
}
