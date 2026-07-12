import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente de servidor compartido con privilegios (bypassea RLS via service_role).
 * Usarlo solo en API routes o Server Components, nunca importarlo desde un
 * componente cliente. Lo comparten leads (lib/leads.ts, lib/admin/leadsRepo.ts)
 * y comunidad (lib/comunidad/perfil.ts) — ambos apuntan al mismo proyecto Supabase.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase no configurado: falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } })
}
