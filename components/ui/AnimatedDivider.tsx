"use client";

import { useRef } from "react";
import { Plane } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

// Separador decorativo entre secciones — línea fina con un ícono que la recorre de
// izquierda a derecha atado al scroll (scrub, no timer). Sutil a propósito: un solo
// acento (dz-accent), sin texto, coherente con el tono editorial de la marca (ver
// DESIGN.md §1 — "menos ornamento, más contraste y confianza tipográfica").
export function AnimatedDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion || !containerRef.current || !iconRef.current) return;
      const container = containerRef.current;
      const icon = iconRef.current;
      gsap.fromTo(
        icon,
        { x: 0 },
        {
          x: () => container.offsetWidth - icon.offsetWidth,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div aria-hidden="true" style={{ backgroundColor: "var(--dz-papel)", padding: "var(--space-8) 0" }}>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "32px" }}
      >
        <div
          className="absolute left-[var(--space-6)] right-[var(--space-6)] top-1/2"
          style={{ height: "1px", backgroundColor: "var(--dz-borde)", transform: "translateY(-50%)" }}
        />
        {prefersReducedMotion ? (
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: "translate(-50%, -50%) rotate(45deg)", color: "var(--dz-accent)" }}
          >
            <Plane size={16} strokeWidth={1.75} />
          </div>
        ) : (
          <div
            ref={iconRef}
            className="absolute"
            style={{ left: 0, top: "calc(50% - 8px)", color: "var(--dz-accent)" }}
          >
            <Plane size={16} strokeWidth={1.75} style={{ transform: "rotate(45deg)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
