# ARCHITECTURE.md — Tu Lugar en Galicia

Decisiones técnicas y estructura del proyecto. Cualquier cambio de stack se documenta como
un nuevo ADR al final de este archivo.

---

## 1. Visión general

Aplicación **Next.js (App Router)** monolítica: frontend y backend viven en el mismo proyecto.
Las "API routes" de Next.js son el backend (no hay servidor separado). Se despliega en **Vercel**
con auto-deploy desde GitHub. **Cloudflare** gestiona DNS, SSL, CDN y, más adelante, el cron del
agente de precios.

```
Visitante
   │
   ▼
Cloudflare (DNS + SSL + CDN)
   │
   ▼
Vercel  ──►  Next.js app
                ├── páginas (SSR/SSG) ── SEO
                └── /app/api/*  (backend)
                        ├── /lead  → Airtable/Sheets   (Fase 1)
                        └── /lar   → API de Claude      (Fase 4)
Cloudflare Worker (cron 15 días) → precios → la web los lee   (Fase 3)
```

---

## 2. Estructura de carpetas (carriles de los agentes)

```
/
├── CLAUDE.md                 # reglas del proyecto (raíz, lo lee Claude Code)
├── docs/                     # Product Manager / Architect / Designer
│   ├── roadmap.md
│   ├── ARCHITECTURE.md
│   ├── PRD-fase-1.md
│   └── design-system.md
├── app/                      # Frontend Developer
│   ├── globals.css           # UI Designer (solo tokens)
│   ├── layout.tsx
│   ├── page.tsx              # home
│   ├── ciudades/[ciudad]/    # páginas de ciudad
│   ├── como-funciona/
│   ├── sobre-silvana/
│   ├── faq/
│   ├── blog/                 # Fase 2 (render)
│   ├── sitemap.ts            # SEO Specialist
│   ├── robots.ts             # SEO Specialist
│   └── api/                  # Backend Architect
│       ├── lead/route.ts     # Fase 1
│       └── lar/route.ts      # AI Engineer (Fase 4)
├── components/               # Frontend Developer
├── content/                  # Content Creator (MDX del blog, Fase 2)
├── lib/                      # Backend Architect
│   ├── seo/                  # SEO Specialist
│   ├── ai/                   # AI Engineer (Fase 4)
│   └── db/                   # Database Optimizer (Fase 5)
├── workers/scraper/          # Data Engineer (Fase 3, Cloudflare Worker)
├── public/                   # imágenes, logo
├── tailwind.config.ts        # UI Designer (tokens)
├── vercel.json               # DevOps Automator
└── .github/                  # DevOps Automator (CI)
```

---

## 3. Decisiones de arquitectura (ADR)

### ADR-001 — Next.js + Vercel en lugar de un backend separado
**Contexto:** la web necesita buen SEO y el equipo ya conectó Vercel.
**Decisión:** Next.js App Router (SSR/SSG para SEO) con API routes como backend.
**Consecuencia:** no se construye ni se despliega un servidor aparte. No se usa PHP/Laravel.

### ADR-002 — Sin base de datos hasta la Fase 5
**Contexto:** las páginas que traen clientes (home, ciudades, blog) no necesitan persistencia.
**Decisión:** leads a Airtable/Google Sheets; El Marcador lee una Google Sheet; contenido en
el repo (MDX). La DB entra solo cuando hay estado multiusuario (mapa, presupuesto, CRM).
**Consecuencia:** Fase 1 sale rápido y barato; menos superficie de fallo y de RGPD al inicio.

### ADR-003 — Cloudflare para DNS/SSL y para el cron del scraper
**Contexto:** cuenta free ya creada.
**Decisión:** Cloudflare gestiona dominio y, en Fase 3, corre el scraper como Worker con
Cron Trigger cada 15 días. Vercel sirve la app.
**Consecuencia:** el scraping pesado no consume recursos de Vercel.

### ADR-004 — La clave de la API de Claude vive solo en el servidor
**Contexto:** Lar usa la API de Claude.
**Decisión:** las llamadas se hacen desde `/app/api/lar` (servidor). La clave está en variables
de entorno de Vercel, nunca en el cliente ni en el repo.
**Consecuencia:** seguridad de la clave; el widget de chat habla con nuestro endpoint, no con Anthropic directamente.

### ADR-005 — Idioma y tono
**Decisión:** sitio en español primero (multiidioma en Fase 6). Tono cálido, rioplatense, cercano.
**Consecuencia:** el copy lo produce `Content Creator` siguiendo la voz de marca.

---

## 4. Variables de entorno (definir en Vercel, nunca en el repo)

| Variable | Fase | Uso |
|---|---|---|
| `AIRTABLE_API_KEY` / `GOOGLE_SHEETS_*` | 1 | guardar leads |
| `SHEET_MARCADOR_ID` | 1 | leer El Marcador |
| `OPENWEATHER_API_KEY` | 2 | clima por ciudad |
| `ANTHROPIC_API_KEY` | 4 | Lar (API de Claude) |
| `DATABASE_URL` | 5 | base de datos |
| `STRIPE_SECRET_KEY` | 6 | pagos |
