import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetifyInstance = createVuetify({
    components,
    directives,
    defaults: {
      VBtn: { rounded: 'lg', variant: 'flat' },
      VCard: { rounded: 'xl' },
      VTextField: { variant: 'outlined', density: 'comfortable' },
      VSelect: { variant: 'outlined', density: 'comfortable' },
      VSwitch: { color: 'teal' },
    },
    theme: {
      defaultTheme: 'bookingTheme',
      themes: {
        bookingTheme: {
          dark: false,
          colors: {
            background: '#f6f4ef',
            surface: '#ffffff',
            primary: '#0f766e',
            secondary: '#f97316',
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetifyInstance)
})
