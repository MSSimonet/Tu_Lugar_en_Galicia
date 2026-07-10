-- Comunidad de Acogida — repara el GRANT de columnas roto por 0002_comunidad_restringir_email.sql.
-- Hallazgo de la re-verificación del 2026-07-10 (ver docs/comunidad-de-acogida.md §8.4):
-- 0002 se ejecutó contra producción (el `revoke select on comunidad from anon, authenticated`
-- SÍ está aplicado — confirmado porque `select=email` con la anon key ahora da
-- "42501: permission denied for table comunidad" en vez de devolver el dato), pero el `grant
-- select (id, nombre, foto_url, lat, lng, disponibilidad, contacto, updated_at) ...` que le
-- sigue en el mismo archivo NO quedó aplicado: la misma prueba pidiendo esas columnas
-- (las que usa components/comunidad/MapaComunidad.tsx) también devuelve 42501. Resultado
-- real: el email ya no se filtra, pero el mapa público está roto — nadie puede ver ningún pin,
-- porque la anon key no puede leer ninguna columna de `comunidad`.
--
-- No se pudo determinar la causa exacta desde este entorno (sin acceso a la consola SQL de
-- Supabase ni a su historial de ejecución) — posibles explicaciones: solo se pegó/ejecutó la
-- primera sentencia del archivo 0002, o el GRANT falló silenciosamente por algún motivo no
-- visible en la respuesta de la REST API. No importa la causa: este archivo es idempotente y
-- seguro de correr independientemente de qué haya pasado antes.
--
-- CÓMO EJECUTAR: igual que 0001 y 0002 — pegar este archivo completo en el SQL Editor del
-- dashboard de Supabase (Project → SQL Editor → New query) contra el proyecto de producción.
-- Verificar después con las mismas llamadas anónimas reales:
--   curl ".../rest/v1/comunidad?select=email" -H "apikey: <anon key>"
--     → debe seguir dando 42501 (email nunca legible).
--   curl ".../rest/v1/comunidad?select=id,nombre,foto_url,lat,lng,disponibilidad,contacto,updated_at" -H "apikey: <anon key>"
--     → debe dar 200 con datos (o "[]" si la tabla está vacía) — esta es la que usa el mapa.

grant select (
  id,
  nombre,
  foto_url,
  lat,
  lng,
  disponibilidad,
  contacto,
  updated_at
) on comunidad to anon, authenticated;
