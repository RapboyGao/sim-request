import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2026-04-10',
  devtools: { enabled: true },
  devServer: {
    port: 1345,
  },
  css: ['~/assets/scss/main.scss', 'vuetify/styles'],
  modules: ['@nuxtjs/i18n', '@vite-pwa/nuxt'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    build: {
      sourcemap: false,
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    plugins: [vuetify()],
  },
  runtimeConfig: {
    localJsonStorageFile: process.env.BOOKING_STORAGE_FILE || '.data/bookings.json',
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
      checklistsPassword: process.env.NUXT_PUBLIC_CHECKLISTS_PASSWORD || process.env.CHECKLISTS_PASSWORD || '13515',
    },
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'zh-CN',
    langDir: 'locales',
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN.json', language: 'zh-CN' },
      { code: 'en', name: 'English', file: 'en.json', language: 'en-US' },
      { code: 'ja', name: '日本語', file: 'ja.json', language: 'ja-JP' },
      { code: 'ko', name: '한국어', file: 'ko.json', language: 'ko-KR' },
      { code: 'fr', name: 'Français', file: 'fr.json', language: 'fr-FR' },
    ],
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: [
      'favicon.svg',
      'apple-touch-icon.svg',
      'favicon.png',
      'apple-touch-icon.png',
      'pwa-192x192.png',
      'pwa-512x512.png',
    ],
    manifest: {
      id: '/',
      name: 'Observation 预约',
      short_name: 'Observation',
      description: 'Observation 预约系统，用于模拟机观摩预约、日历查看与管理。',
      lang: 'zh-CN',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      theme_color: '#0f766e',
      background_color: '#f8fafc',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
  nitro: {
    preset: 'netlify',
  },
})
