"use client";

import { useState, useEffect } from "react";
import { FondoAnimado, type FondoAnimadoProps } from "@/components/ui/FondoAnimado";

function buildAviones(bandas: number, refuerzo: boolean): Omit<FondoAnimadoProps, "icono">[] {
  return [
    ...Array.from({ length: bandas }, (_, i) => ({
      trayectoria: "banda" as const,
      banda: { indice: i, total: bandas },
      demora: i / (2 * bandas) + (i % 2) * 0.5,
      semilla: i + 1,
    })),
    ...(refuerzo
      ? [0, bandas - 1].map((i) => ({
          trayectoria: "banda" as const,
          banda: { indice: i, total: bandas },
          demora: (i / (2 * bandas) + (i % 2) * 0.5 + 0.25) % 1,
          semilla: 100 + i,
        }))
      : []),
  ];
}

// Desktop: 6 bandas + 2 refuerzo = 8 aviones
// Mobile (<768px): 3 bandas, sin refuerzo = 3 aviones
const AVIONES_DESKTOP = buildAviones(6, true);
const AVIONES_MOBILE = buildAviones(3, false);

export function FlotaAviones() {
  const [aviones, setAviones] = useState(AVIONES_DESKTOP);

  useEffect(() => {
    const update = () => {
      setAviones(window.innerWidth < 768 ? AVIONES_MOBILE : AVIONES_DESKTOP);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      {aviones.map((avion, i) => (
        <FondoAnimado key={i} icono="avion" {...avion} />
      ))}
    </>
  );
}
