# Re-certificación Fase 1 — Tu Lugar en Galicia

**Fecha:** 2026-07-01
**Agente:** Reality Checker
**Metodología:** Lectura directa del código fuente + contraste con PRD-fase-1.md §6, auditoria-2026-07-01.md y certificacion-fase-1.md (2026-05-29)
**Alcance:** Verificar si el estado actual del código habilita el avance a Fase 2 y el lanzamiento público.

> **Certificación anterior:** `docs/archivo/certificacion-fase-1.md` (2026-05-29) — emitió FASE 1 CERTIFICADA con deuda técnica documentada.
> Esta re-certificación incorpora los cambios de seguridad del commit f7dc88c y nuevos hallazgos de la auditoría de 2026-07-01.

---

## 1. Criterios de aceptación PRD §6 — estado actual

| # | Criterio | Estado | Notas |
|---|---|---|---|
| C1 | Las 11 páginas existen, responden y se ven bien en móvil y escritorio | ✅ **Resuelto** | 11/11 páginas OK; `/diagnostico` renombrado a `/conocernos` (decisión documentada); home completa con 8 secciones PRD §2 (ComoFuncionaResumen, CiudadesCards y CTAFinal agregados) |
| C2 | Formulario de diagnóstico guarda el lead y muestra confirmación | ⚠ Configuración | Código correcto; depende de `AIRTABLE_API_KEY` en Vercel (PL-4) |
| C3 | El Marcador muestra números de la Google Sheet sin tocar código | ⚠ Configuración | Fallback activo; depende de `SHEET_MARCADOR_ID` (PL-5) |
| C4 | WhatsApp flotante visible en todas las páginas con mensaje predefinido | ✅ **Resuelto** | `WhatsAppFlotante` importado y renderizado en `app/layout.tsx` — verificado visualmente en home, /ciudades/vigo, /faq, /conocernos |
| C5 | Agenda de Cal.com funciona desde `/agenda` y desde los CTAs | ⚠ Configuración | `CalEmbed` implementado; `CALCOM_URL` es placeholder en `lib/config/site.ts` (PL-2) |
| C6 | Lighthouse: SEO ≥ 95, Acc ≥ 95, Performance ≥ 90 en móvil | ⚠ Pendiente | Sin medición real sobre deploy; deuda técnica DT-5,7,12-15 de cert. anterior sigue abierta |
| C7 | `sitemap.xml` y `robots.txt` accesibles; schema válido | ✅ Cumplido | Los 3 schemas (LocalBusiness, Service, FAQPage) inyectados correctamente |
| C8 | Consentimiento RGPD en formulario + página de política de privacidad | ⚠ Configuración | Formulario: ✅; Página: estructura correcta pero 4 TODOs con datos fiscales (A04 — bloqueado por datos de Silvana, no es defecto de código) |
| C9 | Code Reviewer aprobó y Reality Checker certificó | ⚠ Condicionado | Cert. anterior emitida; este informe actualiza la evaluación |

---

## 2. Detalle de hallazgos nuevos

### 2.C1 — Secciones faltantes en la home (`app/page.tsx`) — ✅ RESUELTO

**Corrección aplicada el 2026-07-01.** `app/page.tsx` ahora incluye las 8 secciones del PRD §2:

```tsx
import {
  Hero,              // PRD §2.1 + §2.2 (stats en Hero)
  ElMarcador,        // PRD §2.3
  ComoFuncionaResumen, // PRD §2.4 — agregado
  CiudadesCards,     // PRD §2.5 — agregado
  FeedInstagram,     // PRD §2.6
  MuroLlavesPreview, // PRD §2.7
  Testimonios,       // PRD §2.8
  CTAFinal,          // PRD §2.9 — agregado
} from "@/components/home";
```

Verificado visualmente en localhost:3000 — todas las secciones renderizan correctamente.

---

### 2.C4 — WhatsApp flotante ausente del layout — ✅ RESUELTO

**Corrección aplicada el 2026-07-01.** `app/layout.tsx` ahora importa `WhatsAppFlotante` desde `@/components/shared` y lo renderiza junto a `<GinaWidget />`:

```tsx
import { WhatsAppFlotante } from "@/components/shared";
// ...
<GinaWidget />
<WhatsAppFlotante />
```

Verificado visualmente en home, /ciudades/vigo, /faq y /conocernos — botón verde visible en esquina inferior derecha en todas las páginas.

---

## 3. Estado de ítems de auditoría-2026-07-01

| ID | Severidad | Estado actual | Bloqueante para lanzamiento |
|---|---|---|---|
| A01 | ✅ Resuelto | Confirmado en commit prev. | — |
| A02 | ✅ Resuelto | `console.warn` anonimizado | — |
| A03 | ✅ Resuelto | Rate limiting Upstash + fail-closed | — |
| A04 | 🔴 Abierto | 4 TODOs datos fiscales en `/politica-de-privacidad` | **SÍ** — RGPD exige identificar al responsable antes del lanzamiento público. No es defecto de código: depende de datos de Silvana. |
| A05 | ✅ Resuelto | CSP en `middleware.ts` | — |
| A06 | ✅ Resuelto | HSTS en `vercel.json` | — |
| A07 | ✅ Resuelto | `consentimientoRGPD` validado desde el cliente | — |
| A08 | 🟠 Abierto | `CALCOM_URL` y `WHATSAPP_DISPLAY` son placeholders en `lib/config/site.ts` | SÍ — antes del lanzamiento público (configuración, no código) |
| A09 | 🟡 Abierto | Token admin en query string (Referer leak) | No — mitigado con `Referrer-Policy: no-referrer` en rutas admin |
| A10 | 🟡 Abierto | Sanitización email en filterByFormula incompleta | No — riesgo interno (solo afecta rutas admin autenticadas) |
| A11 | 🟡 Abierto | Vars Upstash ausentes en `.env.local.example` | No — documentación de dev |
| A13 | 🟡 Abierto | Widget Windy sin autorización legal confirmada | No — no crítico para lanzamiento; revisar antes de activar tráfico masivo |
| A14 | 🟡 Abierto | Imágenes placeholder en producción | SÍ — experiencia visual; reemplazar antes del lanzamiento |
| A15 | 🟡 Abierto | TTL admin token 72h (debería ser 24h) | No — baja exposición |

---

## 4. Mejoras de seguridad implementadas desde cert. anterior (commit f7dc88c)

Estas correcciones mejoran la postura de seguridad respecto a la certificación de mayo 2026:

| Fix | Archivo | Descripción |
|---|---|---|
| XFF spoofable | `lib/utils/ip.ts` | `getRealIp()`: CF-Connecting-IP → primer XFF → 'anonymous'. Evita bypass de rate limiting |
| O(n) Airtable | `lib/admin/airtable.ts` | `listAllRecords(filterByFormula?)`: filtro server-side opcional en 4 callers |
| Header token CSS | `components/layout/Header.tsx` | `#111111` → `var(--color-granito)` |

---

## 5. Deuda técnica de cert. anterior — estado 2026-07-01

Items DT de `docs/archivo/certificacion-fase-1.md` §4 que quedaron abiertos tras la revisión de junio 2026:

| # | Estado | Notas |
|---|---|---|
| DT-5 | 🟡 Abierto | `ElMarcador` Client Component con `useEffect` — latencia 200-500ms en móvil |
| DT-7 | 🟡 Abierto | Header como Client Component — bundle innecesario por página |
| DT-12 | 🟡 Abierto | `SITE_URL` duplicado en `metadata.ts` y `lib/config/site.ts` |
| DT-13 | 🟡 Abierto | Fechas en API `/api/lead` sin validación de formato |
| DT-14 | 🟡 Abierto | Metadata en `app/layout.tsx`: riesgo bajo de título duplicado |
| DT-15 | 🟡 Abierto | 17 mejoras menores del QA original |

Todos son Fase 2 sin urgencia de lanzamiento.

---

## 6. Pendientes de lanzamiento (sin cambios respecto a cert. anterior)

| # | Pendiente | Dónde |
|---|---|---|
| PL-1 | Número de WhatsApp real (código de país) | `lib/config/site.ts` → `WHATSAPP_NUMBER` (nota: `WHATSAPP_DISPLAY` también es placeholder) |
| PL-2 | Slug real de Cal.com | `lib/config/site.ts` → `CALCOM_URL` |
| PL-3 | Dominio apuntando a Vercel (Cloudflare DNS + SSL Full Strict) | Panel Vercel + Cloudflare |
| PL-4 | `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` + `AIRTABLE_TABLE_NAME` en Vercel | Variables de entorno Vercel |
| PL-5 | Google Sheet de El Marcador con 4 celdas nombradas | Google Sheets + `SHEET_MARCADOR_ID` |
| PL-6 | Datos fiscales del responsable RGPD (razón social, dirección, email DPO) | `app/politica-de-privacidad/page.tsx` — 4 TODOs (A04) |
| PL-7 | Logo sin espacios en nombre + formato PNG con transparencia | `public/` |
| PL-8 | WhatsApp Business configurado con mensaje automático | App WhatsApp Business |

---

## 7. Veredicto

### ¿Se puede avanzar a Fase 2? — **SÍ, con condición**

La Fase 1 está **certificada para continuar el desarrollo** de Fase 2. La base de código compila, las 11 rutas del PRD existen (con la reclasificación `/conocernos`), los schemas JSON-LD están inyectados, el formulario tiene validación completa y el flujo de negocio (9 piezas) funciona arquitecturalmente.

**Condición cumplida — 2026-07-01:**

Los dos fixes de código han sido aplicados y verificados:

1. ✅ **`WhatsAppFlotante` en layout** — visible en todas las páginas.
2. ✅ **Home con 8 secciones PRD** — `ComoFuncionaResumen`, `CiudadesCards`, `CTAFinal` agregados.

### ¿Se puede lanzar al público? — **NO todavía**

Bloqueantes legales y de experiencia (solo configuración, no código):

| Bloqueante | Tipo | Responsable |
|---|---|---|
| A04 — Política de Privacidad sin datos del responsable | Legal / RGPD | Silvana (datos fiscales) |
| A08 — Cal.com URL placeholder | Configuración | Silvana (slug Cal.com) |
| A14 — Imágenes placeholder visibles | Experiencia | Silvana (fotos reales) |
| ~~2 fixes de código~~ | ✅ Resueltos 2026-07-01 | — |

### Camino al lanzamiento

1. Fix de 2 ítems de código: `WhatsAppFlotante` en layout + 3 secciones en home (~15 min)
2. Datos fiscales de Silvana → completar A04 en `/politica-de-privacidad`
3. Configurar Cal.com slug real (PL-2) y WhatsApp number real (PL-1)
4. Reemplazar imágenes placeholder (A14)
5. Cargar variables de entorno en Vercel (PL-4, PL-5)
6. Ejecutar Lighthouse en producción y verificar C6 (SEO ≥ 95, Acc ≥ 95, Perf ≥ 90)

---

**Reality Checker:** Claude Code (re-certificación)
**Fecha:** 2026-07-01
**Estado:** FASE 1 CERTIFICADA — CÓDIGO COMPLETO — LANZAMIENTO PENDIENTE DE CONFIGURACIÓN (PL-1 a PL-8)
**Re-evaluación:** recomendada tras completar PL-1 a PL-8 y ejecutar Lighthouse en producción (C6)
