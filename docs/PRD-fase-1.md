# PRD Fase 1 — Sitio de marketing + SEO

Documento de requisitos para la primera fase. Es la "fuente de verdad" que leen los agentes
para construir. Criterios de aceptación al final.

**Objetivo medible:** un emigrante que busca en Google "relocation Vigo" (o similar) encuentra
el sitio, entiende el servicio, lee sobre su ciudad y deja su consulta — sin base de datos.

---

## 1. Páginas a construir

| Página | Ruta | Contenido clave |
|---|---|---|
| Home | `/` | hero + métricas + El Marcador + feed Instagram + preview muro de llaves + CTAs |
| Vigo | `/ciudades/vigo` | intro local + precios orientativos + CTA + FAQ local |
| A Coruña | `/ciudades/a-coruna` | ídem |
| Santiago | `/ciudades/santiago-de-compostela` | ídem |
| Pontevedra | `/ciudades/pontevedra` | ídem |
| Lugo | `/ciudades/lugo` | ídem |
| Cómo funciona | `/como-funciona` | proceso en 6 pasos con tiempos |
| Sobre Silvana | `/sobre-silvana` | historia personal de emigrante con raíces gallegas |
| FAQ | `/faq` | 15-20 preguntas frecuentes (SEO) |
| Diagnóstico | `/diagnostico` | el formulario de viabilidad (ver §3) |
| Agenda | `/agenda` | Cal.com embebido |

---

## 2. Componentes de la home (en orden vertical)

1. **Hero:** titular con Galicia nombrada + 2 CTAs (Agenda videollamada / WhatsApp).
2. **Métricas:** +200 familias reubicadas · 4 años · 57 familias en 2025.
3. **El Marcador:** anuncios contactados / propietarios que dijeron no / familias ubicadas este
   mes / tiempo medio. **Lee de una Google Sheet** que Silvana actualiza (sin tocar código).
4. **Cómo funciona (resumen):** 5-6 pasos con enlace a la página completa.
5. **Ciudades:** cards de las 5 ciudades.
6. **Feed de Instagram** embebido (widget tipo Behold o API).
7. **Muro de llaves (preview):** grilla de fotos de entregas + enlace.
8. **Testimonios:** con foto, nombre, ciudad de origen y ciudad en Galicia.
9. **CTA final** + WhatsApp flotante presente en toda la web.

---

## 3. Formulario de diagnóstico (no "contacto")

Reproduce el formulario de viabilidad existente. Al enviar, **guarda el lead en Airtable/Sheets**
vía `POST /api/lead`. Mensaje de éxito: aviso de respuesta en 48 h hábiles.

**Campos** (con consentimiento RGPD obligatorio al final):
1. Nombre completo (texto)
2. Email (texto, validar)
3. Teléfono con código internacional (texto)
4. País de residencia actual (texto)
5. Personas que vivirán (nº adultos + edades niños) (texto largo)
6. ¿Mascotas? (sí/no) → si sí: cantidad, especie, raza, peso (texto largo)
7. Documentación para residir legalmente (4 opciones: pasaporte UE / visado-TIE-NIE / en trámite / turista)
8. Situación laboral al llegar (6 opciones)
9. Ingresos netos mensuales demostrables en € (texto)
10. Garantías posibles (multi: adelanto 6-12 meses / aval / seguro impago / ninguna)
11. Ciudad destino (Vigo / A Coruña / indiferente) — ampliar a las 5
12. Presupuesto mensual (4 rangos)
13. Habitaciones mínimas (1/2/3/4+)
14. ¿Amueblado? (sí / no / indiferente)
15. ¿Estacionamiento? (indispensable / no / deseable)
16. Fecha estimada de llegada (fecha)
17. Inicio de contrato deseado (fecha)
18. Modalidad (alquilar antes de viajar / buscar ya estando allá)
19. Comprensión del servicio (entiende que es personal shopper, no inmobiliaria)
20. ☑ Consentimiento de tratamiento de datos + enlace a política de privacidad

> El flujo conversacional de Gina (definido en `/docs/gina-flujo.md`) es la versión chat de esto; se implementa
> en Fase 4. En Fase 1 alcanza con el formulario web.

---

## 4. SEO (requisitos para el SEO Specialist)

- URLs limpias por ciudad (ver tabla §1).
- `<title>` y `meta description` por página, con keyword local.
- Schema.org: `LocalBusiness` + `FAQPage` en las FAQ + `Service`.
- `sitemap.ts` y `robots.ts` generados.
- Keywords primarias objetivo: relocation galicia, relocation vigo, relocation a coruña,
  alquiler emigrantes vigo, mudarse a galicia desde argentina.

---

## 5. Integraciones de Fase 1

| Integración | Cómo | Carril |
|---|---|---|
| El Marcador | leer Google Sheet pública o vía API | Backend Architect |
| Leads | `POST /api/lead` → Airtable/Sheets | Backend Architect |
| Instagram | widget Behold o API básica | Frontend Developer |
| Agenda | embed de Cal.com | Frontend Developer |
| WhatsApp | enlace `wa.me` con mensaje predefinido | Frontend Developer |

---

## 6. Criterios de aceptación (Definición de Hecho de la fase)

- [ ] Las 11 páginas existen, responden y se ven bien en móvil y escritorio.
- [ ] El formulario de diagnóstico guarda el lead y muestra confirmación.
- [ ] El Marcador muestra los números de la Google Sheet sin tocar código.
- [ ] WhatsApp flotante visible en todas las páginas con mensaje predefinido.
- [ ] Agenda de Cal.com funciona desde `/agenda` y desde los CTAs.
- [ ] Lighthouse: SEO ≥ 95, Accesibilidad ≥ 95, Performance ≥ 90 en móvil
      (lo verifica `Performance Benchmarker` + `Accessibility Auditor`).
- [ ] `sitemap.xml` y `robots.txt` accesibles; schema válido.
- [ ] Consentimiento RGPD presente en el formulario + página de política de privacidad.
- [ ] `Code Reviewer` aprobó los PR y `Reality Checker` certificó la fase.
