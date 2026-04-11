import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-10',
  devtools: { enabled: true },
  css: ['~/assets/main.css', 'vuetify/styles'],
  modules: ['@nuxtjs/i18n'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    plugins: [vuetify()],
  },
  runtimeConfig: {
    bookingKvBinding: process.env.BOOKING_KV_BINDING || 'BOOKING_KV',
    localJsonStorageFile: process.env.BOOKING_STORAGE_FILE || '.data/bookings.json',
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
    prerender: {
      routes: ['/'],
    },
  },
})
