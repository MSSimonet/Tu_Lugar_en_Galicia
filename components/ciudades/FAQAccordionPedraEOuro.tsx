import { Accordion } from "@/components/ui/Accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

// Wrapper fino sobre el Accordion Radix compartido (components/ui/Accordion.tsx) —
// mismo nombre de export y misma prop API que antes, para que /faq y CiudadLayout
// hereden la mejora (altura animada real, teclado/ARIA de Radix) sin tocar sus imports.
export function FAQAccordionPedraEOuro({ faqs }: FAQAccordionProps) {
  return <Accordion items={faqs} />;
}
