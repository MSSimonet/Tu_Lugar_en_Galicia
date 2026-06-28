# Auditoría TLeG 8 — Unlighthouse
Fecha: 2026-06-26  
Herramienta: Unlighthouse 0.17.10 + Lighthouse (Chrome)  
Servidor auditado: http://localhost:3000 (dev mode)  
Rutas auditadas: **13**  
Rutas omitidas por 404: `/aviso-legal`, `/chat`, `/politica-de-cookies`, `/terminos-y-condiciones`

---

## Resumen ejecutivo

| Métrica | Promedio | Mínimo | Ruta con mínimo |
|---------|----------|--------|-----------------|
| Performance | 77 | 65 | `/ciudades/a-coruna` |
| Accessibility | 96 | 96 | todas las ciudades + /como-funciona + /faq |
| Best Practices | 99 | 96 | `/ciudades/a-coruna`, `/lugo`, `/pontevedra`, `/vigo` |
| SEO | 100 | 100 | — |

> ⚠️ Los scores de Performance son del servidor de **desarrollo** (no minificado). En producción (Vercel + Next.js build) serán significativamente más altos.

---

## Scores por ruta (todos los valores × 100)

| Ruta | Score | Perf | A11y | BP | SEO |
|------|-------|------|------|----|-----|
| `/` | 91 | 67 | 97 | 100 | 100 |
| `/agenda` | 97 | 89 | 97 | 100 | 100 |
| `/ciudades` | 93 | 74 | 96 | 100 | 100 |
| `/ciudades/a-coruna` | 89 | 65 | 96 | 96 | 100 |
| `/ciudades/lugo` | 91 | 71 | 96 | 96 | 100 |
| `/ciudades/pontevedra` | 90 | 68 | 96 | 96 | 100 |
| `/ciudades/santiago-de-compostela` | 93 | 75 | 96 | 100 | 100 |
| `/ciudades/vigo` | 92 | 76 | 96 | 96 | 100 |
| `/como-funciona` | 96 | 88 | 96 | 100 | 100 |
| `/conocernos` | 95 | 82 | 97 | 100 | 100 |
| `/faq` | 93 | 76 | 96 | 100 | 100 |
| `/politica-de-privacidad` | 96 | 87 | 97 | 100 | 100 |
| `/sobre-silvana` | 95 | 82 | 97 | 100 | 100 |

---

## Rutas con score < 90 en cualquier categoría

| Ruta | Categoría | Score | Descripción |
|------|-----------|-------|-------------|
| `/` | Performance | 67 | LCP 6.5s, TTI 10s, TBT 367ms — dev mode |
| `/ciudades/a-coruna` | Performance | 65 | Perf más baja del sitio |
| `/ciudades/a-coruna` | Score total | 89 | Única ruta bajo 90 en score global |
| `/ciudades/pontevedra` | Performance | 68 | Consistente con otras ciudades |
| `/ciudades/lugo` | Performance | 71 | |
| `/ciudades/santiago-de-compostela` | Performance | 75 | Mejor ciudad en perf |
| `/ciudades/vigo` | Performance | 76 | |

> Nota: todas las rutas tienen Performance < 90. Es inherente al dev server sin optimización de build.

---

## Issues críticos (score < 70)

### Performance en dev (no crítico en producción)
Las siguientes métricas están infladas por el servidor de desarrollo:

| Audit | Score | Valor medido | Ruta |
|-------|-------|--------------|------|
| Largest Contentful Paint | 0.09 | 6.528s | `/` |
| Time to Interactive | 0.27 | 9.972s | `/` |
| Max Potential FID | 0.20 | 382ms | `/` |
| Unminified JavaScript | 0 | 150KB ahorrables | `/` |

Estas métricas se resuelven solas en producción con `next build` + Vercel edge network. **No requieren intervención de código.**

---

## Issues de A11y detectados

⚠️ **Regresión confirmada: de 100/100 → 96–97**. Dos audits fallan en todas las rutas:

### 1. `color-contrast` — Contraste insuficiente (WCAG AA)

Tres elementos con contraste bajo detectados en `/`:

| Elemento | Color | Problema |
|----------|-------|---------|
| Link Instagram en footer | `color: var(--color-mar)` | Variable CSS renderiza bajo contraste |
| Footer copyright (izq) | `color: #7A7A7A; font-size: 0.71rem; font-weight: 300` | Texto muy pequeño y fino — falla ratio AA |
| Footer copyright (der) | Mismo estilo anterior | Mismo problema |

**Fix:** `#7A7A7A` a peso 300 y tamaño 0.71rem (~11.4px) no alcanza el ratio 4.5:1 requerido por WCAG AA para texto pequeño. Subir a `#9A9A9A` mínimo, o aumentar `font-weight` a 400, o subir `font-size` a `0.75rem`.

### 2. `label-content-name-mismatch` — Accessible name ≠ visible text

| Elemento | aria-label | Texto visible | Problema |
|----------|------------|---------------|---------|
| Link Instagram (footer) | `"Síguenos en Instagram"` | Solo icono SVG | No hay texto visible que coincida |
| Link Facebook (footer) | aria-label Facebook | Solo icono SVG | Ídem |

**Fix:** Si el link tiene aria-label pero el texto visible es solo el nombre de usuario (`@tulugarengalicia`), el accessible name debería incluir ese texto, o eliminar el aria-label y dejar que el texto visible sea el nombre accesible.

---

## Issues de Best Practices detectados

### 1. `errors-in-console` — Errores JS en páginas de ciudades (BP: 96)

Afecta: `/ciudades/a-coruna`, `/ciudades/lugo`, `/ciudades/pontevedra`, `/ciudades/vigo`  
No afecta: `/ciudades` (listado), `/ciudades/santiago-de-compostela`

**Probable causa:** La API de clima (`/api/clima/[ciudad]`) falla o lanza una excepción en alguna de estas ciudades durante el render de Lighthouse. Santiago no falla — posiblemente tiene un fallback diferente o la API la resuelve correctamente.

**Fix:** Verificar que `app/api/clima/[ciudad]/route.ts` devuelve respuesta válida para A Coruña, Lugo, Pontevedra y Vigo. Añadir `try/catch` con datos de fallback explícitos si la API externa falla.

### 2. `valid-source-maps` — Source maps faltantes

Afecta: todas las rutas  
**Es un falso positivo en dev mode.** Next.js en producción no expone source maps al cliente. No requiere acción.

---

## Issues de SEO detectados

**Ninguno.** SEO perfecto: 100/100 en las 13 rutas auditadas.

- Títulos únicos por ruta ✅
- Meta descriptions presentes ✅
- Robots.txt válido ✅
- Open Graph configurado ✅

---

## Páginas con 404 (no auditadas — pendientes de crear)

| Ruta | Prioridad |
|------|-----------|
| `/aviso-legal` | Alta — requerida por RGPD |
| `/politica-de-cookies` | Alta — requerida por RGPD |
| `/terminos-y-condiciones` | Media |
| `/chat` | Media — chat de Gina tiene URL dedicada |

---

## Comparativa con TLeG 7

| Métrica | TLeG 7 | TLeG 8 | Δ |
|---------|--------|--------|---|
| Accessibility | **100** | **96–97** | ⬇ −3–4 pts — **REGRESIÓN** |
| SEO | 100 | 100 | ✅ sin cambios |
| Best Practices | 100 | 96–100 | ⬇ en páginas de ciudad |
| Performance | n/d | 65–89 | (dev mode, no comparable) |

**Regresiones detectadas:**
1. **A11y −4 pts** — color-contrast en footer + label-name-mismatch en redes sociales
2. **BP −4 pts en ciudades** — console errors en API de clima para 4 ciudades

---

## Mejoras priorizadas para TLeG 9

### 1. 🔴 Reparar color-contrast en footer (A11y — impacto alto)
- `color: #7A7A7A` a `font-weight: 300` y `font-size: 0.71rem` falla WCAG AA
- Subir a `#AAAAAA` o `font-weight: 400` en el texto de copyright del footer
- Impacto: recupera A11y de 97 → 100 en rutas afectadas

### 2. 🔴 Corregir label-content-name-mismatch en links de RRSS (A11y — impacto alto)
- Los links de Instagram y Facebook tienen `aria-label` que no coincide con el texto visible
- Fix: eliminar `aria-label` redundante y dejar el nombre de usuario como texto accesible, o alinear el aria-label con el contenido visible
- Impacto: completa la recuperación de A11y → 100

### 3. 🟡 Debuggear console errors en API clima — ciudades (BP — impacto medio)
- `/ciudades/a-coruna`, `/lugo`, `/pontevedra`, `/vigo` tienen errores JS en consola
- Revisar `app/api/clima/[ciudad]/route.ts` y añadir manejo de errores robusto
- Impacto: BP de 96 → 100 en páginas de ciudad

### 4. 🟡 Crear las 4 páginas 404 pendientes (Legal/RGPD — impacto medio)
- `/aviso-legal` y `/politica-de-cookies` son obligatorias por RGPD
- Contenido en `/docs/legal-terminos-privacidad.md`
- Impacto: cobertura legal completa + auditables en TLeG 9

### 5. 🟢 Auditar Performance en producción (no en dev)
- Los scores de perf (65–89) son artefactos del dev server
- Correr Unlighthouse contra el deploy de Vercel para obtener números reales
- Esperado en prod: Performance > 85 en homepage, > 90 en rutas simples
