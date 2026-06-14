---
name: voz-tu-lugar-en-galicia
description: >-
  Voz de marca de "Tu Lugar en Galicia". Usar SIEMPRE que se genere o edite
  cualquier contenido de cara al cliente: copy de la web y sus páginas,
  titulares, subtítulos, CTAs, captions de Instagram, posts de blog, mensajes
  de error, emails al cliente y todo texto que el asistente Gina le muestre al
  usuario. Impone la voz de marca en "tú" neutro (español internacional,
  cálido y cercano; nunca "vos", nunca "vosotros", nunca corporativo ni frío).
  Si dudás de si un texto lo va a leer un cliente, aplicá esta skill.
---

# Voz de marca — Tu Lugar en Galicia

> Fuente de verdad: `CLAUDE.md` §6 y §6.1, `docs/design-system.md` §5.
> Esta skill las codifica. Si esos docs cambian, esta skill se actualiza.

## Cuándo aplica

Aplicá esta voz a **todo lo que ve el cliente**:

- La web y el copy de todas las páginas
- Titulares, subtítulos y microcopy de UI
- CTAs (botones, enlaces de acción)
- Captions de Instagram, blog y redes
- Mensajes de error y estados vacíos
- **Todos los mensajes que Gina le muestra al cliente**
- Emails y notificaciones al usuario

## La regla que nunca se cruza: dos voces para dos cosas

El proyecto tiene **dos registros de voz distintos**. No se mezclan jamás.

| | Voz de MARCA | Voz de TRABAJO |
|---|---|---|
| **Para quién** | el cliente | Silvana / el equipo |
| **Dónde** | todo lo publicado y la salida de Gina | el chat con los agentes (Claude Code) |
| **Registro** | **"tú" neutro** | "vos" rioplatense |

🧭 **Mnemotécnica:** lo que ve el cliente = **"tú"**; lo que se habla con el equipo = "vos".

La voz de TRABAJO ("vos") **NUNCA** aparece en nada publicado, ni en el producto,
ni en la salida de Gina. Esta skill cubre solo la voz de MARCA.

## Reglas de la voz de marca

1. **"tú" neutro, español internacional.** Segunda persona del singular.
   Nunca "vos", nunca "vosotros".
   - Motivo: el público es argentino, venezolano y brasileño mezclado. El "tú"
     neutro no deja a nadie afuera.
2. **Cálida y directa.** "Te buscamos el hogar", "Estás en el lugar correcto".
3. **CTAs directos y accionables.** "Agenda tu videollamada", "Escríbenos por WhatsApp".
4. **Sin jerga ni tono frío ni corporativo.** Quien nos lee no tiene tiempo para
   textos largos: frases cortas, claras, humanas.
5. **Errores amables y claros, nunca técnicos.** Un error explica qué pasó y qué
   hacer, sin tecnicismos ni culpa al usuario.
6. **Idioma:** español. (Fase 6 sumará portugués e inglés; hasta entonces, español.)

## Verbos y formas — guía rápida

- Imperativo en "tú": **Agenda**, **Escríbenos**, **Cuéntanos**, **Descubre**
  (nunca "Agendá", "Escribinos", "Contanos" → eso es "vos").
- Posesivos en "tú": **tu** vivienda, **tu** familia, **tus** llaves.
- Pronombres: **te**, **tú**, **tu/tus** (nunca "os", "vuestro/a").

## Ejemplos

✅ **Correcto (tú neutro):**
- "Tu familia merece llegar a Galicia directo a un hogar."
- "Buscamos tu vivienda antes de que viajes."
- "¿Prefieres un formulario? Escríbenos por WhatsApp."
- "Cuéntanos tu situación y te ayudamos a encontrar el piso que necesitas."

❌ **Incorrecto (vos / vosotros / frío):**
- "Tu familia merece llegar a Galicia directo a un hogar." → "Buscamos tu
  vivienda antes de que **viajés**." (vos)
- "**Contanos** tu situación y **te ayudamos**…" (vos)
- "**Rellenad vuestro** formulario para continuar." (vosotros)
- "Su solicitud ha sido procesada correctamente por el sistema." (frío/corporativo)

## Checklist antes de publicar

- [ ] ¿Está en "tú"? (sin "vos" ni "vosotros")
- [ ] ¿Suena cálido y cercano, no corporativo ni frío?
- [ ] ¿Las llamadas a la acción son directas?
- [ ] ¿Los errores son amables y sin tecnicismos?
- [ ] ¿Funciona igual para alguien de Argentina, Venezuela o Brasil?

> ⚠️ Nota de transición (Fase 1): algunos textos viejos de la web todavía usan
> "vos" rioplatense y están pendientes de conversión a "tú" neutro. Si editás
> uno de esos, convertilo a "tú" de paso.
