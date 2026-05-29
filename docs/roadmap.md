# Roadmap — Tu Lugar en Galicia

Orden de ejecución por **prioridad de impacto**, no por capas técnicas.
Regla de oro: no se avanza de fase hasta que el `Reality Checker` certifica la anterior.

Leyenda de agentes → ver `CLAUDE.md` §3.

---

## Fase 0 — Cimientos y decisiones

**Objetivo:** dejar el stack, la identidad visual y el repo listos para construir, con la web
base desplegándose sola.

**Qué se construye**
- Proyecto Next.js + TypeScript + Tailwind inicializado y subido a GitHub.
- Cloudflare apuntando el dominio a Vercel (DNS + SSL).
- `/docs` completo y `CLAUDE.md` en la raíz.
- Tokens de diseño base (colores, tipografía) en Tailwind.
- Un "hello world" visible en el dominio real.

**Agentes, en orden**
1. `Software Architect` → confirma stack, escribe ADR en `ARCHITECTURE.md`.
2. `Product Manager` → PRD global + este roadmap afinado.
3. `Brand Guardian` → identidad de Galicia en `design-system.md`.
4. `UI Designer` → tokens y componentes base en `tailwind.config.ts` + `globals.css`.
5. `DevOps Automator` → Cloudflare ↔ Vercel, ramas, deploy automático.

**Hecho cuando:** un push a `main` publica solo en el dominio, con la paleta de marca aplicada.

---

## Fase 1 — Sitio de marketing + SEO (SIN base de datos)

**Objetivo:** que un emigrante llegue por Google, entienda el servicio, lea su ciudad y deje su consulta.

**Qué se construye**
- Home con: hero + métricas (+200 familias) + El Marcador (lee Google Sheets) + feed de
  Instagram + preview del muro de llaves + WhatsApp flotante.
- 5 páginas de ciudad: Vigo, A Coruña, Santiago, Pontevedra, Lugo.
- "Cómo funciona", "Sobre Silvana", FAQ.
- **Formulario de diagnóstico** (el de viabilidad) → guarda lead en Airtable/Sheets.
- Agenda de videollamada (Cal.com embebido).
- SEO técnico: metadata, sitemap, robots, schema por ciudad.

**Agentes, en orden**
1. `Sprint Prioritizer` → ordena el backlog de la fase.
2. `SEO Specialist` → mapa de keywords + estructura de URLs + schema.
3. `Content Creator` → textos de home, ciudades, FAQ, "Sobre Silvana".
4. `Frontend Developer` → todas las páginas y componentes.
5. `Backend Architect` → API route del formulario → Airtable/Sheets.
6. Puerta de calidad: `Accessibility Auditor` + `Performance Benchmarker` + `Code Reviewer`.
7. `Reality Checker` → certifica la fase.

**Hecho cuando:** ver criterios de aceptación en `PRD-fase-1.md`.

---

## Fase 2 — Contenido dinámico y confianza

**Objetivo:** posicionar en Google y dar pruebas de confianza que se actualizan solas.

**Qué se construye**
- Blog en MDX (Lar redacta el borrador, Silvana afina y aprueba).
- Clima en vivo por ciudad (OpenWeatherMap).
- Reseñas de Google embebidas.
- Rangos de alquiler por zona.
- Guía de barrios por perfil.

**Agentes, en orden**
1. `Content Creator` + `SEO Specialist` → primeros 3-5 artículos del plan SEO.
2. `Frontend Developer` → render del blog (MDX) y widgets de clima/reseñas/precios.
3. `Code Reviewer` → `Reality Checker`.

---

## Fase 3 — Herramientas interactivas

**Objetivo:** el módulo "¿Cuánto cuesta vivir en Galicia?" que ningún competidor tiene.

**Qué se construye**
- Simulador de compra de supermercado (primero con datos cargados a mano).
- Calculadora de costo de vida (suma alquiler + súper + transporte + colegios).
- Agente de precios: Cloudflare Worker con cron cada 15 días que alimenta lo anterior.

**Agentes, en orden**
1. `Frontend Developer` → calculadoras del lado cliente (sin DB).
2. `Data Engineer` → Worker scraper en `/workers/scraper` + cron.
3. `Backend Architect` → cómo la web consume esos precios.
4. `Legal Compliance Checker` → revisar términos de uso de cada supermercado ANTES de activar.
5. `Reality Checker`.

---

## Fase 4 — Capa de IA (Lar)

**Objetivo:** Lar responde 24/7, cualifica leads y agenda, en web y WhatsApp.

**Qué se construye**
- Chat de Lar en la web (widget flotante) con el flujo de `lar_cuestionario`.
- Traductor de contratos/anuncios (pega texto → explicación simple).
- Integración con WhatsApp (Manychat → webhook → mismo endpoint).

**Agentes, en orden**
1. `AI Engineer` → endpoint en `/app/api/lar` + lógica del cuestionario por niveles.
2. `Security Engineer` → protección de la clave de API y de los datos del lead.
3. `Frontend Developer` → widget de chat.
4. `Reality Checker`.

---

## Fase 5 — Comunidad con base de datos

**Objetivo:** funciones que requieren guardar estado de varios usuarios.

**Qué se construye**
- Mapa de familias ubicadas (con consentimiento explícito; barrio, nunca dirección exacta).
- App de presupuesto mensual con sincronización por email.
- CRM estructurado de leads.

**Agentes, en orden**
1. `Backend Architect` → modelo de datos.
2. `Database Optimizer` → esquema e índices.
3. `Frontend Developer` → interfaces.
4. `Legal Compliance Checker` → consentimientos RGPD.
5. `Reality Checker`.

---

## Fase 6 — Monetización y escala

**Objetivo:** cobrar señas y abrir a más mercados.

**Qué se construye**
- Stripe para señas/adelantos (filtro de leads serios).
- Multiidioma: español + portugués + inglés.
- Menciones/alianzas con plataformas de pago (Wise, Global66, etc.).

**Agentes, en orden**
1. `Backend Architect` + `Security Engineer` → flujo de pagos.
2. `Frontend Developer` → internacionalización (i18n).
3. `Reality Checker`.

---

## Vías paralelas (no tocan el código de la web)

- **Contenido social:** `Instagram Curator`, `TikTok Strategist`, `Carousel Growth Engine`
  trabajan el feed y los reels en paralelo desde Fase 1. Producen contenido, no código.
