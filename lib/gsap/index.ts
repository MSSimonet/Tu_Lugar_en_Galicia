import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Primer uso real de GSAP en el repo (gsap/@gsap/react ya estaban instalados y
// aprobados por ADR-010 para timelines scroll-driven, pero sin ningún archivo que
// los consumiera). Registro único y compartido para evitar registrar los plugins
// por archivo — cualquier componente que anime con GSAP importa desde acá.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
