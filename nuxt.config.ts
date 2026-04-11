import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-10',
  devtools: { enabled: true },
  devServer: {
    port: 1345,
  },
  css: ['~/assets/main.css', 'vuetify/styles'],
  modules: ['@nuxtjs/i18n'],
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
  nitro: {
    preset: 'netlify',
    prerender: {
      routes: ['/'],
    },
  },
})
