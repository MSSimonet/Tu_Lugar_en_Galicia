export interface SectionFadeProps {
  /** Color CSS de la sección de arriba (p. ej. "var(--dz-hero-bg)" o un hex). */
  from: string;
  /** Color CSS de la sección de abajo. */
  to: string;
  /** Alto de la franja de degradado. */
  height?: number;
}

// Franja de degradado entre dos secciones con fondos distintos — reemplaza el
// corte duro de color por una transición difuminada. Puramente decorativa
// (aria-hidden), no agrega contenido ni cambia el color base de ninguna
// sección — solo el borde de unión entre ambas.
export function SectionFade({ from, to, height = 64 }: SectionFadeProps) {
  return (
    <div
      aria-hidden="true"
      style={{ height: `${height}px`, background: `linear-gradient(to bottom, ${from}, ${to})` }}
    />
  );
}
