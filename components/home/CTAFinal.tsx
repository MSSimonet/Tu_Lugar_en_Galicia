import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CTAFinal() {
  return (
    <section
      className="bg-[var(--color-granito)] px-[var(--space-6)] py-[var(--space-24)]"
      aria-labelledby="cta-final-heading"
    >
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <h2
          id="cta-final-heading"
          className="font-[family-name:var(--font-titular)] [font-size:var(--text-2xl)] leading-[var(--leading-titulo)] [color:var(--color-niebla)] md:[font-size:var(--text-3xl)]"
        >
          ¿Listo para encontrar tu lugar en{" "}
          <span className="[color:var(--color-laton-claro)] dark:text-laton-invertido">Galicia</span>?
        </h2>

        <p className="mx-auto mt-[var(--space-6)] max-w-lg font-[family-name:var(--font-ui)] [font-size:var(--text-md)] leading-[var(--leading-cuerpo)] [color:var(--color-niebla)] opacity-80">
          Cuéntanos tu situación y te decimos si podemos
          ayudarte. Sin compromiso, sin costo de consulta.
        </p>

        <div className="mt-[var(--space-8)] flex justify-center">
          <Link href="/conocernos">
            <Button variant="primario" size="lg">
              Vamos a conocernos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
