import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de servidor con privilegios (bypassea RLS). Usarlo solo en API routes,
 * nunca importarlo desde un componente cliente.
 *
 * BLOQUEO CONOCIDO: SUPABASE_SERVICE_ROLE_KEY no está en .env.local todavía (solo hay
 * anon/publishable key). Sin ella, esta función lanza y el endpoint de registro responde
 * 503 — mismo patrón fail-closed que Upstash en /api/contacto. Conseguir la clave en
 * Supabase → Project Settings → API → service_role.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase no configurado: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } })
}
