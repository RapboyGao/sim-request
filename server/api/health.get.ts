import { hasAdminCredentials } from '~/server/utils/admin-auth'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  const hasSupabaseUrl = Boolean(config.public.supabaseUrl || process.env.SUPABASE_URL)
  const hasPublishableKey = Boolean(
    config.public.supabasePublishableKey || process.env.SUPABASE_PUBLISHABLE_KEY,
  )
  const hasSecretKey = Boolean(config.supabaseSecretKey || process.env.SUPABASE_SECRET_KEY)
  const hasConfiguredAdmin = hasAdminCredentials()

  return {
    ok: hasSupabaseUrl && hasPublishableKey && hasSecretKey && hasConfiguredAdmin,
    productionReady: hasSupabaseUrl && hasPublishableKey && hasSecretKey && hasConfiguredAdmin,
    supabase: {
      url: hasSupabaseUrl,
      publishableKey: hasPublishableKey,
      secretKey: hasSecretKey,
    },
    admin: {
      credentials: hasConfiguredAdmin,
    },
  }
})
