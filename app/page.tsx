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
      <AnimatedDivider />
      <FeedInstagram />
      <MuroLlavesPreview />
      <Testimonios />
      <AnimatedDivider />
      <CTAFinal />
    </>
  );
}
