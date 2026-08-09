---
name: voz-tu-lugar-en-galicia
description: Voz de marca de Tu Lugar en Galicia. Aplicar a TODO texto que lea un cliente — web, emails, formularios, mensajes de error, copy de Gina. "Tú" neutro, cálido, directo, nunca corporativo.
metadata:
  origin: proyecto
  fuente: docs/contexto-estrategico.md §10
---

# Voz de marca — Tu Lugar en Galicia

## Cuándo se aplica

Todo texto que vaya a leer un cliente: páginas, formularios, labels, textos de ayuda,
**mensajes de error**, emails transaccionales, copy de Gina, metadata visible.

Todo texto que **no** lo lea un cliente queda fuera: comentarios de código, nombres de
variables y funciones (en inglés, `CLAUDE.md` §6), commits, documentación interna de `/docs`.

## Fuente de verdad

`docs/contexto-estrategico.md` §10 → "Tono y voz de marca" (líneas 393-398).
**Esta skill no lo duplica: lo aplica.** Si hay contradicción, manda el doc. Si el doc
cambia, esta skill no necesita cambiar — solo relee.

Complemento visual: `DESIGN.md` §7 ("Hacer" / "No hacer") repite la regla de persona.

## Las cuatro reglas duras

1. **"Tú" neutro, español internacional.** Nunca "vos", nunca "vosotros", nunca "ustedes"
   como tratamiento de cortesía. Segunda persona del singular: "Te buscamos", "Estás en el
   lugar correcto".
2. **Directo.** El cliente emigrante no tiene tiempo. Frase corta antes que subordinada.
3. **Empático, no compasivo.** Entiende lo que cuesta emigrar y buscar piso siendo
   extranjero. No lo dramatiza ni lo convierte en storytelling.
4. **Nunca corporativo, frío ni genérico.** Sin "estimado usuario", sin "su solicitud ha
   sido procesada exitosamente", sin "nos comprometemos a ofrecerle".

## El "vos" que NO se corrige

`CLAUDE.md` §6.1 dice, literal: *"Cliente = 'tú' neutro. Nunca 'vos' **con el cliente**"*.

Ese matiz importa. `docs/contexto-estrategico.md` y buena parte de `/docs` están escritos en
rioplatense ("Actuás como consultor", "Qué podés hacer") porque son documentos internos.
**Eso está bien y no se toca.** La regla aplica a lo que sale publicado, no al repo entero.

Antes de "corregir" un "vos": preguntate quién lee ese texto.

## Ejemplos del propio proyecto

Copy real, ya publicado, que aplica bien la voz:

| Bien | Por qué |
|---|---|
| "Vamos a conocernos" | Invitación, no conversión. Plural inclusivo sin tratamiento formal |
| "Encuentra a tu gente en Galicia" | Imperativo en "tú", concreto, cero jerga |
| "No te pedimos tu dirección exacta ni el número de tu casa" | Dice qué NO hace antes de pedir el dato. Desarma el miedo sin nombrarlo |
| "Tu número no se muestra en el mapa. Quien te vea podrá escribirte igual" | Afirma el límite y ofrece la salida en la misma respiración (commit `3a13a97`) |

Y el contraste:

| Mal | Por qué |
|---|---|
| "Estimado usuario, su registro ha sido completado" | Corporativo, usted, voz pasiva |
| "¡Ups! Algo salió mal 😅" | Genérico de plantilla. Falso cercano |
| "Rellena el formulario y os contactaremos" | "Vosotros" peninsular |
| "Optimizamos tu experiencia de relocation" | Jerga vacía |

## Mensajes de error — donde más se rompe

Es el texto que más se escribe en piloto automático y el que más se lee en un mal momento.
Un error dice **qué pasó** y **qué hacer ahora**, en ese orden, sin culpar a la persona.

- Bien: *"No pudimos ubicar esa intersección. Revisa los nombres de las calles."*
- Mal: *"Error de validación: dirección inválida."*

## Checklist antes de dar copy por terminado

- [ ] ¿Hay algún "vos", "vosotros" o "usted" en texto que lea un cliente?
- [ ] ¿Se entiende leyéndolo una sola vez?
- [ ] ¿Sobra alguna frase entera? (casi siempre sí)
- [ ] ¿Los mensajes de error dicen qué hacer, no solo qué falló?
- [ ] ¿Lo diría Silvana en voz alta, hablándole a una familia por videollamada?

La última es la que más filtra.
