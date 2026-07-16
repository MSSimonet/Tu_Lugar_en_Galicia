# Pendientes de configuración — Tu Lugar en Galicia

Lista de revisión para pasar del scaffold al sitio real en producción.
Cada ítem tiene su estado actual, qué hay que hacer y dónde se hace.

**Última actualización:** 2026-06-28

---

## 1. Número de WhatsApp

| Campo | Detalle |
|---|---|
| **Estado actual** | Placeholder hardcodeado en el código |
| **Qué hacer** | Reemplazar el número por el real (con código de país, sin espacios, ej. `5491112345678`) |
| **Dónde** | `lib/config/site.ts` → constante `WHATSAPP_NUMBER` y `WHATSAPP_MESSAGE` (mensaje predefinido) |

---

## 2. Enlace de Cal.com

| Campo | Detalle |
|---|---|
| **Estado actual** | Placeholder / sin cuenta de Cal.com conectada |
| **Qué hacer** | Crear cuenta en [cal.com](https://cal.com), configurar el tipo de evento (videollamada de 30 min), copiar el slug del calendario |
| **Dónde** | `lib/config/site.ts` → constante `CALCOM_LINK` (ej. `"https://cal.com/silvana-lorenzo/videollamada"`) |

---

## 3. Dominio propio (Cloudflare → Vercel)

| Campo | Detalle |
|---|---|
| **Estado actual** | El sitio usa URL temporal de Vercel (`.vercel.app`) |
| **Qué hacer** | Registrar el dominio, apuntarlo a Vercel desde Cloudflare DNS, activar proxy y SSL "Full (strict)" |
| **Dónde** | Panel de Vercel (Settings → Domains) + panel de Cloudflare (DNS). Guía paso a paso en `docs/ARCHITECTURE.md §6` |

---

## 4. Migración a WhatsApp Business

| Campo | Detalle |
|---|---|
| **Estado actual** | El enlace `wa.me` funciona con cualquier número de WhatsApp personal |
| **Qué hacer** | Crear cuenta de WhatsApp Business, configurar mensaje de bienvenida automático, respuestas rápidas y horario de atención |
| **Dónde** | App WhatsApp Business (sin cambios en el código — solo actualizar el número en `lib/config/site.ts` ítem 1) |

---

## 5. Variables de entorno en Vercel

| Campo | Detalle |
|---|---|
| **Estado actual** | Definidas como nombres en `.env.local.example`; sin valores reales en Vercel |
| **Qué hacer** | Agregar los valores reales en Vercel → Settings → Environment Variables para los entornos Production y Preview |
| **Variables de Fase 1** | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (leads, migrado desde Airtable el 2026-07-12 — ver `docs/crm-supabase-fase0.md`), `SHEET_MARCADOR_ID` |
| **Dónde** | Panel de Vercel → proyecto → Settings → Environment Variables. Referencia completa en `docs/ARCHITECTURE.md §4` y `.env.local.example` |

---

## 6. Google Sheet de El Marcador

| Campo | Detalle |
|---|---|
| **Estado actual** | La API route `/api/marcador` está implementada pero sin Sheet real conectada |
| **Qué hacer** | Crear una Google Sheet con 4 celdas nombradas: `anuncios_contactados`, `dijeron_no`, `familias_ubicadas`, `tiempo_medio`. Obtener el ID de la hoja y pegarlo en la variable `SHEET_MARCADOR_ID`. Si se usa API privada, crear Service Account en Google Cloud Console y compartir la Sheet con su email. |
| **Dónde** | Google Sheets + Google Cloud Console (Service Account). El ID se carga en Vercel (ítem 5) |

---

## 7. Página de política de privacidad (RGPD)

| Campo | Detalle |
|---|---|
| **Estado actual** | El formulario de diagnóstico enlaza a `/politica-de-privacidad` pero la página no existe todavía |
| **Qué hacer** | Redactar la política de privacidad (responsable del tratamiento: Silvana Lorenzo, datos recogidos, finalidad, derechos ARCO, plazo de conservación) y crear la página en `app/politica-de-privacidad/page.tsx`. Validar con `Legal Compliance Checker` antes de publicar. |
| **Dónde** | Texto en `content/politica-de-privacidad.md` + página en `app/politica-de-privacidad/page.tsx` |

---

## 8. Logo en /public

| Campo | Detalle |
|---|---|
| **Estado actual** | `public/Logo TLG.jpeg` existe pero tiene espacio en el nombre (puede causar problemas en imports) |
| **Qué hacer** | Renombrar a `public/logo-tlg.jpg` o `public/logo-tlg.png` (preferible PNG con fondo transparente para uso en header oscuro). Actualizar cualquier referencia en el código. |
| **Dónde** | Carpeta `public/` + cualquier `<Image>` o `<img>` que lo importe. Si no hay referencias aún, solo renombrar el archivo. |

---

---

## Decisiones pendientes de Gina (Fase 4)

Estos ítems deben resolverse antes de que el `AI Engineer` arranque la construcción del widget.
Fuentes de referencia: `/docs/gina-flujo.md` y `/docs/gina-barandas.md`.

---

### A4-1. Filtro económico real (quién pasa el cuestionario)

| Campo | Detalle |
|---|---|
| **Estado actual** | Cifra de mercado resuelta: lo habitual en España es fianza 1–2 meses + primer mes + acreditar ingresos ~3× la renta. Falta confirmar con Silvana cuáles son sus honorarios de servicio y si ese monto entra como criterio de calificación adicional. |
| **Qué decidir** | Confirmar con Silvana el monto de sus honorarios y si Gina los menciona explícitamente o los deriva a la videollamada. El umbral de solvencia de mercado ya está claro. |
| **Impacto** | Define el texto de la Pregunta 10 del flujo y la lógica de la ruta de descalificación elegante (Ajuste B de `gina-barandas.md`). Sin esto el `AI Engineer` no puede codificar el filtro. |
| **Dónde registrar** | Actualizar `docs/gina-flujo.md` (P10) una vez acordado con Silvana. |

---

### A4-2. Plan Estratégico — definición funcional

| Campo | Detalle |
|---|---|
| **Decisión tomada** | El Plan Estratégico es una hoja de ruta de pasos personalizados según los pendientes que deja la charla con Gina. Ejemplos: si el usuario no tiene NIE → bloque "Cómo obtener el NIE"; si no tiene garantías → bloque "Opciones de aval y seguro de alquiler". Los bloques son condicionales y reutilizables. |
| **A quién se entrega** | A **todos** los usuarios, califiquen o no. A quien sí califica: hoja de ruta para avanzar con Silvana. A quien no califica: el plan muestra sus puntos pendientes como oportunidades de mejora, nunca como rechazo. |
| **Tono para no calificados** | Aplicar principios de Dale Carnegie ("Cómo ganar amigos e influir sobre las personas"): reconocer primero lo positivo del perfil, enmarcar cada pendiente como un paso concreto hacia el objetivo, redactar con calidez y empatía. El usuario debe sentir que recibe ayuda, no una negativa. |
| **Implementación recomendada** | Plantilla con bloques condicionales activados por las respuestas del cuestionario. IA mínima (solo para personalizar el texto del encabezado si hace falta). Briefing detallado a desarrollar por el equipo antes de que el `AI Engineer` empiece. |
| **Estado** | ⚠️ Cuello de botella principal de Gina. Sin el briefing de bloques, el `AI Engineer` no puede construirlo. |
| **Próximo paso** | Silvana y el equipo definen los bloques y condiciones → crear `docs/gina-plan-estrategico.md` → enlazar desde `docs/roadmap.md` Fase 4. |

---

### A4-3. Persistencia de leads — mismo destino que el formulario — ✅ IMPLEMENTADO, migrado a Supabase

| Campo | Detalle |
|---|---|
| **Estado actual** | El formulario de diagnóstico y Gina guardan leads via `lib/leads.ts` → Supabase (tabla `leads`). Migrado desde Airtable el 2026-07-12 — ver `docs/crm-supabase-fase0.md`. |
| **Decisión tomada** | Gina guarda los datos capturados en el **mismo destino** que el formulario (`lib/leads.ts` / Supabase). No hay una base de datos separada ni una tabla distinta para cada canal. |
| **Instrucción para el AI Engineer** | Reutilizar o extender `lib/leads.ts` para el volcado del chat. Si se necesitan campos nuevos, usar `campos_custom` (jsonb, sin migración) en vez de una tabla nueva. |
| **Dónde** | `lib/leads.ts` + tabla `leads` en Supabase. |

---

### A4-4. Modelo de IA — ✅ DECIDIDO: Gemini

| Campo | Detalle |
|---|---|
| **Decisión** | **Gemini** (Google), por costo a escala. Las barandas de `gina-barandas.md` son agnósticas al modelo y se reutilizan sin cambios como System Prompt. |
| **Impacto técnico** | Variable de entorno: `GEMINI_API_KEY`. Cliente SDK en `lib/ai/`. Documentado como **ADR-008** en `docs/ARCHITECTURE.md`. |
| **Estado** | ✅ Cerrado. |

---

### A4-5. Documento legal — datos fiscales y objeto del sitio

| Campo | Detalle |
|---|---|
| **Estado actual** | `docs/legal-terminos-privacidad.md` existe pero tiene dos problemas: (1) los datos fiscales del responsable (razón social, dirección, NIF/CIF, email DPO) figuran como `[COMPLETAR]`; (2) la descripción del "objeto del sitio" lo presenta como un directorio turístico genérico, no como un servicio de relocation. |
| **Qué hacer** | (1) Silvana debe proveer sus datos fiscales reales. (2) Reescribir la sección "objeto del sitio" para describir correctamente el servicio de relocation personalizado. Validar con `Legal Compliance Checker` antes de publicar. |
| **Dónde** | `docs/legal-terminos-privacidad.md` → luego volcar a `app/politica-de-privacidad/page.tsx`. |

---

### A4-6. Voz de marca — conversión de textos web a "tú" neutro — ✅ RESUELTO

| Campo | Detalle |
|---|---|
| **Estado** | ✅ Resuelto en commit `ad78c00`. Todos los textos de cara al usuario en `/components`, `/content`, `/app` y `/lib/seo/metadata.ts` convertidos a "tú" neutro. |

---

### A4-7. Honorarios de Silvana en el flujo de Gina — ✅ DECIDIDO

| Campo | Detalle |
|---|---|
| **Decisión** | Gina **no menciona el precio** del servicio. Todo lo relativo a honorarios se deriva a la videollamada con Silvana. |
| **Impacto en el flujo** | El cuestionario no incluye ninguna pregunta ni mención de precio. El cierre de Gina invita a agendar la videollamada sin condicionar el costo. |
| **Estado** | ✅ Cerrado. Reflejar en `docs/gina-flujo.md` sección Cierre cuando se revise ese doc. |

---

### A4-8. Formulario web — respaldo permanente de Gina — ✅ DECIDIDO

| Campo | Detalle |
|---|---|
| **Decisión** | El formulario de diagnóstico (Fase 1) se mantiene como canal de captación secundario **permanente**, no temporal. Gina es el canal principal; el formulario es el respaldo para quienes prefieran no usar el chat. |
| **Impacto** | No hay trabajo adicional de código. Al lanzar Gina, asegurarse de que ambos canales queden visibles en la UI. |
| **Estado** | ✅ Cerrado. |

---

### A4-9. Preguntas filtro de Gina — lógica de etiquetado interno — ✅ DECIDIDO

| Campo | Detalle |
|---|---|
| **Decisión** | Gina **NO corta la conversación** a quien no califica. Completa el cuestionario completo con todos los usuarios para capturar el máximo de datos. La calificación opera a nivel de **etiqueta interna** en la tabla `leads` de Supabase ("califica" / "no califica"), no de corte de la charla. |
| **Beneficio** | Silvana puede priorizar su atención hacia los leads calificados; los no calificados quedan en la base de datos para nurturing futuro y reciben el Plan Estratégico con pasos de mejora (ver A4-2). |
| **Instrucción para el AI Engineer** | Las preguntas P9 y P10 del flujo determinan la etiqueta interna. El flujo no tiene ramas de "cierre prematuro" salvo el límite de 3 desvíos consecutivos ya definido en `gina-barandas.md`. |
| **Estado** | ✅ Cerrado. Documentar las condiciones exactas de etiquetado en `docs/gina-flujo.md` (P9, P10) antes de construir. |

---

### F3-1. Fase 3 — acuerdo de feed con Gadis/Froiz

| Campo | Detalle |
|---|---|
| **Estado actual** | El simulador requiere feed oficial directo de precios de Gadis y Froiz (no scraping). El acuerdo con cada cadena es gestión de Silvana. |
| **MVP posible** | Arrancar con una sola cadena, o con datos cargados manualmente, mientras se negocia el feed completo. |
| **Impacto** | Sin acuerdo de feed, la Fase 3 no puede activarse en producción con datos reales. El código del simulador puede construirse antes con datos de prueba. |
| **Estado** | ⏳ Pendiente de gestión comercial con las cadenas. |

---

## Feed de Instagram (Behold)

**Hablar con Silvana antes de activar.**

Pasos para activar el feed dinámico de Instagram en la home:

1. Silvana entra a behold.so con su cuenta de Instagram Business
2. Crea un widget → copia el `BEHOLD_WIDGET_ID`
3. Añadir en `.env.local` y en Vercel: `NEXT_PUBLIC_BEHOLD_WIDGET_ID=xxxxx`
4. `FeedInstagram.tsx` ya tiene el TODO preparado — cambio de 10 minutos una vez que se tiene el token

**Requisito:** cuenta de Instagram debe ser tipo Business o Creator (no personal).
**Costo:** Behold.so tiene plan gratuito para 1 widget.

---

## Apps útiles (/apps-utiles) — revisión de contenido
- [ ] Revisar si hay apps útiles para recién llegados que no están en lib/config/appsUtiles.ts
      Categorías a repasar: identidad/trámites, salud, empleo, viajes y transporte, clima y hogar,
      más las apps locales por ciudad (Vigo, A Coruña, Santiago, Lugo, Pontevedra)
      Responsable: Silvana (conoce las consultas reales de los clientes)
      Prioridad: media — antes de que la página tenga tráfico real

---

## Rotación de INTERNAL_API_SECRET — 2026-06-28

**Estado:** ✅ Rotado localmente. Pendiente de actualizar en Vercel y GitHub Actions.

El secret fue rotado como parte de la auditoría de seguridad (Fase F).
El valor nuevo está en `.env.local` (gitignoreado — no se expone en el repo).

**Acciones manuales pendientes (Silvana / equipo técnico):**

| Dónde | Qué hacer |
|---|---|
| Vercel → Settings → Environment Variables | Actualizar `INTERNAL_API_SECRET` con el nuevo valor de `.env.local` |
| Vercel → Settings → Environment Variables | Actualizar `CRON_SECRET` si tiene valor diferente (o usar el mismo que `INTERNAL_API_SECRET`) |
| GitHub → repo → Settings → Secrets → Actions | Actualizar secret `INTERNAL_API_SECRET` con el mismo valor |

> ⚠️ Hasta que no se actualice en Vercel y GitHub, el endpoint de recordatorio-silvana y el cron de resumen-diario fallarán en producción.

---

## Checklist de lanzamiento

- [ ] Número de WhatsApp real en `lib/config/site.ts`
- [ ] Enlace de Cal.com real en `lib/config/site.ts`
- [ ] Dominio propio apuntando al sitio (no `.vercel.app`)
- [ ] WhatsApp Business configurado
- [ ] Variables de entorno cargadas en Vercel (Fase 1)
- [ ] Google Sheet de El Marcador creada y conectada
- [ ] Página de política de privacidad publicada y enlazada desde el formulario
- [ ] Logo renombrado sin espacios y en formato PNG con transparencia
