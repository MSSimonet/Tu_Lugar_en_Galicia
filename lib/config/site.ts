// URL del calendario de Cal.com para agendar videollamadas.
// Reemplazar con la URL real del calendario de Silvana en Cal.com.
export const CALCOM_URL = "https://cal.com/tu-lugar-en-galicia/reunion"

// Nombre del sitio (usado en metadata, footer, etc.)
export const SITE_NAME = "Tu Lugar en Galicia"

// URL base del sitio en producción (sin barra final)
export const SITE_URL = "https://tulugarengalicia.com"

// Zona horaria del servicio — España peninsular
export const TIMEZONE = 'Europe/Madrid'

/**
 * Cámara en vivo de las páginas de ciudad (`components/ciudad/VistaEnVivo.tsx`).
 *
 * En `false` el bloque no se monta. NO se oculta con CSS a propósito: `display:none` lo deja
 * en el DOM, sigue en el árbol de accesibilidad según el caso y se descarga igual. Con render
 * condicional no existe.
 *
 * El componente se conserva entero, no se borra: hoy es un placeholder "Próximamente" a la
 * espera de una decisión de producto sobre qué cámara mostrar (A13 de la auditoría en
 * CLAUDE.md §9). Cuando esa decisión exista, esto vuelve a `true`.
 */
export const MOSTRAR_VISTA_EN_VIVO = false

// La validación de códigos de agenda es ahora dinámica via Supabase.
// Ver: lib/admin/leadsRepo.ts → validateCodigoAgenda()
