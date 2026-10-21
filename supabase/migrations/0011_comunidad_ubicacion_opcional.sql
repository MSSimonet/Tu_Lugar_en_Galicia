-- Comunidad de Acogida — la ubicación pasa a ser opcional (B1).
--
-- QUÉ CAMBIA Y POR QUÉ:
-- El alta exigía las dos calles de una intersección porque `lat`/`lng` nacieron `not null`
-- en la migración 0001. Eso convertía un dato de comodidad en un requisito de entrada: quien
-- no quería decir por qué esquina anda —o simplemente vive en una aldea sin un cruce que
-- Nominatim reconozca— no podía registrarse en absoluto.
--
-- Ahora las calles son opcionales y el perfil sin ellas se guarda con lat/lng en null. NO se
-- inventa una ubicación: nada de "centro de la ciudad" ni de jitter aleatorio alrededor de un
-- punto. Un pin en un lugar donde la persona no está es peor que no tener pin, porque se lee
-- como información y no lo es. Esos perfiles aparecen en un listado debajo del mapa.
--
-- CÓMO EJECUTAR (mismo bloqueo que la 0001 y la 0010 — Claude no tiene credenciales para
-- correrla): pegar este archivo en el SQL Editor del dashboard de Supabase
-- (Project → SQL Editor → New query) y correrlo una vez. Alternativa: `supabase db push` con
-- el proyecto linkeado.
--
-- ⚠️ CORRER ESTO **ANTES** DE DESPLEGAR EL CÓDIGO QUE LA ACOMPAÑA. Si el código sale primero,
-- todo alta sin calles falla con un 23502 (not-null violation) en el momento en que la persona
-- hace clic en el enlace del correo — o sea, en el paso donde ya no hay forma de reintentar.
-- Al revés no pasa nada: la columna acepta nulls y el código viejo simplemente nunca los manda.

alter table comunidad alter column lat drop not null;
alter table comunidad alter column lng drop not null;

comment on column comunidad.lat is 'Centro del círculo de privacidad de 200m — no es la dirección exacta del usuario. Null cuando el perfil se dio de alta sin intersección: ese perfil no tiene pin y se muestra en el listado, nunca con una ubicación aproximada inventada.';
comment on column comunidad.lng is 'Centro del círculo de privacidad de 200m — no es la dirección exacta del usuario. Null cuando el perfil se dio de alta sin intersección: ese perfil no tiene pin y se muestra en el listado, nunca con una ubicación aproximada inventada.';
