import Link from "next/link";

const pasos = [
  {
    numero: 1,
    nombre: "Nos conocemos",
    descripcion:
      "Completás un formulario corto y evaluamos si podemos ayudarte hoy.",
  },
  {
    numero: 2,
    nombre: "Videollamada",
    descripcion:
      "Nos conocemos, te contamos cómo funciona todo y respondemos tus preguntas.",
  },
  {
    numero: 3,
    nombre: "Búsqueda activa",
    descripcion:
      "Salimos a buscar por vos: contactamos propietarios, filtramos anuncios y negociamos condiciones.",
  },
  {
    numero: 4,
    nombre: "Selección",
    descripcion:
      "Te presentamos las opciones que cumplen tus requisitos con fotos, videos y toda la info.",
  },
  {
    numero: 5,
    nombre: "Cierre",
    descripcion:
      "Te guiamos en la firma del contrato y te explicamos cada cláusula en lenguaje claro.",
  },
  {
    numero: 6,
    nombre: "Llegada",
    descripcion:
      "Cuando aterrices en Galicia, ya tenés tu casa. Nosotros seguimos disponibles para lo que necesites.",
  },
];

export function ComoFuncionaResumen() {
  return (
    <section
      className="bg-[var(--color-blanco)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="como-funciona-heading"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-4)] md:px-[var(--space-8)]">
        <h2
          id="como-funciona-heading"
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase"
        >
          El proceso
        </h2>
        <p className="mb-[var(--space-3)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] md:text-[var(--text-2xl)]">
          Cómo funciona
        </p>
        <p className="mb-[var(--space-12)] text-center font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-pizarra)]">
          Sin vueltas. Así acompañamos a cada familia.
        </p>

        <ol className="grid grid-cols-1 gap-[var(--space-8)] md:grid-cols-2">
          {pasos.map(({ numero, nombre, descripcion }) => (
            <li key={numero} className="flex gap-[var(--space-4)]">
              <span
                className="flex-shrink-0 font-[family-name:var(--font-titular)] font-bold text-[var(--text-2xl)] md:text-[var(--text-3xl)] leading-none text-[var(--color-laton)]"
                aria-hidden="true"
              >
                {numero}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-[var(--text-md)] font-bold text-[var(--color-granito)]">
                  {nombre}
                </h3>
                <p className="mt-[var(--space-1)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)] text-[var(--color-pizarra)]">
                  {descripcion}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--space-12)] text-center">
          <Link
            href="/como-funciona"
            className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-mar)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-mar)]"
          >
            Ver el proceso completo →
          </Link>
        </div>
      </div>
    </section>
  );
}
