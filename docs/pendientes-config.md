# Pendientes de configuración — Tu Lugar en Galicia

Lista de revisión para pasar del scaffold al sitio real en producción.
Cada ítem tiene su estado actual, qué hay que hacer y dónde se hace.

**Última actualización:** 2026-05-29

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

## Checklist de lanzamiento

- [ ] Número de WhatsApp real en `lib/config/site.ts`
- [ ] Enlace de Cal.com real en `lib/config/site.ts`
- [ ] Dominio propio apuntando al sitio (no `.vercel.app`)
- [ ] WhatsApp Business configurado
- [ ] Variables de entorno cargadas en Vercel (Fase 1)
- [ ] Google Sheet de El Marcador creada y conectada
- [ ] Página de política de privacidad publicada y enlazada desde el formulario
- [ ] Logo renombrado sin espacios y en formato PNG con transparencia
