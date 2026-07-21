// Fuente única de las 5 ciudades activas — consumida por app/ciudades/page.tsx (grid índice) y
// components/ciudades/CarruselCiudades.tsx (Home y /ciudades comparten el mismo componente).
// Antes vivía duplicada
// como array local en app/ciudades/page.tsx.

export interface Ciudad {
  nombre: string;
  tag: string;
  slug: string;
  imagen: string;
  video: string;
}

export const CIUDADES: Ciudad[] = [
  {
    nombre: "Vigo",
    tag: "La ría se abre al Atlántico y la ciudad nunca para.",
    slug: "vigo",
    imagen: "/images/ciudades/card_vigo.jpg",
    video: "/videos/Vigo.mp4",
  },
  {
    nombre: "A Coruña",
    tag: "Viento, faro y una luz que no se parece a ninguna otra.",
    slug: "a-coruna",
    imagen: "/images/ciudades/card_coruna2.jpg",
    video: "/videos/coruna.mp4",
  },
  {
    nombre: "Santiago de Compostela",
    tag: "La ciudad que lleva siglos esperando a quien llega.",
    slug: "santiago-de-compostela",
    imagen: "/images/ciudades/card_santiago 2.jpg",
    video: "/videos/Santiago.mp4",
  },
  {
    nombre: "Pontevedra",
    tag: "Piedra, silencio y la vida que pasa despacio.",
    slug: "pontevedra",
    imagen: "/images/ciudades/card_pontevedra.jpg",
    video: "/videos/Pontevedra.mp4",
  },
  {
    nombre: "Lugo",
    tag: "Dos mil años de muralla y todo el tiempo del mundo.",
    slug: "lugo",
    imagen: "/images/ciudades/card_lugo.jpg",
    video: "/videos/Lugo.mp4",
  },
];
