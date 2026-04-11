import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import type { ThemeMode } from '~/composables/useThemeMode'
import { resolveThemeName } from '~/composables/useThemeMode'

export default defineNuxtPlugin((nuxtApp) => {
  const modeCookie = useCookie<ThemeMode>('booking-theme-mode', {
    default: () => 'system',
    sameSite: 'lax',
  })
  const themeMode = useState<ThemeMode>('booking-theme-mode', () => modeCookie.value || 'system')
  const prefersDark = import.meta.client
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
  const initialThemeName = resolveThemeName(themeMode.value, prefersDark)

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
      defaultTheme: initialThemeName,
      themes: {
        bookingLight: {
          dark: false,
          colors: {
            background: '#f6f4ef',
            surface: '#ffffff',
            'surface-variant': '#f1ede4',
            'on-surface': '#1f2937',
            'on-surface-variant': '#6b7280',
            primary: '#0f766e',
            secondary: '#f97316',
            error: '#dc2626',
          },
        },
        bookingDark: {
          dark: true,
          colors: {
            background: '#0f172a',
            surface: '#111827',
            'surface-variant': '#1f2937',
            'on-surface': '#e5e7eb',
            'on-surface-variant': '#9ca3af',
            primary: '#2dd4bf',
            secondary: '#fb923c',
            error: '#f87171',
          },
        },
      },
    },
    icons: {
      defaultSet: 'mdi',
    },
  })

  nuxtApp.vueApp.use(vuetifyInstance)

  const applyTheme = (mode: ThemeMode) => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = resolveThemeName(mode, systemDark)

    vuetifyInstance.theme.global.name.value = resolved

    if (import.meta.client) {
      document.documentElement.dataset.theme = mode
      document.documentElement.style.colorScheme =
        mode === 'system' ? (systemDark ? 'dark' : 'light') : (resolved === 'bookingDark' ? 'dark' : 'light')
    }
  }

  watch(
    themeMode,
    (mode) => {
      modeCookie.value = mode
      if (import.meta.client) {
        applyTheme(mode)
      }
    },
    { immediate: true },
  )

  if (import.meta.client) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', () => {
      if (themeMode.value === 'system') {
        applyTheme('system')
      }
    })
  }
})
