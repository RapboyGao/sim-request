import { createClient } from '@supabase/supabase-js'

export function getSupabaseServerClient() {
  if (import.meta.dev) return null

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl || process.env.SUPABASE_URL
  const secretKey = config.supabaseSecretKey || process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) return null

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
