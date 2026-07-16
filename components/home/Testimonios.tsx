// TODO: reemplazar avatares placeholder con fotos reales

import Image from "next/image";

const testimonios = [
  {
    nombre: "Valentina Rojas",
    ciudadOrigen: "Bogotá, Colombia",
    ciudadGalicia: "Vigo",
    texto:
      "Yo no creía que fuera posible alquilar sin estar presente. El equipo nos mandó videos de los departamentos, nos explicó el barrio, habló con el propietario y cuando llegamos con las valijas, las llaves ya nos esperaban. No imaginaba que el primer día en Galicia pudiera ser tan tranquilo.",
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=VR",
  },
  {
    nombre: "Martín y Lucía Ferreira",
    ciudadOrigen: "Montevideo, Uruguay",
    ciudadGalicia: "A Coruña",
    texto:
      "Llevábamos meses mirando Idealista sin entender nada. Los propietarios no contestaban, no sabíamos qué documentación pedir. Contratamos a Tu Lugar en Galicia y en tres semanas teníamos piso. Nos ahorró meses de angustia. Vale cada euro.",
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=MF",
  },
  {
    nombre: "Diego Castillo",
    ciudadOrigen: "Buenos Aires, Argentina",
    ciudadGalicia: "Santiago de Compostela",
    texto:
      "Lo que más me sorprendió fue que el equipo entendía exactamente lo que estábamos viviendo. No era una agencia fría dando respuestas de manual — era gente que realmente quería que nos instaláramos bien. Y lo logramos.",
    avatar: "https://placehold.co/80x80/8B6E4E/F2EDE4?text=DC",
  },
];

export function Testimonios() {
  return (
    <section
      id="testimonios"
      className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--po-luz)' }}
      aria-labelledby="testimonios-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="testimonios-heading"
          className="mb-[var(--space-2)] text-center [font-size:var(--text-xs)] tracking-[var(--tracking-ui)] uppercase"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-muted)' }}
        >
          Lo que dicen las familias
        </h2>
        <p
          className="mb-[var(--space-12)] text-center [font-size:var(--text-xl)] md:[font-size:var(--text-2xl)]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-pedra)' }}
        >
          Testimonios
        </p>

        <ul className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-3">
          {testimonios.map(
            ({ nombre, ciudadOrigen, ciudadGalicia, texto, avatar }) => (
              <li
                key={nombre}
                className="flex flex-col p-[var(--space-8)] shadow-md transition-shadow duration-300 hover:shadow-lg"
                style={{
                  borderRadius: '4px',
                  border: '1px solid var(--po-borde)',
                  backgroundColor: 'var(--po-areia)',
                }}
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
                    <p
                      className="[font-size:var(--text-sm)] font-bold"
                      style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
                    >
                      {nombre}
                    </p>
                    <p
                      className="[font-size:var(--text-xs)]"
                      style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
                    >
                      {ciudadOrigen} → {ciudadGalicia}
                    </p>
                  </div>
                </div>

                <blockquote className="mt-[var(--space-6)] flex-1">
                  <p
                    className="[font-size:var(--text-sm)] italic leading-[var(--leading-cuerpo)]"
                    style={{ fontFamily: 'var(--font-playfair)', color: 'var(--po-muted)' }}
                  >
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
