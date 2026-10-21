# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primarios:** personas, parejas y familias que emigran a Galicia, principalmente
latinoamericanas — argentinas, venezolanas y brasileñas. La situación que las define: **necesitan
tener el alquiler resuelto ANTES de subirse al avión**, desde miles de kilómetros, sin poder
visitar un piso ni presentarse ante un propietario.

El trabajo que vienen a hacer no es "buscar piso". Es conseguir que alguien en Galicia les diga
que sí. Llegan con la búsqueda ya intentada y fallida por su cuenta.

**Secundaria:** Silvana Lorenzo, que opera el servicio y consume los leads desde el panel de
administración.

## Product Purpose

Conseguir vivienda de alquiler en Galicia a familias que emigran, gestionando el proceso completo
a distancia: buscar, visitar, enseñar los pisos por videollamada, acompañar la negociación, lograr
la firma del contrato, recibir la vivienda y esperar a la familia cuando aterriza. Incluye
asesoramiento durante la adaptación posterior a la llegada.

La web existe para captar a esas familias, cualificarlas y llevarlas a una conversación real con
Silvana.

**Éxito de una visita = una videollamada agendada** (Cal.com). El cuestionario de Gina, el
formulario de `/conocernos` y el de `/contacto` son caminos hacia ahí, no destinos. Cualquier
decisión futura de jerarquía, CTA o prioridad se ordena por esto.

## Positioning

**El obstáculo real no es encontrar el piso: es el rechazo.** Por cada cliente, el servicio
contacta unos 80 anuncios y **78 dicen que no** — la barrera del racismo inmobiliario contra
inquilinos migrantes. El producto no compite contra un portal inmobiliario; existe para atravesar
una puerta que está cerrada de antemano.

Lo que un competidor vecino no podría copiar con verdad:

- **Pionera en Galicia.** Primer servicio de relocation estructurado de la comunidad, operando
  desde 2021. De 16 competidores analizados en España, es la única especialista en Galicia; el
  resto se concentra en Valencia, Madrid, Barcelona y Alicante.
- **Cobertura de toda la comunidad**, no de una sola ciudad: Vigo, A Coruña, Santiago de
  Compostela, Pontevedra y Lugo.
- **Interlocución institucional.** Ha trasladado el problema del rechazo a inquilinos migrantes a
  la Secretaría Xeral de Emigración de la Xunta de Galicia.
- **Historia personal que coincide con la del cliente.** Silvana es argentina de padre coruñés y
  madre italiana, emigrante ella misma; empezó ayudando a una amiga.
- **Red de contactos construida en cuatro años** con propietarios e inmobiliarias locales. Es el
  activo que hace posible el "sí" y no se replica con dinero ni con software.

## Operating Context

- La decisión se toma **antes de viajar**. El usuario no puede visitar, no tiene NIE, con
  frecuencia no tiene aún cuenta bancaria española ni contrato laboral en España.
- El servicio lo **opera Silvana sola**. La capacidad es humana y limitada: 57 familias ubicadas
  en 2025.
- El canal histórico es **Instagram** (@tulugarengalicia, 4.729 seguidores, 286 posts). La web es
  nueva: hasta ahora el negocio no tenía sitio propio.
- Los competidores del sector operan mayoritariamente por Instagram y WhatsApp: 10 de 16 no tienen
  web profesional.
- Fase posterior a la llegada: acompañamiento de adaptación, y una **Comunidad de Acogida** —
  mapa de residentes que se ofrecen a recibir a quien acaba de llegar.

## Capabilities and Constraints

**Capacidades en producción**

- **Gina**, cuestionario conversacional determinista (no es un chat abierto: recorre `flow.json`).
  Cualifica al lead, lo guarda en Supabase y dispara un Plan Estratégico en PDF por email.
- **Agenda** de videollamada con Cal.com embebido.
- **Formularios** de diagnóstico largo (`/conocernos`) y de contacto breve (`/contacto`).
- **Cinco páginas de ciudad** con clima real (AEMET), video y alquileres orientativos.
- **Comunidad de Acogida**: alta con verificación por email, mapa con ubicación aproximada,
  mensajes privados entre miembros y teléfono con opt-in explícito.
- **Apps útiles** y números de emergencia por ciudad.
- **Panel de administración** para Silvana (CRM de leads).

**Restricciones que el trabajo futuro debe preservar**

- **RGPD, jurisdicción UE.** Todo formulario exige consentimiento explícito con enlace a la
  política de privacidad. El mapa de comunidad **nunca muestra calle ni número exacto**, solo una
  zona aproximada, y solo de quien dio permiso.
- **La ubicación de una persona es dato sensible.** Ya condicionó decisiones reales: las fotos
  subidas se sanean para borrarles el GPS del EXIF, y el teléfono es opt-in por columna de base de
  datos, no por lógica de cliente.
- **Stack bloqueado**, documentado en `CLAUDE.md` §2. No se proponen alternativas sin un ADR.
- **Idioma:** español. Portugués e inglés están planificados para Fase 6, sin implementar.
- Las **migraciones de base de datos se ejecutan a mano** en el panel de Supabase; ninguna
  automatización las aplica.
- **Pagos (Stripe): no implementados.** Planificados para Fase 6.

**Decisiones abiertas** — registradas como abiertas, no inventadas:

- Modelo de precios: no hay tarifa publicada en el sitio ni definida en la documentación.
- Oferta corporativa B2B: identificada como hueco de mercado, sin decisión tomada.

## Brand Commitments

- **Nombre:** Tu Lugar en Galicia. **Fundadora y cara del servicio:** Silvana Lorenzo.
- **Voz:** vinculante y ya codificada en la skill `voz-tu-lugar-en-galicia`. Al cliente se le habla
  de **"tú" neutro — nunca "vos"**, pese a que la fundadora y buena parte del público son
  rioplatenses. Cálida y directa, nunca corporativa.
- **Sistema visual:** existe y está documentado en `DESIGN.md` ("Diseño Deslumbrante"). Este
  archivo no lo toca ni lo reemplaza.
- **Instagram** es el canal con historia y prueba social acumulada; la web no lo sustituye.

## Evidence on Hand

**Real y utilizable**

- Más de 200 familias reubicadas en cuatro años; 57 solo en 2025.
- La proporción 80 anuncios contactados / 78 negativas por cliente.
- Cobertura en **El Correo Gallego** (enero de 2026) — único competidor del análisis con prensa
  regional.
- Interlocución con la Secretaría Xeral de Emigración de la Xunta de Galicia.
- Instagram: 4.729 seguidores, 286 posts documentando entregas de llaves y pisos visitados.
- **Los tres testimonios del home son de clientes reales, publicados con los nombres cambiados**
  (confirmado 2026-08-12). No son relleno: nadie debe "corregirlos" pensando que lo son. Tampoco
  deben presentarse como identidades verificables.

**Ausencias que NO se deben rellenar inventando**

- **Las fotos de testimonios, de Silvana y del Muro de Llaves son placeholder** (hallazgo A14 de
  `CLAUDE.md`). Hay que sustituirlas por material real antes del lanzamiento público; no se generan
  ni se sustituyen por imágenes de stock que simulen clientes.
- No existen testimonios adicionales, casos de estudio, benchmarks, tarifas ni cifras de conversión
  más allá de los listados arriba. No se inventan.

## Product Principles

1. **La videollamada es el destino.** Gina, `/conocernos` y `/contacto` son rutas hacia ella. Ante
   una duda de jerarquía o de CTA, gana lo que acerque a agendar.
2. **El producto vende un "sí", no un catálogo.** El valor está en atravesar el rechazo (78 de 80),
   no en mostrar pisos. Cualquier deriva hacia "portal inmobiliario" contradice el negocio.
3. **La prueba social se documenta, no se fabrica.** El activo es material real acumulado en cuatro
   años; un testimonio inventado destruiría justo aquello por lo que alguien confía en el servicio.
4. **La privacidad de la ubicación es parte del producto**, no una casilla legal. Aproximación
   siempre, precisión nunca, opt-in explícito para todo dato de contacto.
5. **Quien llega está bajo estrés y a distancia.** Emigrar con la vivienda sin resolver es la
   situación; el tono y las decisiones de producto acompañan eso en vez de añadir fricción.

## Accessibility & Inclusion

**Necesidades de usuario confirmadas:** público mayoritariamente latinoamericano, en español,
consultando desde otro continente, con proporción alta de uso móvil y conexiones variables.

**Estándar aplicado de facto:** el proyecto viene midiendo y corrigiendo contra **WCAG 2.2 nivel
AA** — contraste, tamaño de objetivos táctiles, navegación por teclado, foco visible, errores de
formulario anunciados. Hay auditorías con mediciones reales en `CLAUDE.md` y correcciones ya
aplicadas.

**Decisión abierta — la base de esa exigencia no está confirmada.** Se preguntó el 2026-08-12 y no
hay respuesta: no se sabe si WCAG AA es aquí una obligación legal o un estándar de calidad
autoimpuesto. **No se inventa una base legal.** El dato relevante para resolverlo: la *European
Accessibility Act* obliga desde junio de 2025 a los servicios dirigidos a consumidores en la UE, y
este servicio podría entrar en su ámbito. Conviene confirmarlo con asesoría antes del lanzamiento
público, porque cambia si el estándar es negociable o no.
