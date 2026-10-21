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
import { FlotaAviones } from "@/components/ui/FlotaAviones";
import { GoldDivider } from "@/components/ui/GoldDivider";
export const metadata = getNextMetadata("home");


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
        <FlotaAviones />
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
