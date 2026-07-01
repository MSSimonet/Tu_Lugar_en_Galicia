# Briefing — Tu Lugar en Galicia

> Pegá este archivo en un chat nuevo de Claude Code para orientarte al instante.

---

## 1. Qué es este proyecto

Web de **Tu Lugar en Galicia**: servicio de relocation especializado en Galicia para familias
emigrantes (principalmente de Latinoamérica) que necesitan alquiler antes de llegar.
Fundadora: **Silvana Lorenzo**. El sitio capta leads, los cualifica con la IA Gina y agenda
videollamadas con Silvana.

**Stack BLOQUEADO:** Next.js 15 App Router + TypeScript + Tailwind v4 + Vercel + Airtable.
IA: Gemini (no Claude). Sin base de datos hasta Fase 5.

---

## 2. Estado actual

| Área | Estado |
|---|---|
| Flujo de agenda completo (9 piezas) | ✅ Implementado |
| Gina (asistente IA) | ✅ Con rate limiting Upstash |
| PDF de plan estratégico | ✅ Auth + generación |
| Emails transaccionales (Resend) | ✅ |
| Recordatorio horario Silvana | ✅ GitHub Actions |
| Motor del plan estratégico | ✅ `lib/plan/armador.ts` |
| CSP + HSTS + Referrer-Policy | ✅ |
| Política de Privacidad | 🔴 4 TODOs sin completar |
| Rate limiting en `/api/lead` | ⚠️ Desactivado si no hay Upstash |

---

## 3. Flujo de negocio

1. Visita la web → rellena formulario de diagnóstico (`/api/lead`) o habla con Gina
2. Lead guardado en Airtable
3. Resumen diario llega a Silvana por email (`cron: 07:00 España`)
4. Silvana habilita agenda → lead recibe código + enlace Cal.com
5. Lead agenda videollamada
6. Cal.com dispara webhook → confirmación por email al lead + notificación a Silvana
7. Recordatorio automático 1 hora antes de cada videollamada
8. Silvana genera PDF del plan estratégico desde `/admin/lead/[id]`

---

## 4. Próximas prioridades

1. **Completar Política de Privacidad** (A04 — bloquea lanzamiento público)
   - Razón social, dirección postal, email de protección de datos
   - Archivo: `app/politica-de-privacidad/page.tsx`
2. **Completar env vars en producción** (Airtable, Cal.com, Resend, Upstash, AEMET)
3. **Test end-to-end** del flujo de agenda completo con datos reales
4. **Fase 3** — scraping de pisos (Idealista/Fotocasa) para cuadro comparativo

---

## 5. Pendientes de Silvana (no desbloqueables por código)

- Razón social y dirección para la Política de Privacidad
- Configurar webhook en Cal.com (URL: `/api/webhooks/calcom`)
- Crear tabla de Airtable con los campos del formulario
- Configurar dominio personalizado en Resend
- Subir env vars a Vercel (ver `.env.local.example`)
- Aprobar/desbloquear agenda de clientes manualmente desde el resumen diario

---

## 6. Cómo trabajar en este chat

- **Leer antes de tocar:** `CLAUDE.md`, `docs/roadmap.md`, `docs/ARCHITECTURE.md`
- **Nunca commitear sin que el usuario diga "commitear" / "aprobado, dale"**
- **Stack bloqueado:** no proponer PHP, base de datos antes de Fase 5, ni API de Anthropic
- **Tokens de Tailwind:** en `app/globals.css` (`@theme`), no en `tailwind.config.ts`
- **Agentes disponibles:** ver `CLAUDE.md §3`; usar en paralelo cuando sea posible
- **Auditoría permanente:** ver `CLAUDE.md §10` para incidencias abiertas
- **Voz de marca:** "tú" neutro para el cliente; "vos" solo en conversación interna con el equipo
