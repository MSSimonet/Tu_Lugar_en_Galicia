# Backlog Fase 1 — Sitio de marketing + SEO
**Proyecto:** Tu Lugar en Galicia
**Fase:** 1 — Sitio de marketing + SEO (sin base de datos)
**Fuentes:** `PRD-fase-1.md`, `roadmap.md`, `CLAUDE.md`
**Última actualización:** 2026-05-29
**Estado:** Pendiente de ejecución

> Ninguna tarea pasa a "hecho" sin cumplir su criterio explícito.
> El orden de ejecución sugerido sigue el `roadmap.md` §Fase 1.

---

## Sección 1 — Páginas

### T1.1 — Página Home
- **Ruta / archivo:** `app/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página raíz que ensambla en orden vertical los 9 bloques descritos en PRD §2 (Hero, Métricas, El Marcador, Cómo funciona resumen, Ciudades cards, Feed Instagram, Muro de llaves, Testimonios, CTA final). Usa solo componentes de `/components` y tokens del design system.
- **Criterio de hecho:** La página renderiza todos los bloques en móvil (375 px) y escritorio (1280 px) sin errores de consola; todos los CTAs enlazan a sus rutas correctas.

### T1.2 — Página Ciudad: Vigo
- **Ruta / archivo:** `app/ciudades/vigo/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página de ciudad con intro local, precios orientativos de alquiler, CTA al formulario de diagnóstico y FAQ local específica de Vigo. Reutiliza el layout de ciudad compartido.
- **Criterio de hecho:** La página existe en `/ciudades/vigo`, responde con HTTP 200, muestra contenido específico de Vigo y el CTA dirige a `/diagnostico`.

### T1.3 — Página Ciudad: A Coruña
- **Ruta / archivo:** `app/ciudades/a-coruna/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Ídem T1.2 con contenido específico de A Coruña. La URL usa slug sin tilde (`a-coruna`) conforme al PRD §1.
- **Criterio de hecho:** La página existe en `/ciudades/a-coruna`, responde con HTTP 200, muestra contenido específico de A Coruña.

### T1.4 — Página Ciudad: Santiago de Compostela
- **Ruta / archivo:** `app/ciudades/santiago-de-compostela/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Ídem T1.2 con contenido específico de Santiago de Compostela.
- **Criterio de hecho:** La página existe en `/ciudades/santiago-de-compostela`, responde con HTTP 200, muestra contenido específico de Santiago.

### T1.5 — Página Ciudad: Pontevedra
- **Ruta / archivo:** `app/ciudades/pontevedra/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Ídem T1.2 con contenido específico de Pontevedra.
- **Criterio de hecho:** La página existe en `/ciudades/pontevedra`, responde con HTTP 200, muestra contenido específico de Pontevedra.

### T1.6 — Página Ciudad: Lugo
- **Ruta / archivo:** `app/ciudades/lugo/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Ídem T1.2 con contenido específico de Lugo.
- **Criterio de hecho:** La página existe en `/ciudades/lugo`, responde con HTTP 200, muestra contenido específico de Lugo.

### T1.7 — Página Cómo funciona
- **Ruta / archivo:** `app/como-funciona/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página que explica el proceso en 6 pasos con tiempos estimados por etapa. Incluye CTA al formulario de diagnóstico al final.
- **Criterio de hecho:** La página existe en `/como-funciona`, muestra los 6 pasos con sus tiempos, y el CTA final enlaza a `/diagnostico`.

### T1.8 — Página Sobre Silvana
- **Ruta / archivo:** `app/sobre-silvana/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página con la historia personal de Silvana como emigrante con raíces gallegas. Incluye foto, texto biográfico y enlace a agenda.
- **Criterio de hecho:** La página existe en `/sobre-silvana`, renderiza correctamente en móvil y escritorio, e incluye al menos un CTA funcional.

### T1.9 — Página FAQ
- **Ruta / archivo:** `app/faq/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página con 15-20 preguntas frecuentes en formato acordeón o lista expandible, orientadas a SEO. Contenido provisto por Content Creator.
- **Criterio de hecho:** La página existe en `/faq`, muestra 15 preguntas como mínimo, tiene schema FAQPage válido aplicado (coordinado con T4.4), y es indexable.

### T1.10 — Página Diagnóstico
- **Ruta / archivo:** `app/diagnostico/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página que contiene el formulario de viabilidad completo (20 campos + consentimiento RGPD). Conecta con la API route `POST /api/lead`. Muestra mensaje de confirmación post-envío.
- **Criterio de hecho:** La página existe en `/diagnostico`, el formulario es funcional end-to-end (envío guarda en Airtable/Sheets), muestra confirmación tras envío exitoso, y el consentimiento RGPD es requerido para poder enviar.

### T1.11 — Página Agenda
- **Ruta / archivo:** `app/agenda/page.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Página que embebe el widget de Cal.com para reserva de videollamada. El embed debe ser responsive y funcional en móvil.
- **Criterio de hecho:** La página existe en `/agenda`, el widget de Cal.com carga y permite seleccionar horario, funciona correctamente en móvil (375 px).

---

## Sección 2 — Componentes de la Home

### T2.1 — Componente Hero
- **Ruta / archivo:** `components/home/Hero.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Titular que nombra Galicia explícitamente, subtítulo de propuesta de valor, 2 CTAs principales: "Agenda tu videollamada" (enlaza a `/agenda`) y "Escribinos por WhatsApp" (enlaza a `wa.me` con mensaje predefinido).
- **Criterio de hecho:** El Hero renderiza los 2 CTAs funcionales; se ve sin scroll en viewport de 375 px y 1280 px; el titular contiene la palabra "Galicia".

### T2.2 — Componente Métricas
- **Ruta / archivo:** `components/home/Metricas.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Tres cifras clave con etiquetas: "+200 familias reubicadas", "4 años de experiencia", "57 familias en 2025". Valores hardcoded en esta fase (se dinamizan en fases posteriores si corresponde).
- **Criterio de hecho:** El componente muestra las 3 métricas con sus etiquetas; es legible en móvil sin overflow.

### T2.3 — Componente El Marcador
- **Ruta / archivo:** `components/home/ElMarcador.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Panel con 4 contadores del mes en curso: anuncios contactados, propietarios que dijeron no, familias ubicadas, tiempo medio. Lee los datos desde la API route `/api/marcador` (que consume Google Sheets — implementada en T5.1). Incluye estado de carga y fallback ante error.
- **Criterio de hecho:** El componente muestra los 4 contadores con datos reales de la Sheet; ante fallo de la Sheet, muestra un fallback visible (no pantalla en blanco ni error de consola).

### T2.4 — Componente Cómo funciona (resumen)
- **Ruta / archivo:** `components/home/ComoFuncionaResumen.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Resumen visual de 5-6 pasos del proceso (íconos + etiqueta + descripción corta). Enlace "Ver cómo funciona en detalle" al final que dirige a `/como-funciona`.
- **Criterio de hecho:** El componente renderiza entre 5 y 6 pasos; el enlace funciona; se ve correctamente en móvil.

### T2.5 — Componente Ciudades Cards
- **Ruta / archivo:** `components/home/CiudadesCards.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Grilla de 5 cards, una por ciudad (Vigo, A Coruña, Santiago, Pontevedra, Lugo). Cada card tiene imagen representativa, nombre de ciudad y enlace a la página de ciudad correspondiente.
- **Criterio de hecho:** Las 5 cards se muestran y cada una enlaza a su ruta correcta (`/ciudades/[slug]`); la grilla es responsive (1 columna en móvil, 3+ en escritorio).

### T2.6 — Componente Feed de Instagram
- **Ruta / archivo:** `components/home/FeedInstagram.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Widget embebido de Behold (o solución equivalente aprobada) que muestra las últimas publicaciones del Instagram de Tu Lugar en Galicia. El token/widget ID se lee de variable de entorno.
- **Criterio de hecho:** El feed muestra al menos 6 publicaciones recientes; carga sin bloquear el render del resto de la página (lazy o asíncrono); no expone tokens en el cliente.

### T2.7 — Componente Muro de llaves (preview)
- **Ruta / archivo:** `components/home/MuroLlavesPreview.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Grilla de 6-9 fotos de entregas de llaves (imágenes estáticas en `/public` en esta fase). Incluye enlace "Ver todas" que apunta a la página o sección completa (puede ser un anchor o ruta futura).
- **Criterio de hecho:** El componente muestra entre 6 y 9 fotos; el enlace existe; las imágenes tienen atributo `alt` descriptivo; se ve correctamente en móvil.

### T2.8 — Componente Testimonios
- **Ruta / archivo:** `components/home/Testimonios.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Carrusel o grilla de testimonios. Cada testimonio incluye foto del cliente, nombre, ciudad de origen y ciudad de destino en Galicia, y texto del testimonio.
- **Criterio de hecho:** El componente muestra al menos 3 testimonios con foto, nombre, ciudades y texto; es funcional en móvil (navegable si es carrusel); las fotos tienen `alt`.

### T2.9 — Componente CTA Final + WhatsApp flotante
- **Ruta / archivo:** `components/home/CTAFinal.tsx` + `components/shared/WhatsAppFlotante.tsx`
- **Agente:** Frontend Developer
- **Qué renderiza:** Bloque CTA al final de la home (título motivacional + botón a `/diagnostico` o `/agenda`). Botón flotante de WhatsApp presente en todas las páginas (implementado en el layout raíz), con mensaje predefinido en el enlace `wa.me`.
- **Criterio de hecho:** El CTA final es visible al llegar al final del scroll en home; el botón flotante de WhatsApp aparece en todas las páginas (incluyendo las de ciudad y FAQ); el enlace `wa.me` abre con mensaje predefinido.

---

## Sección 3 — Formulario de diagnóstico

### T3.1 — Frontend del formulario (20 campos + consentimiento RGPD)
- **Ruta / archivo:** `components/diagnostico/FormularioDiagnostico.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Formulario React con los 20 campos del PRD §3. Tipos de campo por requisito: texto, email, número, fecha, select, multi-select, radio. Validación en cliente (campos requeridos, formato email). El checkbox de consentimiento RGPD (campo 20) es obligatorio para habilitar el botón de envío; incluye enlace a la política de privacidad. Estados de UI: idle, cargando (botón deshabilitado), éxito (mensaje de confirmación), error.
- **Criterio de hecho:** El formulario renderiza los 20 campos con sus tipos correctos; no se puede enviar sin consentimiento RGPD marcado; muestra mensaje de confirmación ("Recibimos tu consulta, te respondemos en 48 h hábiles") tras envío exitoso; muestra mensaje de error si la API falla.

### T3.2 — API route backend: POST /api/lead
- **Ruta / archivo:** `app/api/lead/route.ts`
- **Agente:** Backend Architect
- **Qué construir:** API route de Next.js que recibe el payload del formulario, valida los campos requeridos en servidor, y escribe el lead en Airtable o Google Sheets (según decisión de implementación). Devuelve `{ success: true }` o `{ error: string }` con códigos HTTP apropiados. La clave de API de Airtable/Sheets se lee solo de variables de entorno de servidor.
- **Criterio de hecho:** Un POST válido con todos los campos requeridos crea un registro en Airtable/Sheets y devuelve HTTP 200; un POST sin campos requeridos devuelve HTTP 400; la clave de API no aparece en ningún bundle del cliente ni en logs de red.

### T3.3 — Integración con Airtable / Google Sheets
- **Ruta / archivo:** `lib/leads.ts`
- **Agente:** Backend Architect
- **Qué construir:** Módulo con la función `saveLead(data)` que abstrae la escritura en Airtable o Google Sheets. Importado desde `app/api/lead/route.ts`. Incluye manejo de errores y un log mínimo del resultado (sin datos personales en los logs).
- **Criterio de hecho:** La función `saveLead` escribe correctamente en el destino configurado; si falla la integración externa, lanza un error que la API route convierte en HTTP 500; no loguea datos personales del lead.

---

## Sección 4 — SEO técnico

### T4.1 — Metadata por página
- **Ruta / archivo:** Archivos `layout.tsx` y `page.tsx` de cada ruta
- **Agente:** SEO Specialist
- **Qué construir:** `<title>` y `<meta description>` únicos para cada una de las 11 páginas, con la keyword local correspondiente (según keywords primarias del PRD §4). Usar la API de metadata de Next.js App Router (`export const metadata` o `generateMetadata`).
- **Criterio de hecho:** Cada una de las 11 páginas tiene `<title>` y `<meta description>` únicos y distintos entre sí; al menos las 5 páginas de ciudad incluyen la keyword "relocation [ciudad]" en el title; validado con herramienta de inspección (DevTools o Screaming Frog).

### T4.2 — sitemap.ts
- **Ruta / archivo:** `app/sitemap.ts`
- **Agente:** SEO Specialist
- **Qué construir:** Archivo `sitemap.ts` de Next.js que genera el `sitemap.xml` dinámicamente con las 11 URLs de la Fase 1. Incluir `lastModified` y `priority` apropiados por tipo de página.
- **Criterio de hecho:** `https://[dominio]/sitemap.xml` responde con XML válido que contiene las 11 URLs; validado con Google Search Console o validador de sitemap online.

### T4.3 — robots.ts
- **Ruta / archivo:** `app/robots.ts`
- **Agente:** SEO Specialist
- **Qué construir:** Archivo `robots.ts` de Next.js que genera `robots.txt`. Permite indexación de todas las rutas públicas; bloquea `/api/` explícitamente. Referencia al sitemap.
- **Criterio de hecho:** `https://[dominio]/robots.txt` responde con contenido válido; contiene `Disallow: /api/`; contiene la URL del sitemap; no bloquea las 11 páginas públicas.

### T4.4 — Schema.org: LocalBusiness + FAQPage + Service
- **Ruta / archivo:** `lib/seo/schemas.ts` + integración en páginas correspondientes
- **Agente:** SEO Specialist
- **Qué construir:** Tres schemas JSON-LD: `LocalBusiness` (en home y páginas de ciudad) con nombre, descripción, área de servicio y datos de contacto; `FAQPage` (en `/faq`) con las preguntas y respuestas; `Service` (en `/como-funciona`) describiendo el servicio de relocation. Inyectados como `<script type="application/ld+json">` en las páginas correspondientes.
- **Criterio de hecho:** Los tres schemas son válidos según Google Rich Results Test; el `LocalBusiness` aparece en home y en al menos una página de ciudad; el `FAQPage` aparece en `/faq`; el `Service` aparece en `/como-funciona`.

---

## Sección 5 — Integraciones

### T5.1 — El Marcador: lectura de Google Sheets
- **Ruta / archivo:** `app/api/marcador/route.ts` + `lib/marcador.ts`
- **Agente:** Backend Architect
- **Qué construir:** API route `GET /api/marcador` que lee los 4 valores del Marcador de una Google Sheet pública (o vía Google Sheets API con clave de servidor). Devuelve JSON con los 4 campos. Incluir caché de corta duración (ej. revalidación cada 60 minutos con `next: { revalidate: 3600 }`) para no golpear la API en cada request.
- **Criterio de hecho:** `GET /api/marcador` devuelve JSON con los 4 campos numéricos; el componente T2.3 consume esta API y muestra datos reales; Silvana puede actualizar la Sheet y los cambios se reflejan en la web sin tocar código (en el plazo del caché).

### T5.2 — Feed de Instagram (Behold)
- **Ruta / archivo:** `components/home/FeedInstagram.tsx` (implementación en T2.6)
- **Agente:** Frontend Developer
- **Qué construir:** Integración del widget de Behold mediante el script embed o el componente React de Behold. El widget ID se configura como variable de entorno pública (`NEXT_PUBLIC_BEHOLD_WIDGET_ID`). Carga diferida para no penalizar el LCP.
- **Criterio de hecho:** El feed carga correctamente en producción (Vercel) con posts reales del Instagram; la variable de entorno está documentada en `.env.local.example`; no bloquea la carga de la página (carga asíncrona verificada en Network tab).

### T5.3 — Agenda Cal.com
- **Ruta / archivo:** `app/agenda/page.tsx` (implementación en T1.11) + `components/shared/CalEmbed.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Componente que embebe el widget de Cal.com usando el método de embed oficial (script o `@calcom/embed-react`). Responsive. Reutilizable desde los CTAs de otras páginas (Hero, CTA final, páginas de ciudad).
- **Criterio de hecho:** El widget de Cal.com carga en `/agenda`; permite seleccionar fecha y hora y completa el flujo de reserva; se puede embeber desde otras páginas mediante el componente compartido; funciona en móvil.

### T5.4 — WhatsApp flotante
- **Ruta / archivo:** `components/shared/WhatsAppFlotante.tsx` + integración en `app/layout.tsx`
- **Agente:** Frontend Developer
- **Qué construir:** Botón flotante (fixed, esquina inferior derecha) con ícono de WhatsApp que enlaza a `wa.me/[numero]?text=[mensaje-predefinido-urlencode]`. El número y el mensaje predefinido se configuran como constante o variable de entorno. Presente en todas las páginas vía el layout raíz.
- **Criterio de hecho:** El botón es visible en todas las páginas de la web; al hacer clic abre WhatsApp (web o app) con el mensaje predefinido cargado; el número de teléfono está en variable de entorno (no hardcodeado en el componente); no interfiere con la navegación ni el formulario.

---

## Sección 6 — Puerta de calidad

### T6.1 — Auditoría de accesibilidad
- **Ruta / archivo:** Revisión sobre el build de producción
- **Agente:** Accessibility Auditor
- **Qué construir:** Auditoría completa de accesibilidad sobre las 11 páginas de la Fase 1: contraste de colores, navegación por teclado, atributos ARIA, etiquetas de formulario, textos alternativos de imágenes. Reportar hallazgos y bloquear el avance si hay issues de severidad alta.
- **Criterio de hecho:** Lighthouse Accesibilidad ≥ 95 en móvil en todas las páginas; todos los campos del formulario tienen `<label>` asociado; todas las imágenes funcionales tienen `alt`; ningún issue de contraste AA sin resolver.

### T6.2 — Auditoría de performance (Lighthouse)
- **Ruta / archivo:** Revisión sobre el build de producción en Vercel
- **Agente:** Performance Benchmarker
- **Qué construir:** Medición de Lighthouse en móvil sobre las páginas críticas (home, diagnóstico, al menos 2 ciudades). Verificar los tres umbrales del PRD §6: SEO ≥ 95, Accesibilidad ≥ 95, Performance ≥ 90. Reportar cualquier puntuación por debajo del umbral como bloqueante.
- **Criterio de hecho:** Las páginas auditadas superan los tres umbrales en móvil (Performance ≥ 90, Accesibilidad ≥ 95, SEO ≥ 95); los resultados quedan documentados con capturas o reporte exportado.

### T6.3 — Revisión de código (Code Reviewer)
- **Ruta / archivo:** PRs de todas las tareas de la Fase 1
- **Agente:** Code Reviewer
- **Qué construir:** Revisión de todos los PRs de la fase antes de fusionar a `main`. Verificar: ausencia de claves en el código, TypeScript sin errores (`tsc --noEmit`), componentes siguiendo convenciones de `CLAUDE.md` §6, sin CSS suelto fuera de Tailwind, Conventional Commits cumplidos.
- **Criterio de hecho:** Todos los PRs de la Fase 1 tienen aprobación del Code Reviewer antes de fusionarse; ningún PR con clave de API expuesta, error de TypeScript o CSS inline llega a `main`.

### T6.4 — Certificación de fase (Reality Checker)
- **Ruta / archivo:** Verificación sobre el entorno de producción (dominio real)
- **Agente:** Reality Checker
- **Qué construir:** Verificación end-to-end de todos los criterios de aceptación del PRD §6 sobre el dominio de producción real (no localhost). Emitir certificación escrita de que la fase está completa o lista de bloqueantes a resolver.
- **Criterio de hecho:** El Reality Checker verifica y confirma por escrito que los 9 criterios de aceptación del PRD §6 se cumplen en producción; no se avanza a Fase 2 hasta que esta certificación existe.

---

## Criterios de aceptación de la fase

Extraídos del PRD §6. Todos deben estar verificados por el Reality Checker (T6.4) sobre el entorno de producción antes de declarar la Fase 1 como completada.

- [ ] Las 11 páginas existen, responden con HTTP 200 y se ven correctamente en móvil (375 px) y escritorio (1280 px).
- [ ] El formulario de diagnóstico guarda el lead en Airtable/Sheets y muestra mensaje de confirmación al usuario.
- [ ] El Marcador muestra los números actuales de la Google Sheet sin necesidad de tocar código.
- [ ] El botón flotante de WhatsApp es visible en todas las páginas con mensaje predefinido funcional.
- [ ] La agenda de Cal.com es funcional desde `/agenda` y desde los CTAs de otras páginas.
- [ ] Lighthouse en móvil: SEO ≥ 95, Accesibilidad ≥ 95, Performance ≥ 90 (verificado por Performance Benchmarker y Accessibility Auditor).
- [ ] `sitemap.xml` y `robots.txt` son accesibles públicamente; los schemas JSON-LD son válidos (Google Rich Results Test).
- [ ] El formulario de diagnóstico requiere consentimiento RGPD explícito para enviarse; existe página de política de privacidad enlazada desde el formulario.
- [ ] Todos los PRs de la fase fueron aprobados por Code Reviewer y la fase fue certificada por Reality Checker.
