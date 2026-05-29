// TODO: reemplazar avatares placeholder con fotos reales

import Image from "next/image";

const testimonios = [
  {
    nombre: "Valentina Rojas",
    ciudadOrigen: "Bogotá, Colombia",
    ciudadGalicia: "Vigo",
    texto:
      "Yo no creía que fuera posible alquilar sin estar presente. Silvana nos mandó videos de los departamentos, nos explicó el barrio, habló con el propietario y cuando llegamos con las valijas, las llaves ya nos esperaban. No imaginaba que el primer día en Galicia pudiera ser tan tranquilo.",
    avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=VR",
  },
  {
    nombre: "Martín y Lucía Ferreira",
    ciudadOrigen: "Montevideo, Uruguay",
    ciudadGalicia: "A Coruña",
    texto:
      "Llevábamos meses mirando Idealista sin entender nada. Los propietarios no contestaban, no sabíamos qué documentación pedir. Contratamos a Silvana y en tres semanas teníamos piso. Nos ahorró meses de angustia. Vale cada euro.",
    avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=MF",
  },
  {
    nombre: "Diego Castillo",
    ciudadOrigen: "Buenos Aires, Argentina",
    ciudadGalicia: "Santiago de Compostela",
    texto:
      "Lo que más me sorprendió fue que Silvana entendía exactamente lo que estábamos viviendo. Ella misma pasó por lo mismo. No era una agencia fría dando respuestas de manual — era alguien que realmente quería que nos instaláramos bien. Y lo logramos.",
    avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=DC",
  },
];

export function Testimonios() {
  return (
    <section
      className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="testimonios-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="testimonios-heading"
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase"
        >
          Lo que dicen las familias
        </h2>
        <p className="mb-[var(--space-12)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] md:text-[var(--text-2xl)]">
          Testimonios
        </p>

        <ul className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-3">
          {testimonios.map(
            ({ nombre, ciudadOrigen, ciudadGalicia, texto, avatar }) => (
              <li
                key={nombre}
                className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-blanco)] p-[var(--space-8)] shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-[var(--space-4)]">
                  <Image
                    src={avatar}
                    alt={`Foto de perfil de ${nombre}`}
                    width={64}
                    height={64}
                    className="rounded-full flex-shrink-0"
                  />
                  <div>
                    <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-bold text-[var(--color-granito)]">
                      {nombre}
                    </p>
                    <p className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)]">
                      {ciudadOrigen} → {ciudadGalicia}
                    </p>
                  </div>
                </div>

                <blockquote className="mt-[var(--space-6)] flex-1">
                  <p className="font-[family-name:var(--font-titular)] text-[var(--text-sm)] italic leading-[var(--leading-cuerpo)] text-[var(--color-pizarra)]">
                    &ldquo;{texto}&rdquo;
                  </p>
                </blockquote>
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  );
}
