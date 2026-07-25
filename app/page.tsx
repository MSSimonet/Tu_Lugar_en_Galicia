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
import { AnimatedDivider } from "@/components/ui/AnimatedDivider";
export const metadata = getNextMetadata("home");

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />
      <HeroPedraEOuro />
      <ElMarcador />
      <div style={{ background: "linear-gradient(to bottom, var(--dz-hero-bg), var(--dz-papel))" }}>
        <AnimatedDivider direction="rtl" />
      </div>
      <FeedInstagram />
      <div style={{ background: "linear-gradient(to bottom, var(--dz-papel), var(--dz-luz))" }}>
        <AnimatedDivider direction="ltr" />
      </div>
      <MuroLlavesPreview />
      <div style={{ background: "linear-gradient(to bottom, var(--dz-luz), var(--dz-papel))" }}>
        <AnimatedDivider direction="rtl" />
      </div>
      <Testimonios />
      <div style={{ background: "linear-gradient(to bottom, var(--dz-papel), var(--dz-hero-bg))" }}>
        <AnimatedDivider direction="ltr" />
      </div>
      <CTAFinal />
    </>
  );
}
