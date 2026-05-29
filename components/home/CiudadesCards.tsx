import Image from "next/image";
import Link from "next/link";

const ciudades = [
  {
    nombre: "Vigo",
    slug: "vigo",
    descripcion: "La ciudad portuaria más grande de Galicia, con playa y mar.",
    placeholder:
      "https://placehold.co/400x250/1A5247/F2F0EB?text=Vigo",
  },
  {
    nombre: "A Coruña",
    slug: "a-coruna",
    descripcion: "Elegancia costera, paseo marítimo y vida cultural activa.",
    placeholder:
      "https://placehold.co/400x250/1A5247/F2F0EB?text=A+Coru%C3%B1a",
  },
  {
    nombre: "Santiago de Compostela",
    slug: "santiago-de-compostela",
    descripcion: "Ciudad histórica, universitaria y de escala humana perfecta.",
    placeholder:
      "https://placehold.co/400x250/1A5247/F2F0EB?text=Santiago",
  },
  {
    nombre: "Pontevedra",
    slug: "pontevedra",
    descripcion: "Tranquilidad, ría y una ciudad pensada para los peatones.",
    placeholder:
      "https://placehold.co/400x250/1A5247/F2F0EB?text=Pontevedra",
  },
  {
    nombre: "Lugo",
    slug: "lugo",
    descripcion: "Muralla romana, interior verde y ritmo de vida tranquilo.",
    placeholder:
      "https://placehold.co/400x250/1A5247/F2F0EB?text=Lugo",
  },
];

export function CiudadesCards() {
  return (
    <section
      className="bg-[var(--color-arena)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="ciudades-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="ciudades-heading"
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase"
        >
          Destinos
        </h2>
        <p className="mb-[var(--space-4)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] md:text-[var(--text-2xl)]">
          Las ciudades donde operamos
        </p>
        <p className="mb-[var(--space-12)] mx-auto max-w-2xl text-center font-[family-name:var(--font-ui)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)] text-[var(--color-pizarra)]">
          Galicia tiene ciudades para todos los estilos de vida. ¿Preferís la
          energía portuaria de Vigo, la elegancia costera de A Coruña, la
          escala humana de Santiago o la tranquilidad de Pontevedra y Lugo?
          Conocé cada ciudad y encontrá dónde querés empezar tu nueva vida.
        </p>

        <ul className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-2 lg:grid-cols-3 [&>li:last-child:nth-child(odd)]:md:col-span-2 [&>li:last-child:nth-child(odd)]:lg:col-span-1 [&>li:last-child]:lg:col-start-2">
          {ciudades.map(({ nombre, slug, descripcion, placeholder }) => (
            <li key={slug}>
              <Link
                href={`/ciudades/${slug}`}
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-blanco)] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={placeholder}
                    alt={`Fotografía representativa de ${nombre}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-[var(--space-6)]">
                  <h3 className="font-[family-name:var(--font-titular)] text-[var(--text-lg)] text-[var(--color-granito)]">
                    {nombre}
                  </h3>
                  <p className="mt-[var(--space-2)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)] text-[var(--color-pizarra)]">
                    {descripcion}
                  </p>
                  <span className="mt-[var(--space-4)] inline-block font-[family-name:var(--font-ui)] text-[var(--text-xs)] font-medium tracking-[var(--tracking-ui)] text-[var(--color-laton)] uppercase">
                    Conocé {nombre} →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
