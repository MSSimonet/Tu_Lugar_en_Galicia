interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

// Píldora "eyebrow" para usar sobre fotos/video (fondo semitransparente + borde claro +
// text-shadow para legibilidad independiente de la imagen de fondo). Consolida las
// variantes que antes se reimplementaban inline en Hero/CiudadLayout/etc.
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={["inline-flex items-center uppercase", className].filter(Boolean).join(" ")}
      style={{
        fontFamily: "var(--font-lato)",
        fontWeight: 700,
        fontSize: "11px",
        letterSpacing: "var(--eyebrow-tracking, 0.18em)",
        color: "var(--po-ouro)",
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "999px",
        padding: "4px 14px",
        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </span>
  );
}
