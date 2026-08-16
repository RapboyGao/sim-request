import { usePreferredDark, useStorage } from '@vueuse/core'
import type { ThemeMode } from '~/composables/useThemeMode'

export function useChecklistsTheme(scope: 'public' | 'private' = 'private') {
  const mode = useStorage<ThemeMode>(`${scope}-theme-mode-v1`, 'system')
  const prefersDark = usePreferredDark()
  const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && prefersDark.value))

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  function cycleMode() {
    const order: ThemeMode[] = ['system', 'light', 'dark']
    const index = order.indexOf(mode.value)
    setMode(order[(index + 1) % order.length] || 'system')
  }

  return { mode, isDark, setMode, cycleMode }
}
