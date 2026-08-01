// Fuente única de los 5 pasos reales del proceso.
//
// Nació para matar una duplicación entre ComoFuncionaStepper.tsx (versión completa) y
// components/home/ComoFuncionaTeaser.tsx (versión resumida, que además omitía por completo
// el paso de la videollamada). El Teaser se eliminó después, al unificar Home, así que hoy
// el único consumidor es el Stepper.
//
// Reconectado el 2026-07-31 tras la auditoría pre-merge: el archivo había quedado huérfano
// y el Stepper tenía otra vez su propio array, con lo cual la duplicación había vuelto. Al
// reconectarlo se detectó que las dos copias YA habían divergido en el paso 01 ("primer
// diagnóstico" acá contra "Plan Estratégico" en el Stepper). Se conservó el texto del
// Stepper, que es el que estaba publicado y el que corresponde al envío automático del Plan
// Estratégico (commit 16d3657).

export interface PasoComoFunciona {
  num: string;
  titulo: string;
  duracion: string;
  descripcion: string;
  imagen: string;
}

export const PASOS_COMO_FUNCIONA: PasoComoFunciona[] = [
  {
    num: "01",
    titulo: "Cuéntanos tu caso",
    duracion: "48 hs hábiles",
    descripcion: "Nos cuentas tu situación y te devolvemos un Plan Estratégico sin compromiso.",
    imagen: "/images/ciudades/tag_coruna.jpg",
  },
  {
    num: "02",
    titulo: "Agendamos una videollamada",
    duracion: "45–60 min",
    descripcion: "Agendamos una videollamada con nuestro equipo que te escuchará y te explicará el proceso completo. Sin letra chica.",
    imagen: "/images/ciudades/tag_santiago.jpg",
  },
  {
    num: "03",
    titulo: "Buscamos activamente",
    duracion: "1–3 semanas",
    descripcion: "Recorremos el mercado completo y te presentamos opciones reales y filtradas.",
    imagen: "/images/ciudades/tag_pontevedra.jpg",
  },
  {
    num: "04",
    titulo: "Negociamos y cerramos",
    duracion: "A distancia",
    descripcion: "Negociamos con el propietario y gestionamos la firma desde donde estés.",
    imagen: "/images/ciudades/tag_lugo.jpg",
  },
  {
    num: "05",
    titulo: "Llegas y abres tu puerta",
    duracion: "Día de llegada",
    descripcion: "Nuestro equipo te espera en Galicia y te acompaña en tu primer día.",
    imagen: "/images/ciudades/tag_coruna2.jpg",
  },
];
