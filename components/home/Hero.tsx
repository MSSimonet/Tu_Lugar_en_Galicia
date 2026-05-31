import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@/lib/config/site";

export function Hero() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center hero-gradient px-[var(--space-6)] py-[var(--space-24)] text-center"
      aria-labelledby="hero-heading"
    >
      {/* Degradado evocador del verde atlántico */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #1A5247 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl animate-fade-in-up">
        <h1
          id="hero-heading"
          className="font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-[var(--leading-titulo)] text-[var(--color-niebla)] md:text-[var(--text-3xl)]"
        >
          Tu familia merece llegar a{" "}
          <span className="text-[var(--color-laton-claro)]">Galicia</span> con
          casa esperándola
        </h1>

        {/* Línea decorativa en latón bajo el titular */}
        <div className="mx-auto mt-[var(--space-4)] h-0.5 w-16 rounded-full bg-[var(--color-laton)]" aria-hidden="true" />

        <p className="mx-auto mt-[var(--space-6)] max-w-2xl text-[var(--text-md)] leading-[var(--leading-cuerpo)] text-[var(--color-niebla)] opacity-90 md:text-[var(--text-lg)]">
          Somos el primer servicio de relocation especializado en Galicia.
          Buscamos tu vivienda antes de que viajes para que llegues tranquila,
          tranquilo, tranquilos — con las llaves en la mano.
        </p>

        <div className="mt-[var(--space-8)] flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
          <Link href="/agenda">
            <Button variant="primario" size="lg">
              Agenda tu videollamada
            </Button>
          </Link>

          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secundario" size="lg">
              Escríbenos por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
