# Auditoría de código — Tu Lugar en Galicia
**Fecha:** 2026-07-01 | **Auditor:** Claude Code (línea por línea)
**Alcance:** Seguridad · Funcionalidad · Diseño · Performance · Calidad de código

---

## Estado de incidencias previas (CLAUDE.md §10)

| ID | Severidad | Estado | Nota |
|---|---|---|---|
| A01 | ✅ Resuelto | ✅ Confirmado | `verifyAdminToken` antes de `getLead` en PDF route |
| A02 | 🔴 Crítico | ✅ Resuelto | `console.warn` usa `clientEmail.substring(0,3)***` |
| A03 | 🔴 Crítico | ✅ Resuelto | Upstash Ratelimit `slidingWindow(30, '10 m')` en Gina; fail-closed |
| A04 | 🔴 Crítico | 🔴 ABIERTO | 4 TODOs en `app/politica-de-privacidad/page.tsx` (líneas 44, 48, 52, 182) |
| A05 | 🟠 Alto | ✅ Resuelto | CSP implementado en `middleware.ts` |
| A06 | 🟠 Alto | ✅ Resuelto | HSTS en `vercel.json` (`max-age=63072000; includeSubDomains`) |
| A07 | 🟠 Alto | ✅ Resuelto | `consentimientoRGPD` validado del body del cliente en `/api/lead` |
| A08 | 🟠 Alto | Sin verificar | Requiere inspección de `lib/config/site.ts` |
| A09 | 🟡 Medio | 🟡 ABIERTO | Token en query string persiste (ver §1 abajo) |
| A10 | 🟡 Medio | 🟡 ABIERTO | Sanitización email en Airtable filterByFormula incompleta |
| A11 | 🟡 Medio | 🟡 ABIERTO | `UPSTASH_REDIS_REST_URL/TOKEN` ausentes en `.env.local.example` |
| A12 | 🟡 Medio | 🟡 Parcial | `OPENWEATHER_API_KEY` eliminada ✅; `CALCOM_API_KEY` documentada pero sin uso |
| A13 | 🟡 Medio | Sin verificar | Widget Windy — requiere revisión legal independiente |
| A14 | 🟡 Medio | Sin verificar | Imágenes placeholder — requiere revisión visual |
| A15 | 🟡 Medio | 🟡 ABIERTO | TTL 72h en `lib/admin/tokens.ts:3` |

---

## 1. Seguridad

### 🔴 A04 — Política de Privacidad con TODOs en producción
**Archivo:** `app/politica-de-privacidad/page.tsx`
**Líneas:** 44, 48, 52, 182

Cuatro campos pendientes visibles al usuario final:
- Razón social del responsable del tratamiento
- Dirección postal
- Email de protección de datos (aparece dos veces)

**Impacto:** Bloquea el lanzamiento público. La ley exige datos identificativos del
responsable. Sin ellos, el sitio no cumple el RGPD.

---

### 🟠 X-Forwarded-For spoofable — bypass de rate limiting
**Archivos:**
- `app/api/gina/route.ts` (edge runtime, línea ~58)
- `app/api/lead/route.ts` (línea 76)

```typescript
// ACTUAL (frágil):
const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'

// El problema: el header puede ser "attacker-ip, real-ip"
// Upstash limita por "attacker-ip" y deja pasar tráfico real
```

Un atacante puede enviar `X-Forwarded-For: 1.2.3.4` y rotar IPs para evadir rate limiting.
La solución correcta es tomar solo el **primer** IP confiable de la cadena o usar
el header `CF-Connecting-IP` de Cloudflare (que no puede ser falsificado por el cliente).

---

### 🟡 A09 — Token admin en query string (referer leak)
**Archivo:** `lib/admin/tokens.ts`, `app/api/plan/[recordId]/pdf/route.ts`

El token HMAC aparece en `?token=...`. Si el servidor de PDF (Resend, S3, o el cliente)
tiene analytics o Referer logging, el token queda expuesto en logs externos.

**Mitigación a corto plazo:** En `middleware.ts`, el `Referrer-Policy: no-referrer` ya
está activo en rutas `/api/admin/*`. Riesgo reducido pero no eliminado (logs propios de Vercel).

---

### 🟡 A10 — Sanitización de email incompleta en Airtable filterByFormula
**Archivo:** `lib/admin/airtable.ts` (~línea 122)

La función `findLeadByEmail` solo elimina `'"\\`. Caracteres como backtick (`` ` ``),
llaves `{}`, o paréntesis podrían causar comportamientos inesperados en filterByFormula
si Airtable los procesa.

**Recomendación:** Usar validación de email completa (regex) antes de pasarlo a filterByFormula,
o pasar el email como parámetro tipado si la API lo permite.

---

### 🟡 A11 — Variables Upstash ausentes en .env.local.example
**Archivo:** `.env.local.example`

`UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` no están documentadas. Si un dev
configura el proyecto sin estas vars, el rate limiting en `/api/lead` se desactiva
silenciosamente (el código hace `ratelimit = null` y salta el bloqueo).

---

### 🟡 A15 — TTL admin token 72h
**Archivo:** `lib/admin/tokens.ts:3`
```typescript
const TTL_MS = 72 * 60 * 60 * 1000  // debería ser 24h
```

Para acciones de alta sensibilidad (ver perfil completo de lead + descargar PDF),
72 horas es una ventana de exposición innecesaria.

---

### 🟡 XSS en templates de email admin (bajo riesgo)
**Archivo:** `app/api/admin/recordatorio-silvana/route.ts` (línea ~79)

```typescript
// plataforma viene de Airtable — no se escapa antes de interpolar en HTML:
const plataformaHtml = esUrl
  ? `<a href="${plataforma}">${plataforma}</a>`  // ← sin escape HTML
  : `<span>${plataforma}</span>`
```

Si alguien con acceso a Airtable inyecta HTML en `plataformaVideollamada`, se renderiza
en el email de Silvana. Los clientes de email modernos bloquean scripts, pero puede
causar layout injection. Mitigación: escapar con una función `escapeHtml()`.

---

## 2. Funcionalidad

### ✅ Las 9 piezas del flujo de agenda — todas implementadas

| Pieza | Endpoint / archivo | Estado |
|---|---|---|
| 1. Guardar lead | `POST /api/lead` | ✅ Validación exhaustiva |
| 2. Asistente Gina | `POST /api/gina` | ✅ Gemini + retry + rate limit |
| 3. Resumen diario | `GET /api/admin/resumen-diario` | ✅ Cron 07:00 |
| 4. Habilitar agenda | `POST /api/admin/habilitar-agenda/[id]` | ✅ |
| 5. Webhook Cal.com | `POST /api/webhooks/calcom` | ✅ HMAC verificado |
| 6. PDF del plan | `GET /api/plan/[id]/pdf` | ✅ Auth + generación |
| 7. Recordatorio | `GET /api/admin/recordatorio-silvana` | ✅ GitHub Actions horario |
| 8. El Marcador | `GET /api/marcador` | ✅ Google Sheets + fallback |
| 9. Clima | `GET /api/clima/[ciudad]` | ✅ AEMET + caché 6h |

---

### 🟡 habilitar-agenda: no hay rollback si Resend falla
**Archivo:** `app/api/admin/habilitar-agenda/[recordId]/route.ts`

Si el PATCH a Airtable (activar código) tiene éxito pero `sendEmail` falla, la respuesta
devuelve `{ ok: true, warning }` pero el lead nunca recibe el email con su código.
El código queda activado en Airtable sin notificación al lead.

---

### 🟡 resumen-diario: dual-purpose puede dejar estado inconsistente
**Archivo:** `app/api/admin/resumen-diario/route.ts`

La misma ejecución expira códigos Y envía el resumen. Si el email falla después de
expirar códigos, los códigos quedan invalidados pero Silvana no recibe el informe.

---

## 3. Diseño

### 🟠 Header con fondo hardcodeado en lugar de token CSS
**Archivo:** `components/layout/Header.tsx`

```tsx
// ACTUAL:
style={{ background: '#111111' }}

// El design-system define --color-granito: #1E1C19 (claro) / #F0EBE2 (dark)
// El header SIEMPRE es oscuro independiente del modo — puede ser intencional.
// Pero incumple la regla de "usar tokens CSS, nunca hexadecimal suelto" (DESIGN.md).
```

Si el color base de la marca cambia, este hardcode no se actualiza automáticamente.

---

### 🟡 script-src 'unsafe-inline' en CSP (trade-off conocido)
**Archivo:** `middleware.ts`

Necesario para el embed de Cal.com. Debilita protección XSS del sitio.
Evaluar migrar a Cal.com Elements con nonce cuando Cal.com lo soporte.

---

### 🟡 Dependencias de fuentes no usadas en el design system
**`package.json`** incluye: `@fontsource/dm-sans`, `@fontsource/mulish`, `@fontsource/source-sans-3`

Ninguna aparece en `app/globals.css @theme` ni en el design system documentado.
Son dependencias muertas que aumentan el bundle innecesariamente.

---

## 4. Performance

### 🟠 listAllRecords() — O(n) sin filtro de fecha
**Archivo:** `lib/admin/airtable.ts`

```typescript
// Llamado por:
// - getLeadsConCitaProxima() → recordatorio horario (24 llamadas/día)
// - listAllRecords() directa → resumen diario
// Sin filtro de fecha — descarga TODOS los registros con paginación
```

A medida que la base crece, cada cron gasta más cuota de Airtable y más tiempo.
Cuando se superen ~500 registros, esto será notable.

**Solución recomendada:** Añadir `filterByFormula` por `fechaCita > now()` en
`getLeadsConCitaProxima()` para reducir el set descargado.

---

### 🟡 generateAdminToken dentro de records.map()
**Archivo:** `app/api/admin/recordatorio-silvana/route.ts:178`

Los tokens se generan para todos los registros aunque el email falle después. Desperdicio
menor pero tokens válidos quedan sin usar.

---

## 5. Calidad de código

### 🟡 COMMON_HEADERS vacío declarado sin uso
**Archivo:** `app/api/lead/route.ts:41`

```typescript
const COMMON_HEADERS = {}  // nunca agrega nada a las respuestas
```

Parece una abstracción prematura de algo que se fue vaciando. Se puede eliminar.

---

### 🟡 Doble numeración de pasos en /api/lead
**Archivo:** `app/api/lead/route.ts` (líneas 74 y 93)

Dos comentarios marcados como `// 1.` (Rate limiting y Parsear body). Menor, pero confunde
al leer.

---

### 🟡 Modulo bias en generateAgendaCode
**Archivo:** `lib/admin/codes.ts:11`

```typescript
return Array.from(bytes).map(b => CHARS[b % CHARS.length]).join('')
// CHARS.length = 36
// 256 % 36 = 4 → valores 0-3 tienen prob 8/256, valores 4-35 tienen 7/256
```

Bias estadístico negligible para un código de un solo uso de 8 caracteres, pero
viola principio de distribución uniforme. Corrección: rejection sampling.

---

### 🟡 CALCOM_API_KEY documentada pero sin uso real
**Archivo:** `.env.local.example:65`

La variable está documentada como necesaria, pero ningún archivo del repositorio
la usa. El webhook de Cal.com solo necesita `CALCOM_WEBHOOK_SECRET`.

---

## Resumen ejecutivo

| Categoría | 🔴 Crítico | 🟠 Alto | 🟡 Medio | ✅ OK |
|---|---|---|---|---|
| Seguridad | 1 (A04) | 1 (XFF) | 4 (A09,A10,A11,A15) | 7+ |
| Funcionalidad | 0 | 0 | 2 | 9 piezas |
| Diseño | 0 | 1 (header) | 2 | — |
| Performance | 0 | 1 (O(n) scan) | 1 | — |
| Calidad | 0 | 0 | 4 | — |

**Bloqueante para lanzamiento público:** Solo A04 (Política de Privacidad).
El resto son mejoras que no impiden operar, salvo que se habilite la agenda
sin las env vars de Upstash (rate limiting desactivado silenciosamente).

**Lo que funciona bien:**
- HMAC-SHA256 en admin tokens y webhook de Cal.com — correctamente implementado
- `timingSafeEqual` con check de length — correcto
- `isAuthorized()` con doble secret (INTERNAL + CRON) — correcto
- Validación exhaustiva de inputs en `/api/lead` — excelente
- Sin PII en logs de servidor
- Sin secrets hardcodeados
- HSTS + CSP + X-Content-Type-Options + X-Frame-Options — en producción
