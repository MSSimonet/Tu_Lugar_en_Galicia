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
          color: "var(--dz-accent)",
          background: "rgba(255,255,255,0.06)",
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
      className={["inline-flex items-center uppercase", className].filter(Boolean).join(" ")}
      style={{
        fontFamily: "var(--font-dz-ui)",
        fontWeight: 700,
        fontSize: "11px",
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
