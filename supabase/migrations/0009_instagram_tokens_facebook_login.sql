-- Corrección de arquitectura: la app de Meta real usa "Inicio de sesión con Facebook"
-- (Instagram Graph API vía Página de Facebook vinculada), no "Instagram API with Instagram
-- Login" como se asumió en 0008. Mismo App ID/Secret (son de la app, no del producto) —
-- cambian los endpoints y el modelo de datos: ahora hace falta guardar también la Página de
-- Facebook y su Page Access Token, que es el que de verdad se usa para leer /media.
--
-- `access_token` pasa a ser el Page Access Token (lo que usa lib/instagram/posts.ts).
-- `user_access_token` es el long-lived user token (~60 días) del que se re-deriva el Page
-- Access Token en cada refresco — Meta no expone un "refresh" directo del Page token.
--
-- CÓMO EJECUTAR: igual que 0008, pegar en el SQL Editor de Supabase.

alter table instagram_tokens
  add column page_id text,
  add column user_access_token text;

comment on column instagram_tokens.access_token is
  'Page Access Token de la Página de Facebook vinculada — se usa para leer /{ig_user_id}/media.';
comment on column instagram_tokens.user_access_token is
  'Long-lived user token (~60 días). refrescar-token lo extiende (fb_exchange_token) y re-deriva page_id/access_token desde /me/accounts.';
comment on column instagram_tokens.expires_at is
  'Expiración del user_access_token — el Page Access Token derivado de un long-lived user token no expira por sí solo mientras el user token siga vivo.';
