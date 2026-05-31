# Pendientes de configuración — Tu Lugar en Galicia

Lista de revisión para pasar del scaffold al sitio real en producción.
Cada ítem tiene su estado actual, qué hay que hacer y dónde se hace.

**Última actualización:** 2026-05-30

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
| **Variables de Fase 1** | `AIRTABLE_API_KEY` (o `GOOGLE_SHEETS_CLIENT_EMAIL` + `GOOGLE_SHEETS_PRIVATE_KEY`), `SHEET_MARCADOR_ID` |
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

## Decisiones pendientes de Avoa (Fase 4)

Estos ítems deben resolverse antes de que el `AI Engineer` arranque la construcción del widget.
Fuentes de referencia: `/docs/avoa-flujo.md` y `/docs/avoa-barandas.md`.

---

### A4-1. Filtro económico real (quién pasa el cuestionario)

| Campo | Detalle |
|---|---|
| **Estado actual** | Sin definir. `avoa-barandas.md` advierte que exigir "8–9 meses por adelantado" puede ser demasiado alto frente a lo habitual en España (fianza 1–2 meses + primer mes + acreditar ingresos ~3× la renta). |
| **Qué decidir** | Confirmar con Silvana cuál es el umbral real de solvencia que Avoa usa para calificar un lead. ¿Se acepta a quien acredite ingresos 3× la renta? ¿Se requieren ahorros equivalentes a X meses? ¿Cambia según la ciudad? |
| **Impacto** | Define el texto de la Pregunta 10 del flujo y la lógica de la ruta de descalificación elegante (Ajuste B de `avoa-barandas.md`). Sin esto el `AI Engineer` no puede codificar el filtro. |
| **Dónde registrar** | Actualizar `docs/avoa-flujo.md` (P10) una vez acordado con Silvana. |

---

### A4-2. Hoja de Ruta de Integración — generación automática

| Campo | Detalle |
|---|---|
| **Estado actual** | El flujo promete al usuario una "Hoja de Ruta de Integración personalizada" al cerrar el cuestionario, pero la lógica de generación no está especificada. |
| **Qué decidir** | Definir qué contiene la Hoja de Ruta (secciones, datos que la personalizan) y cómo se entrega (PDF generado, email con template, respuesta del propio chat). |
| **Impacto** | Es una función a desarrollar dentro del bloque Avoa. Sin especificación el `AI Engineer` no puede construirla. Puede ser tan simple como un email template con los módulos relevantes según las respuestas, o tan complejo como un PDF generado en servidor. |
| **Dónde registrar** | Crear `docs/avoa-hoja-de-ruta.md` cuando esté definido, y enlazarlo desde `docs/roadmap.md` Fase 4. |

---

### A4-3. Persistencia de leads — mismo destino que el formulario

| Campo | Detalle |
|---|---|
| **Estado actual** | El formulario de diagnóstico guarda leads via `lib/leads.ts` → Airtable. Avoa todavía no tiene destino definido. |
| **Decisión tomada** | Avoa debe guardar los datos capturados en el **mismo destino** que el formulario (`lib/leads.ts` / Airtable). No crear una base de datos separada ni una tabla nueva. |
| **Instrucción para el AI Engineer** | Reutilizar o extender `lib/leads.ts` para el volcado del chat. Si Airtable necesita campos nuevos (p. ej. `canal: "avoa"`), agregarlos a la tabla existente, no crear una nueva. |
| **Dónde** | `lib/leads.ts` + tabla de Airtable existente (Fase 1). |

---

### A4-4. Modelo de IA — Claude vs. Gemini (sin decidir)

| Campo | Detalle |
|---|---|
| **Estado actual** | La documentación asume Claude (Anthropic API), pero la elección no está confirmada. |
| **Qué decidir** | Evaluar costo a escala antes de elegir. Los pasos `[llm]` del flujo son los únicos que consumen tokens; el resto son botones (0 tokens). Estimar el volumen de leads mensual esperado y calcular costo por conversación en Claude Haiku vs. Gemini Flash. |
| **Criterios relevantes** | Costo por token, calidad en español, latencia, límites de rate, facilidad de integración con el stack Next.js existente. |
| **Impacto** | Afecta la variable de entorno (`ANTHROPIC_API_KEY` vs. `GEMINI_API_KEY`), el cliente SDK en `lib/ai/` y el System Prompt (las barandas de `avoa-barandas.md` son agnósticas al modelo). |
| **Dónde registrar** | Documentar la decisión como ADR-008 en `docs/ARCHITECTURE.md` antes de que el `AI Engineer` empiece. |

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
