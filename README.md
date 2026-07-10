# Tu Lugar en Galicia

Sitio web y sistema de calificación de leads para el primer servicio de **relocation especializado en Galicia**, España. Ayuda a familias latinoamericanas a conseguir vivienda antes de llegar, acompañándolas en todo el proceso a distancia.

**Producción:** [tu-lugar-en-galicia.vercel.app](https://tu-lugar-en-galicia.vercel.app)

---

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Deploy:** Vercel (auto-deploy desde `main`)
- **CDN / DNS:** Cloudflare
- **CRM:** Airtable
- **IA (Gina):** API de Gemini (Google)
- **Clima:** API AEMET (España)
- **Agenda:** Cal.com embebido
- **Comunidad:** Leaflet + Supabase (formulario, mapa y puente a Airtable, con mensajería
  privada vía Resend). Implementado y verificado end-to-end con datos e infraestructura reales
  el 2026-07-10 — ver [`docs/comunidad-de-acogida.md`](docs/comunidad-de-acogida.md). Falta el
  deploy a Vercel para confirmar en el dominio público.

---

## Estructura principal

```
app/                  — Páginas y API routes (Next.js App Router)
├── api/gina/         — Motor conversacional de Gina → Airtable
├── api/clima/        — Clima en tiempo real por ciudad (AEMET, caché 6h)
├── api/lead/         — Formulario de diagnóstico → Airtable
├── ciudades/         — 5 páginas de ciudad (Vigo, A Coruña, Santiago, Pontevedra, Lugo)
components/           — Componentes React
├── gina/             — Widget conversacional completo
├── home/             — Secciones de la home
├── ciudades/         — Layout y FAQ de páginas de ciudad
lib/gina/             — Flujo JSON + motor de estados + persistencia
lib/comunidad/        — Comunidad de Acogida: Supabase, Nominatim, puente a Airtable
app/comunidad/        — Formulario de registro + mapa (Leaflet)
docs/                 — Arquitectura, roadmap, PRD, design-system
├── comunidad-de-acogida.md  — Mapa de comunidad: implementado y verificado end-to-end (§8)
CLAUDE.md             — Reglas del proyecto para Claude Code
```

---

## Variables de entorno

Crear `.env.local` en la raíz con:

```env
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=
GEMINI_API_KEY=
AEMET_API_KEY=
```

Las mismas variables deben estar configuradas en Vercel (Settings → Environment Variables).

---

## Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # build de producción
npm run lint     # ESLint
npx tsc --noEmit # TypeScript
```

---

## Gina

Gina es el asistente conversacional que califica leads antes de que lleguen a Silvana. El flujo vive en `lib/gina/flow.json` (~47 pasos, con bifurcaciones por perfil). Al terminar, guarda el lead en Airtable con una calificación (`potencial` / `en-desarrollo` / `bajo`) y una etiqueta (`califica` / `seguimiento-futuro` / `lead-en-preparacion` / `incompleto`).

La sesión persiste en `localStorage` por 24 horas para no perder conversaciones a mitad en móvil.

---

## Despliegue

Cualquier push a `main` dispara un deploy automático en Vercel. Las ramas siguen la convención `feature/<fase>-<tarea-corta>`.

---

*Actualizado: junio 2026*
