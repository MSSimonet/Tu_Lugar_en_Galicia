const POSTER = "/images/home/hero-lanzada-poster.jpg";
const VIDEO  = "/videos/hero-lanzada.mp4";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col justify-end hero-gradient"
      aria-labelledby="hero-heading"
    >
      {/* Video a pleno color en toda la pantalla — sin overlay general */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER}
          preload="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src={VIDEO} type="video/mp4" />
        </video>

        {/* Scrim: degradado de pantalla completa, transparente arriba → oscuro
            abajo, donde vive el texto. La imagen se ve, solo oscurecida. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.78) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bloque editorial: centrado en móvil, anclado abajo-izquierda en escritorio */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-[var(--space-6)] pb-[var(--space-16)] pt-[var(--space-24)] md:px-[var(--space-12)] md:pb-[var(--space-24)]">
        <div
          className="text-center md:text-left animate-fade-in-up"
          style={{ maxWidth: "calc(60ch + 1cm)" }}
        >
          {/* Titular — Cormorant Garamond 600, dorado con degradado metálico.
              drop-shadow (no text-shadow) porque el fill es transparente por el clip. */}
          <h1
            id="hero-heading"
            className="md:w-max md:whitespace-nowrap"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontWeight: 600,
              fontSize: "clamp(1.2rem, 2.2vw, 1.9rem)",
              lineHeight: 1.2,
              letterSpacing: "0.5px",
              background:
                "linear-gradient(135deg, #F4DD8C 0%, #E6C158 45%, #C9A23D 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
            }}
          >
            Tu nueva vida en Galicia empieza con una puerta abierta...
          </h1>

          <p
            className="mx-auto md:mx-0"
            style={{
              fontFamily: "var(--font-karla), system-ui, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
              lineHeight: 1.6,
              maxWidth: "60ch",
              marginTop: "1.25rem",
              color: "#EDE4D3",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            Encontramos y aseguramos la vivienda que se adapta a tu momento de
            vida. Un servicio de reubicación honesto y profesional que se
            encarga de todo el proceso a distancia, para que tu única tarea al
            llegar sea abrir tu puerta.
          </p>
        </div>
      </div>
    </section>
  );
}
