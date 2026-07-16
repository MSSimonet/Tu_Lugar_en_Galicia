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
                        ├── /lead  → Supabase          (Fase 1, migrado desde Airtable el 2026-07-12)
                        └── /gina  → API de Gemini     (Fase 4)
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
│       └── gina/route.ts     # AI Engineer (Fase 4)
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
**Superado por ADR-009** (2026-07-12): la decisión de negocio de abandonar Airtable por completo
adelantó la introducción de la base de datos — hoy los leads ya persisten en Supabase/Postgres.

### ADR-003 — Cloudflare para DNS/SSL y para el cron del scraper
**Contexto:** cuenta free ya creada.
**Decisión:** Cloudflare gestiona dominio y, en Fase 3, corre el scraper como Worker con
Cron Trigger cada 15 días. Vercel sirve la app.
**Consecuencia:** el scraping pesado no consume recursos de Vercel.

### ADR-004 — La clave de la API de Gemini vive solo en el servidor
**Contexto:** Gina usa la API de Gemini.
**Decisión:** las llamadas se hacen desde `/app/api/gina` (servidor). La clave está en variables
de entorno de Vercel, nunca en el cliente ni en el repo.
**Consecuencia:** seguridad de la clave; el widget de chat habla con nuestro endpoint, no con Google directamente.

### ADR-005 — Idioma y tono
**Decisión:** sitio en español primero (multiidioma en Fase 6). Tono cálido, "tú" neutro (español internacional), cercano.
**Consecuencia:** el copy lo produce `Content Creator` siguiendo la voz de marca definida en `docs/design-system.md` §5.

---

## 4. Variables de entorno (definir en Vercel, nunca en el repo)

| Variable | Fase | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | 1 | guardar leads (migrado desde Airtable, ADR-009) |
| ~~`AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID`~~ | — | Eliminadas — el puente de Comunidad que las usaba se retiró el 2026-07-16 (ADR-009). El proyecto ya no usa Airtable en ningún código. |
| `SHEET_MARCADOR_ID` | 1 | leer El Marcador |
| `OPENWEATHER_API_KEY` | 2 | clima por ciudad |
| ~~`GEMINI_API_KEY`~~ | — | Descartada — Gina es motor de reglas puro, sin IA (ADR-008 superseded) |
| `DATABASE_URL` | 5 | base de datos |
| `STRIPE_SECRET_KEY` | 6 | pagos |

---

## 5. ADR de scaffold inicial

### ADR-006 — Tailwind v4 sin tailwind.config.ts

**Status:** Accepted

**Context:**
ARCHITECTURE.md §2 lista `tailwind.config.ts` como el archivo de tokens del UI Designer.
Al inicializar el proyecto con `create-next-app@latest` en mayo 2026, la herramienta instaló
Tailwind CSS v4 (no v3). Tailwind v4 eliminó `tailwind.config.ts` y el plugin `postcss-tailwindcss`
clásico: la configuración ahora vive íntegramente en CSS mediante directivas `@theme` dentro de
`app/globals.css`, y el plugin de PostCSS es `@tailwindcss/postcss`.

**Decisión:**
Se acepta Tailwind v4 tal como lo generó `create-next-app`. El carril del UI Designer pasa de
`tailwind.config.ts` a `app/globals.css` (bloque `@theme`). Las referencias a `tailwind.config.ts`
en CLAUDE.md y ARCHITECTURE.md se entienden como el archivo de tokens, que en v4 es `globals.css`.
No se hace un downgrade a Tailwind v3 para evitar deuda técnica desde el inicio.

**Consecuencias:**
- Los tokens de color, tipografía y espaciado se definen en `app/globals.css` bajo `@theme inline { … }`.
- El UI Designer escribe en `app/globals.css` (solo el bloque `@theme`); el Frontend Developer
  escribe el resto del archivo.
- `postcss.config.mjs` usa `"@tailwindcss/postcss": {}` en lugar del plugin clásico.
- Si en el futuro se necesita configuración avanzada (plugins de terceros), se puede añadir un
  `tailwind.config.ts` que Tailwind v4 también soporta como capa de compatibilidad.

### ADR-007 — Estructura de carpetas: solo scaffold inicial

**Status:** Accepted

**Context:**
`create-next-app` genera únicamente `app/`, `public/` y los archivos de configuración raíz.
Las carpetas `components/`, `content/`, `lib/`, `workers/` y las rutas bajo `app/api/`,
`app/ciudades/`, etc. no existen aún.

**Decisión:**
Cada carpeta la crea el agente responsable en el momento en que la necesite (ver tabla de carriles
en CLAUDE.md §3). No se crean carpetas vacías en el scaffold para no generar artefactos huérfanos.

**Consecuencias:**
- La estructura documentada en §2 es el destino final, no el estado inicial.
- Un `create-next-app` posterior en la misma carpeta fallaría por nombre con mayúsculas; si se
  necesita reinicializar, hacerlo en una carpeta temporal y mover como se hizo en este scaffold.

### ADR-008 — Modelo de IA para Gina: descartado, Gina es motor de reglas puro

**Status:** Superseded — 2026-07-16 (originalmente Accepted — 2026-05-31, nunca implementado)

**Contexto:** Gina necesitaba un modelo de lenguaje para los pasos `[llm]` del cuestionario
(texto libre). El stack inicial asumía Claude (Anthropic), ya integrado en el proyecto.
Se evaluaron Claude Haiku y Gemini Flash en términos de costo a escala, y en 2026-05-31 se
aceptó Gemini por costo. Esa integración nunca se construyó: `lib/ai/` no existe, no hay
ninguna referencia a Gemini/`GoogleGenerativeAI` en el código, y `lib/gina/flowEngine.ts` es
—y siempre fue— un motor puro sin llamadas de IA ni de red (los pasos `[llm]` se procesan
como input de texto normal). Confirmado en la auditoría técnica de 2026-07-16
(`docs/auditoria-tecnica-2026-07.md`, hallazgo crítico #4).

**Decisión:** Se descarta la integración de un LLM externo para Gina. Motivo: evitar
alucinaciones del modelo en preguntas sobre visado/documentación migratoria, donde una
respuesta incorrecta tiene consecuencias reales para el usuario. Gina sigue siendo un motor
de reglas determinista (`lib/gina/flowEngine.ts` + `lib/gina/flow.json`), sin dependencia de
Gemini, Claude ni ningún otro proveedor de IA.

**Consecuencias:**
- `GEMINI_API_KEY` se elimina de `.env.local.example` — no hay ningún consumidor real.
- La tabla de variables de entorno en §4 refleja que la fila de Gemini nunca se usó.
- Si en el futuro se reconsidera un LLM para Gina, requiere un nuevo ADR con mitigación
  explícita de alucinaciones (barandas + validación) antes de aceptarse.

### ADR-009 — Migración del CRM de leads de Airtable a Supabase/Postgres

**Status:** Accepted — 2026-07-12

**Contexto:** ADR-002 asumía Airtable/Google Sheets para leads hasta la Fase 5. El 2026-07-12 se
tomó la decisión de negocio de abandonar Airtable por completo y unificar el 100% del sistema
(leads + Comunidad) en Supabase/Postgres, sin arquitectura híbrida ni dual-write. El detalle
completo del schema y el plan de reescritura vive en `docs/crm-supabase-fase0.md`.

**Decisión:** `lib/leads.ts` y todos los endpoints de admin que antes usaban `lib/admin/airtable.ts`
pasan a Supabase (tabla `leads`, ver `docs/crm-supabase-fase0.md` §1). `lib/admin/airtable.ts` se
elimina del repo. El puente de Comunidad (`lib/comunidad/airtable.ts`) se eliminó el 2026-07-16
(`docs/crm-supabase-fase0.md` §3) — el proyecto ya no usa Airtable en ningún código.

**Consecuencias:**
- ADR-002 queda superado en la práctica (ver nota agregada ahí) — hoy sí hay base de datos en
  producción, antes de la Fase 5 originalmente planeada.
- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME` y `AIRTABLE_COMUNIDAD_TABLE_NAME`
  quedaron todas huérfanas y se retiraron de `.env.local.example` el 2026-07-16 — nadie las lee.
- Nueva variable de entorno: `SUPABASE_SERVICE_ROLE_KEY` (ya existía por Comunidad, ahora también
  la usa el CRM de leads) — el cliente de Supabase se generalizó a `lib/supabase/serverClient.ts`,
  compartido entre `lib/leads.ts` y `lib/comunidad/*`.

---

## 6. Guía de despliegue: Cloudflare → Vercel

Esta guía está pensada para alguien que sigue los pasos por primera vez y no tiene experiencia
previa con Vercel o Cloudflare. Ejecutá cada sección en orden.

---

### A) Conectar el repositorio a Vercel

1. Ir a [vercel.com/new](https://vercel.com/new) e iniciar sesión con la cuenta de GitHub del
   proyecto.
2. Hacer clic en **"Import Git Repository"** y seleccionar `Tu_Lugar_en_Galicia`.
3. Vercel detecta automáticamente que es un proyecto Next.js. No cambiar nada en:
   - **Framework Preset:** Next.js (auto-detectado)
   - **Build Command:** `npm run build` (por defecto)
   - **Output Directory:** `.next` (por defecto)
   - **Install Command:** `npm install` (por defecto)
4. Antes de hacer clic en **"Deploy"**, ir a la sección **"Environment Variables"** y agregar
   las variables de entorno necesarias (solo los nombres — los valores reales los tenés en
   `.env.local`):

   | Variable | Fase | Descripción |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | 1 | Supabase para guardar leads (migrado desde Airtable, ADR-009) |
   | ~~`AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID`~~ | — | Eliminadas — el proyecto ya no usa Airtable (ADR-009) |
   | `SHEET_MARCADOR_ID` | 1 | ID de la hoja de El Marcador |
   | `OPENWEATHER_API_KEY` | 2 | Clima por ciudad |
   | ~~`GEMINI_API_KEY`~~ | — | Descartada — Gina es motor de reglas puro, sin IA (ADR-008 superseded) |
   | `DATABASE_URL` | 5 | Conexión a base de datos |
   | `STRIPE_SECRET_KEY` | 6 | Pagos con Stripe |

   > Solo agregá las variables de la fase en la que estás. Las de fases futuras se agregan cuando
   > llegue el momento.

5. Hacer clic en **"Deploy"**. Vercel construye y despliega la app. Al terminar, te da una URL
   temporal del tipo `tu-lugar-en-galicia.vercel.app` — usala para verificar que todo funciona
   antes de conectar el dominio propio.

---

### B) Apuntar el dominio desde Cloudflare a Vercel

> Requisito previo: el dominio (por ejemplo `tulugarengalicia.com`) ya está registrado y apuntado
> a Cloudflare (sus nameservers son los activos).

**En Vercel:**

1. Ir a tu proyecto en vercel.com → **Settings** → **Domains**.
2. Hacer clic en **"Add Domain"** y escribir el dominio (por ejemplo `tulugarengalicia.com`).
3. Vercel te muestra los registros DNS que hay que agregar. Normalmente son dos:
   - Un **registro A** apuntando a `76.76.21.21`
   - Un **registro CNAME** de `www` apuntando a `cname.vercel-dns.com`
4. Agregar también `www.tulugarengalicia.com` como segundo dominio en Vercel, y configurar
   cuál es el canónico (generalmente el apex sin `www`).

**En Cloudflare:**

5. Ir a [dash.cloudflare.com](https://dash.cloudflare.com) → seleccionar el dominio → **DNS**.
6. Agregar los dos registros que Vercel indicó en el paso 3:
   - Tipo **A**, nombre `@` (o el dominio raíz), valor `76.76.21.21`
   - Tipo **CNAME**, nombre `www`, valor `cname.vercel-dns.com`
7. **Importante:** durante la verificación inicial, dejar el proxy de Cloudflare **desactivado
   (nube gris / "DNS only")** en ambos registros. Si está activo (nube naranja), Vercel no puede
   verificar la propiedad del dominio.
8. Volver a Vercel → Settings → Domains y esperar a que aparezca el estado **"Valid
   Configuration"** junto al dominio (puede tardar hasta 10 minutos).
9. Una vez que Vercel confirma el dominio, volver a Cloudflare y activar el proxy (nube naranja)
   en los dos registros. Esto habilita el CDN y la protección DDoS de Cloudflare.

**Configurar SSL:**

10. En Cloudflare → **SSL/TLS** → **Overview**: seleccionar el modo **"Full (strict)"**.
    - Vercel provee automáticamente un certificado Let's Encrypt válido para tu dominio.
    - "Full (strict)" significa que Cloudflare encripta tanto la conexión con el visitante como
      la conexión con Vercel — es el modo más seguro.
    - No usar "Flexible" (solo encripta hasta Cloudflare, no hasta Vercel) ni "Off".

**Verificar redirección www → apex (o viceversa):**

11. En Vercel → Settings → Domains: asegurarse de que el dominio sin `www` tiene la etiqueta
    **"Primary"** y que `www` está configurado para redirigir al primary con un 301.
    Vercel lo gestiona automáticamente cuando agregás ambas versiones del dominio.

---

### C) Configuración recomendada en Cloudflare

Una vez que el dominio funciona correctamente, aplicar estas configuraciones en el panel de
Cloudflare:

**Speed → Optimization:**
- **Auto Minify:** desactivar para JavaScript, CSS y HTML. Next.js ya minifica todo en el build;
  si Cloudflare lo vuelve a procesar puede romper source maps y generar problemas.
- **Rocket Loader:** desactivar. Interfiere con la hidratación de React.

**Caching → Configuration:**
- **Browser Cache TTL:** seleccionar **"Respect Existing Headers"**. Next.js ya envía headers de
  caché correctos para sus assets estáticos (`/_next/static/`).

**Rules (opcional pero recomendado):**
- Si el apex (`tulugarengalicia.com`) es el dominio canónico y querés asegurarte de que `www`
  siempre redirige, crear una Page Rule:
  - URL: `www.tulugarengalicia.com/*`
  - Configuración: **Forwarding URL** → 301 Permanent Redirect → `https://tulugarengalicia.com/$1`
  - Nota: si ya configuraste esto en Vercel (paso 11), esta regla es redundante pero no hace daño.

**Security:**
- **Security Level:** Medium (por defecto, está bien para Fase 1).
- Los headers de seguridad HTTP (`X-Frame-Options`, `X-Content-Type-Options`, etc.) ya están
  configurados en `vercel.json` del repo — no hace falta duplicarlos en Cloudflare.

---

### D) Verificación final

Una vez completados todos los pasos, verificar:

- [ ] `https://tulugarengalicia.com` carga la app sin errores de SSL
- [ ] `https://www.tulugarengalicia.com` redirige con 301 al apex
- [ ] Los headers de seguridad están presentes (verificar con [securityheaders.com](https://securityheaders.com))
- [ ] Cloudflare muestra el dominio como "Active" en el dashboard
- [ ] Vercel muestra el dominio con "Valid Configuration"
- [ ] Un push a `main` en GitHub dispara un deploy automático en Vercel
