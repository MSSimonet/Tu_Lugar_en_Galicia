import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Slide-in alterno al hacer scroll, compartido entre CarruselCiudades y
// CiudadLayout ("otras ciudades") — antes vivía copiado en los dos archivos.
// Impares (1ª, 3ª...) desde la izquierda, pares desde la derecha; distancia
// a la mitad en mobile (<640px).
export function useSlideInCards(
  scope: RefObject<HTMLElement | null>,
  selector: string,
  skip: boolean
) {
  useGSAP(
    () => {
      if (skip || !scope.current) return;
      const tarjetas = gsap.utils.toArray<HTMLElement>(selector, scope.current);
      const distancia = window.matchMedia("(max-width: 640px)").matches ? 50 : 100;
      tarjetas.forEach((tarjeta, i) => {
        gsap.fromTo(
          tarjeta,
          { x: i % 2 === 0 ? -distancia : distancia, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: tarjeta, start: "top 88%", once: true },
          }
        );
      });
    },
    { scope, dependencies: [skip, selector] }
  );
}
