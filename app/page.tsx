import { getNextMetadata } from "@/lib/seo/metadata";
import { localBusinessSchema } from "@/lib/seo/schemas";
import {
  ElMarcador,
  FeedInstagram,
  MuroLlavesPreview,
  Testimonios,
  CTAFinal,
} from "@/components/home";
import { HeroPedraEOuro } from "@/components/home/HeroPedraEOuro";
import { FondoAnimado, type FondoAnimadoProps } from "@/components/ui/FondoAnimado";
import { GoldDivider } from "@/components/ui/GoldDivider";
export const metadata = getNextMetadata("home");

// Flota de fondo del cuerpo de Inicio. Un avión por banda horizontal de la capa.
//
// POR QUÉ BANDAS. Antes eran seis aviones con trayectorias de cruce que barrían
// el alto ENTERO de la capa (~3.100px). Medido en la sesión anterior: en la
// sección del marcador, con scrollY 700, había 0 de 6 aviones dentro del
// viewport. No era z-index, ni GSAP, ni imágenes que no cargaran: con recorridos
// tan largos cada avión pasaba la mayor parte del ciclo en otra franja de la
// página o en el pasillo de retorno, así que la cobertura dependía del timing.
//
// Ahora cada avión queda confinado a una banda de 1/BANDAS del alto de la capa.
// Si ninguna banda supera la MITAD de la ventana útil, siempre hay al menos una
// banda ENTERA en pantalla, y el avión de esa banda no puede estar en otro lado:
// la cobertura pasa a ser geométrica en vez de estadística.
//
// De dónde sale el 12. La ventana útil no es el viewport entero: el Header es
// `position: sticky` y se queda con los 92px de arriba, así que de 647px quedan
// 555 y una banda no puede pasar de 277. Con la capa medida en 3.129px:
// 3.129 / 12 = 261 ≤ 277. Con 10 bandas daban 313 y ahí la garantía se caía —
// medido, no estimado.
//
// Las cinco secciones reciben entre una y cuatro bandas según su alto. El
// marcador, la más baja con 282px, entra completo en una banda — es la que
// forzaba el diseño por bandas.
const BANDAS = 12;

const AVIONES: Omit<FondoAnimadoProps, "icono">[] = [
  ...Array.from({ length: BANDAS }, (_, i) => ({
    trayectoria: "banda" as const,
    banda: { indice: i, total: BANDAS },
    // Fases escalonadas de a 1/(2·BANDAS). El paso chico es deliberado: bandas
    // vecinas quedan en fases vecinas, así el avión de al lado ENTRA en cuadro
    // justo cuando este sale, y tapa el hueco del giro. Se probó separarlos al
    // máximo (paso 5, coprimo con 24) y fue peor: 41 posiciones de scroll sin
    // ningún avión contra 22. Medido, no razonado.
    //
    // El +0,5 de las impares las arranca en el arco de vuelta, así que en todo
    // momento la mitad de la flota cruza hacia un lado y la otra mitad hacia el
    // otro. Sumar 0,5 no altera el reparto de los giros, de período 0,5.
    demora: i / (2 * BANDAS) + (i % 2) * 0.5,
    semilla: i + 1,
  })),
  // Refuerzo de las bandas de los extremos. Son el único caso sin vecina de un
  // lado, así que nadie les tapa el hueco de ~5% del ciclo en que su avión está
  // girando fuera de cuadro — ahí quedaban las 22 posiciones de scroll sin
  // ningún avión. Con un segundo avión a 1/4 de ciclo los huecos de la pareja
  // caen en momentos distintos y la banda nunca queda vacía. Semilla propia para
  // que los dos no calquen el mismo arco.
  ...[0, BANDAS - 1].map((i) => ({
    trayectoria: "banda" as const,
    banda: { indice: i, total: BANDAS },
    demora: (i / (2 * BANDAS) + (i % 2) * 0.5 + 0.25) % 1,
    semilla: 100 + i,
  })),
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />
      <HeroPedraEOuro />
      {/* Cuerpo: una sola capa de color con el avión recorriéndola por detrás.
          Antes acá había 4 AnimatedDivider intercalados entre secciones, cada
          uno con su franja de degradado propia para coser el salto de color
          entre una sección y la siguiente. Con un fondo único no hay saltos que
          coser: los 4 degradados y los 4 divisores desaparecen y el avión pasa
          a volar por detrás de todo (rediseño de fondos 2026-07-26). */}
      <div className="relative" style={{ backgroundColor: "var(--dz-fondo-pagina)" }}>
        {AVIONES.map((avion, i) => (
          <FondoAnimado key={i} icono="avion" {...avion} />
        ))}
        <div className="relative" style={{ zIndex: 1 }}>
          <ElMarcador />
          <GoldDivider />
          <FeedInstagram />
          <GoldDivider />
          <MuroLlavesPreview />
          <GoldDivider />
          <Testimonios />
          <GoldDivider />
          <CTAFinal />
        </div>
      </div>
    </>
  );
}
