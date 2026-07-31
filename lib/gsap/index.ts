import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

// Primer uso real de GSAP en el repo (gsap/@gsap/react ya estaban instalados y
// aprobados por ADR-010 para timelines scroll-driven, pero sin ningún archivo que
// los consumiera). Registro único y compartido para evitar registrar los plugins
// por archivo — cualquier componente que anime con GSAP importa desde acá.
// MotionPathPlugin se suma para la capa de fondo animada (FondoAnimado): los
// íconos dejaron de moverse en línea recta horizontal y ahora recorren
// trayectorias libres (diagonales, curvas, espirales), que es lo que el plugin
// resuelve. Es parte del core gratuito de GSAP 3 — no requiere licencia Club.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);
}

export { gsap, ScrollTrigger, MotionPathPlugin, useGSAP };
