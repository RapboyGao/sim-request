import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-10',
  devtools: { enabled: true },
  css: ['~/assets/main.css', 'vuetify/styles'],
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
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
