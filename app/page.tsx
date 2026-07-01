import { getNextMetadata } from "@/lib/seo/metadata";
import { localBusinessSchema } from "@/lib/seo/schemas";
import {
  Hero,
  ElMarcador,
  FeedInstagram,
  MuroLlavesPreview,
  Testimonios,
  CTAFinal,
} from "@/components/home";
export const metadata = getNextMetadata("home");

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />
      <Hero />
      <ElMarcador />
      <FeedInstagram />
      <MuroLlavesPreview />
      <Testimonios />
      <CTAFinal />
    </>
  );
}
