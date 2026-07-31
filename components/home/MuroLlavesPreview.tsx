import { MuroLlavesGrid, type FotoMuroLlaves } from "./MuroLlavesGrid";

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
      className="px-[var(--space-6)] py-[var(--dz-section-y)]"
      style={{ backgroundColor: 'transparent' /* la capa de fondo de pagina pinta el color; ver FondoAnimado */ }}
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
          className="mb-[var(--space-4)] text-center"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-ink)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
        >
          El muro de llaves
        </h2>
        {/* Pista de interacción. Va acá, entre el título y la grilla, y no debajo
            de la grilla como estaba: se lee ANTES de llegar a lo que explica.
            TODO Fase 2: crear página /muro-de-llaves con galería completa. */}
        <p
          className="mb-[var(--space-12)] text-center [font-size:var(--text-sm)]"
          style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
        >
          Presiona y arrastra para explorar
        </p>
      </div>

      {/* Contenedor de la grilla — fuera del max-w-4xl del título a propósito.
          El ancho ya no se deriva del ancho del título sino del VIEWPORT: deja
          --muro-margen libre a cada lado (2cm desde 768px, ver globals.css), así
          la ventana se ensancha con la pantalla en vez de toparse con un tope
          fijo de 56rem+6cm que en monitores anchos dejaba ~10cm muertos por
          lado. Ningún otro comportamiento de la grilla cambia. */}
      <div
        className="mx-auto muro-ventana"
        style={{
          width: "calc(100vw - 2 * var(--muro-margen))",
          // Sin alto: lo fija la grilla, que es la única que sabe cuántas filas
          // ENTERAS entran con el tamaño de celda que le impone este ancho. Antes
          // era clamp(546px, 71.5vh, 780px) y ese alto arbitrario era justamente
          // lo que dejaba la última fila cortada por la mitad.
          borderRadius: "var(--dz-radius-card)",
          overflow: "hidden",
        }}
      >
        <MuroLlavesGrid fotos={llaves} />
      </div>

    </section>
  );
}
