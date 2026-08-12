-- Comunidad de Acogida — la foto de perfil pasa a subirse como archivo (B2).
--
-- QUÉ CAMBIA: hasta ahora la foto era una URL que la persona pegaba a mano ("tu foto de perfil
-- en redes sociales"). Ahora se sube un archivo desde el dispositivo, el backend lo sanea
-- (lib/comunidad/imagenSegura.ts: valida por magic bytes y borra EXIF/XMP/IPTC, que en una foto
-- de móvil llevan el GPS del lugar donde se tomó) y lo guarda en Supabase Storage.
--
-- POR QUÉ HACE FALTA APROBACIÓN MANUAL: pasar de "pega un enlace" a "sube un archivo" cambia
-- quién aloja la imagen. Antes la foto vivía en el servidor de un tercero y nosotros
-- guardábamos un enlace; ahora la sirve nuestro dominio, y cualquier cosa que alguien suba
-- queda publicada bajo la marca. No hay moderación automática — decisión tomada: la revisa
-- Silvana. Mismo patrón que `mostrar_contacto` en la 0010: un booleano que nace en false y
-- que hasta que no se ponga en true no deja salir nada.
--
-- ─────────────────────────────────────────────────────────────────────────────────────────
-- EL ORDEN ES DELIBERADO, por el mismo motivo que en la 0010: las sentencias ADITIVAS van
-- primero y la única que QUITA acceso (`revoke select (foto_url)`) va última. Si la ejecución
-- se corta a la mitad, el resultado es el estado actual —funcionando— y nunca un mapa roto.
-- Recordatorio de por qué importa: PostgREST rechaza la consulta ENTERA con 42501 si falta el
-- grant de UNA sola columna pedida. Es lo que dejó el mapa sin un pin entre 0002 y 0003.
-- ─────────────────────────────────────────────────────────────────────────────────────────
--
-- CÓMO EJECUTAR (mismo bloqueo de siempre — Claude no tiene credenciales para aplicarla):
-- pegar este archivo completo en el SQL Editor del dashboard de Supabase
-- (Project → SQL Editor → New query) y correrlo una vez.
--
-- ⚠️ CORRER ESTO **ANTES** DE DESPLEGAR EL CÓDIGO. El mapa pasa a pedir `foto_publica`; si el
-- código sale primero, esa columna no existe todavía y la consulta falla entera → mapa sin
-- pines. Al revés no pasa nada: la columna existe y el código viejo simplemente no la pide.
--
-- VERIFICAR DESPUÉS, con la anon key (no la service_role):
--   curl ".../rest/v1/comunidad?select=foto_url" -H "apikey: <anon>"      → 42501. Es el fix.
--   curl ".../rest/v1/comunidad?select=id,nombre,foto_publica,lat,lng,disponibilidad,mostrar_contacto,updated_at" -H "apikey: <anon>"
--     → 200 con datos (o "[]"). Es la consulta real del mapa. Si falla, el mapa queda sin pines.

-- 1. El flag de aprobación. Aditivo: todavía nadie lo lee.
alter table comunidad
  add column if not exists foto_aprobada boolean not null default false;

comment on column comunidad.foto_aprobada is 'Aprobación manual de la foto de perfil (B2). false = la foto no se muestra a nadie; el mapa dibuja las iniciales. Nace en false para toda foto subida. No hay moderación automática: lo revisa Silvana y lo pone en true a mano.';

-- 2. Backfill de las fotos que YA existen. No es un no-op como el paso 2 de la 0010: estas
--    filas vienen del flujo viejo, donde la persona pegaba el enlace de una foto suya ya
--    publicada en internet. Esas fotos están en el mapa hoy y nadie pidió bajarlas; dejarlas
--    en false las haría desaparecer de golpe, que sería una regresión disfrazada de medida de
--    seguridad. El control nuevo aplica a lo que se suba de acá en adelante.
update comunidad
   set foto_aprobada = true
 where foto_url is not null
   and foto_url <> '';

-- 3. La columna que ve el público. Es GENERADA: no se puede escribir, no se puede desincronizar
--    del flag, y no hay ninguna ruta de código que pueda equivocarse y publicar una foto sin
--    aprobar. Es la diferencia entre "el cliente decide no mostrarla" y "el dato no sale de la
--    base": con un `if` en React, un GET directo a la REST API con la anon key —que es pública,
--    viaja en el bundle— seguiría devolviendo la URL de toda foto pendiente de revisión.
alter table comunidad
  add column if not exists foto_publica text
  generated always as (case when foto_aprobada then foto_url end) stored;

comment on column comunidad.foto_publica is 'Espejo de foto_url que solo tiene valor cuando foto_aprobada es true. Es la ÚNICA de las dos que puede leer la anon key: `foto_url` quedó revocada en esta misma migración. Generada, así que no admite escritura ni puede quedar fuera de sincronía.';

-- 4. Otorgar las columnas nuevas. Explícito y obligatorio: una columna agregada DESPUÉS de un
--    grant por columnas (0003) no queda cubierta por aquel grant.
grant select (foto_aprobada, foto_publica) on comunidad to anon, authenticated;

-- 5. El bucket de Storage. `public = true` = las URLs se sirven sin firmar, que es lo que
--    necesita una foto de perfil dentro de un popup del mapa. No abre nada de más: el nombre
--    de cada archivo lleva un UUID, así que no hay ruta adivinable, y sin permiso de `list`
--    sobre el bucket no se puede enumerar lo que hay dentro.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comunidad-fotos',
  'comunidad-fotos',
  true,
  4194304, -- 4 MiB, el mismo tope que valida el endpoint. Segunda línea, por si la primera falla.
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 6. Escritura solo desde el backend. NO se crean políticas de insert/update/delete para anon
--    ni authenticated sobre storage.objects: sin política que lo permita, RLS lo deniega. El
--    único que escribe es la service_role del endpoint /api/comunidad/foto, que bypassea RLS.
--    Sin esto, la anon key podría subir archivos arbitrarios a nuestro dominio directamente
--    contra la API de Storage, saltándose el saneado de EXIF y el rate limit.

-- 7. ÚLTIMA A PROPÓSITO (ver el bloque de arriba). La única que quita acceso: a partir de acá
--    `foto_url` sale del alcance de la anon key y la foto sin aprobar deja de ser legible por
--    ninguna vía pública.
revoke select (foto_url) on comunidad from anon, authenticated;
