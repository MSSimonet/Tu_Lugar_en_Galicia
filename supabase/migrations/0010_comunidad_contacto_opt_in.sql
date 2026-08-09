-- Comunidad de Acogida — el teléfono deja de ser legible con la anon key (PII-01).
--
-- Hallazgo de la auditoría del 2026-08-08: la anon key es pública (viaja en el bundle del
-- navegador) y desde 0003 tiene grant de SELECT sobre la columna `contacto`. Combinado con la
-- policy RLS "comunidad_select_public" ... using (true) de 0001, eso permite volcar en bulk
-- nombre + teléfono + ubicación de TODA la comunidad con un solo GET a la REST API, sin
-- registrarse ni pasar por el mapa:
--   GET https://<proyecto>.supabase.co/rest/v1/comunidad?select=nombre,contacto,lat,lng
-- Es el mismo tipo de fuga que 0002 arregló para `email`, sobre la otra columna sensible.
--
-- Fix: el teléfono pasa a ser opt-in explícito. Sale del alcance de la anon key por completo;
-- quien quiera mostrarlo activa `mostrar_contacto`, y entonces se sirve de a un perfil por vez
-- desde un endpoint propio con rate limit (app/api/comunidad/[id]/contacto), nunca en bulk.
--
-- NO SE BORRA NINGÚN DATO. Los teléfonos ya guardados siguen en la tabla, intactos: lo que
-- cambia es quién puede leerlos. El backend (service_role) no se ve afectado — bypassea RLS y
-- los grants de columna no le aplican.
--
-- ─────────────────────────────────────────────────────────────────────────────────────────
-- EL ORDEN DE LAS SENTENCIAS ES DELIBERADO — leer antes de reordenar o de partir el archivo.
--
-- La migración 0003 existe porque de 0002 se ejecutó solo la primera sentencia (el `revoke`) y
-- no la segunda (el `grant`): el email dejó de filtrarse, pero el mapa público quedó SIN UN
-- SOLO PIN, porque la anon key perdió acceso a todas las columnas de golpe. PostgREST rechaza
-- la consulta entera con "42501: permission denied" cuando falta el grant de UNA columna
-- pedida — no devuelve las demás.
--
-- Este archivo está ordenado para que ese accidente no pueda repetirse: las tres primeras
-- sentencias son ADITIVAS y la única que quita acceso va ÚLTIMA. Si la ejecución se corta a
-- mitad, el resultado es el estado actual (seguro y funcionando), nunca el mapa roto:
--   corta en 1, 2 o 3 → el mapa sigue funcionando entero, el teléfono sigue como hoy.
--   corta en 4        → el mapa sigue funcionando entero, el teléfono ya no se lee. Objetivo.
-- Ninguna parada intermedia deja el mapa sin pines.
--
-- Por eso el paso 4 revoca SOLO la columna `contacto` en vez de revocar la tabla entera y
-- volver a otorgar la lista completa, como hacían 0002 y 0003: así no vuelve a depender de que
-- el archivo se ejecute completo.
-- ─────────────────────────────────────────────────────────────────────────────────────────
--
-- CÓMO EJECUTAR (mismo bloqueo que 0001/0002/0003 — no hay credenciales de Supabase en este
-- entorno para aplicarlo por CLI): pegar este archivo completo en el SQL Editor del dashboard
-- de Supabase (Project → SQL Editor → New query) y correrlo una vez contra producción.
--
-- VERIFICAR DESPUÉS con llamadas anónimas reales (la anon key, no la service_role):
--   curl ".../rest/v1/comunidad?select=contacto" -H "apikey: <anon key>"
--     → debe dar 42501 / permission denied. Es el fix.
--   curl ".../rest/v1/comunidad?select=id,nombre,foto_url,lat,lng,disponibilidad,mostrar_contacto,updated_at" -H "apikey: <anon key>"
--     → debe dar 200 con datos (o "[]" si la tabla está vacía). Es la query real del mapa
--       (components/comunidad/MapaComunidad.tsx). Si esta falla, el mapa queda sin pines.
--   curl ".../rest/v1/comunidad?select=email" -H "apikey: <anon key>"
--     → debe seguir dando 42501, como desde 0002.

-- 1. Columna nueva. Aditiva: nada de lo que hoy funciona depende de ella todavía.
--    `not null default false` = todo el mundo arranca con el teléfono oculto, incluidas las
--    filas que ya existen (Postgres las rellena con el default al agregar la columna).
alter table comunidad
  add column if not exists mostrar_contacto boolean not null default false;

comment on column comunidad.mostrar_contacto is 'Opt-in explícito para mostrar el teléfono (PII-01, migración 0010). false = el teléfono no se entrega a nadie, ni siquiera de a uno; el mapa ofrece "enviar mensaje privado". true = se entrega de a un perfil por vez desde /api/comunidad/[id]/contacto, nunca en el select masivo del mapa. La anon key NO tiene grant sobre `contacto`, así que este flag es la única puerta.';

-- 2. Fijar el valor explícito en las filas que ya tienen teléfono cargado.
--
--    ESTO ES UN NO-OP Y ESTÁ PUESTO A PROPÓSITO: el `not null default false` del paso 1 ya
--    dejó en false todas las filas preexistentes, así que este UPDATE no cambia ni una. Se
--    escribe igual para que la intención quede en el historial de migraciones y para que su
--    ausencia no se lea, más adelante, como un olvido: nadie queda expuesto por omisión, y las
--    personas que ya habían dado su teléfono quedan protegidas desde el minuto cero sin que se
--    les toque el dato.
update comunidad
   set mostrar_contacto = false
 where contacto is not null
   and contacto <> '';

-- 3. Otorgar la columna nueva a los roles públicos.
--    Hace falta explícitamente: una columna agregada DESPUÉS de un grant por columnas (0003)
--    no queda cubierta por aquel grant. Sin esto, el mapa pediría `mostrar_contacto` y toda la
--    consulta fallaría con 42501 — exactamente el modo de falla de 0002 → 0003.
grant select (mostrar_contacto) on comunidad to anon, authenticated;

-- 4. ÚLTIMA A PROPÓSITO (ver el bloque de arriba). Es la única sentencia que quita acceso.
--    A partir de acá `contacto` sale del alcance de la anon key: el volcado masivo deja de ser
--    posible y el mapa nunca más puede pedir esa columna.
revoke select (contacto) on comunidad from anon, authenticated;
