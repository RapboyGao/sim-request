import { usePreferredDark, useStorage } from '@vueuse/core'
type ChecklistThemeMode = 'system' | 'light' | 'dark'

export function useChecklistsTheme() {
  const mode = useStorage<ChecklistThemeMode>('public-theme-mode-v1', 'system')
  const prefersDark = usePreferredDark()
  const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && prefersDark.value))

  function setMode(next: ChecklistThemeMode) {
    mode.value = next
  }

  function cycleMode() {
    const order: ChecklistThemeMode[] = ['system', 'light', 'dark']
    const index = order.indexOf(mode.value)
    setMode(order[(index + 1) % order.length] || 'system')
  }

  return { mode, isDark, setMode, cycleMode }
}
