interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** "oscuro" (default): sobre fotos/video (Hero, CiudadLayout) — fondo translúcido negro +
   *  text-shadow, necesita esa opacidad para leerse encima de cualquier imagen.
   *  "claro": sobre fondo plano claro (--dz-luz/--dz-papel) — pill con fondo --dz-papel y
   *  borde --dz-borde, mismo que ya usaba app/ciudades/page.tsx a mano.
   *  "hero": sobre el bookend oscuro sólido (--dz-hero-bg, sin foto detrás — comunidad,
   *  contacto, faq, sobre-silvana) — "oscuro" es casi invisible ahí (fondo translúcido negro
   *  sobre un sólido ya casi negro), necesita su propio contraste vía borde/fondo con tinte
   *  de acento en vez de negro. */
  tone?: "oscuro" | "claro" | "hero";
}

// Píldora "eyebrow" — variantes según el fondo. Consolida las que antes se reimplementaban
// inline (o quedaban como texto plano sin pill) en cada página.
export function Eyebrow({ children, className = "", tone = "oscuro" }: EyebrowProps) {
  const toneStyle: React.CSSProperties =
    tone === "claro"
      ? {
          color: "var(--dz-accent-text)",
          background: "var(--dz-papel)",
          border: "1px solid var(--dz-borde)",
        }
      : tone === "hero"
      ? {
          // --dz-accent-text-tinte y no --dz-accent-text: el fondo de abajo lleva una
          // capa del propio acento, así que no es el fondo limpio contra el que está
          // calibrado --dz-accent-text. Resuelve a #F5EBDD y ahí --dz-accent-text daba
          // 4.38:1, por debajo del 4.5:1 de WCAG 1.4.3 (defecto preexistente, medido el
          // 2026-08-13). La variante tintada da 5.30:1 sin tocar el tinte.
          // El acento crudo tampoco sirve acá: daba 2.51:1 desde que el Hero sigue el
          // tema (--dz-fondo-marco, claro en modo claro).
          color: "var(--dz-accent-text-tinte)",
          // El fondo tintado con el propio acento funciona en los dos modos; el
          // rgba(255,255,255,0.06) anterior era invisible sobre un marco claro.
          background: "color-mix(in srgb, var(--dz-accent) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--dz-accent) 35%, transparent)",
        }
      : {
          color: "var(--dz-accent)",
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.18)",
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
        };
  return (
    <span
      // `dz-eyebrow`: gancho estable para el tracking responsive de app/globals.css.
      // Se usa una clase y no `:root` dentro del media query porque Tailwind v4
      // descarta esa declaracion al compilar (verificado en el CSS servido).
      className={["dz-eyebrow inline-flex items-center uppercase", className].filter(Boolean).join(" ")}
      style={{
        fontFamily: "var(--font-dz-ui)",
        fontWeight: 700,
        // 12px: minimo legible en movil — a 11px quedaba por debajo
        // (auditoria responsive 2026-07-26)
        fontSize: "12px",
        letterSpacing: "var(--eyebrow-tracking, 0.18em)",
        borderRadius: "999px",
        padding: "4px 14px",
        ...toneStyle,
      }}
    >
      {children}
    </span>
  );
}
