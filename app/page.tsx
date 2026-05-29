import { getNextMetadata } from "@/lib/seo/metadata";
import {
  Hero,
  Metricas,
  ElMarcador,
  ComoFuncionaResumen,
  CiudadesCards,
  FeedInstagram,
  MuroLlavesPreview,
  Testimonios,
  CTAFinal,
} from "@/components/home";

export const metadata = getNextMetadata("home");

export default function Home() {
  return (
    <>
      <Hero />
      <Metricas />
      <ElMarcador />
      <ComoFuncionaResumen />
      <CiudadesCards />
      <FeedInstagram />
      <MuroLlavesPreview />
      <Testimonios />
      <CTAFinal />
    </>
  );
}
