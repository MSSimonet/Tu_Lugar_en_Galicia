import { MuroLlavesCarrusel3D, type FotoMuroLlaves } from "./MuroLlavesCarrusel3D";

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

        <MuroLlavesCarrusel3D fotos={llaves} />

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
