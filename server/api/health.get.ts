export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  const hasSupabaseUrl = Boolean(config.public.supabaseUrl || process.env.SUPABASE_URL)
  const hasPublishableKey = Boolean(
    config.public.supabasePublishableKey || process.env.SUPABASE_PUBLISHABLE_KEY,
  )
  const hasSecretKey = Boolean(config.supabaseSecretKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY)

  return {
    ok: hasSupabaseUrl && hasPublishableKey && hasSecretKey,
    productionReady: hasSupabaseUrl && hasPublishableKey && hasSecretKey,
    supabase: {
      url: hasSupabaseUrl,
      publishableKey: hasPublishableKey,
      secretKey: hasSecretKey,
    },
  }
})
