/** Línea divisoria entre secciones del cuerpo de Inicio.
 *
 *  75% del ancho de página, centrada, en el dorado de marca (--dz-accent, el
 *  mismo tono del avión de fondo y su estela).
 *
 *  El brillo es ESTÁTICO: una capa desenfocada del mismo dorado detrás de la
 *  línea. No se anima —ni pulso ni barrido— porque el pedido es "sin parpadeo ni
 *  protagonismo visual", y una animación permanente en 4 puntos de la página es
 *  justo lo contrario. Al no moverse tampoco necesita rama de
 *  `prefers-reduced-motion`.
 *
 *  Los extremos se desvanecen a transparente en vez de cortarse en seco: una
 *  línea de 75% con puntas duras marca dos bordes verticales que compiten con el
 *  contenido. Decorativa pura, de ahí el aria-hidden. */
export function GoldDivider() {
  return (
    <div className="dz-divider" role="presentation" aria-hidden="true">
      <span className="dz-divider-glow" />
      <span className="dz-divider-line" />
    </div>
  );
}
