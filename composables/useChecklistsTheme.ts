import { usePreferredDark, useStorage } from '@vueuse/core'
type ChecklistThemeMode = 'system' | 'light' | 'dark'
type ResolvedChecklistThemeMode = 'light' | 'dark'

export function useChecklistsTheme() {
  const mode = useStorage<ChecklistThemeMode>('public-theme-mode-v1', 'system')
  const prefersDark = usePreferredDark()
  const resolvedMode = computed<ResolvedChecklistThemeMode>(() =>
    mode.value === 'dark' || (mode.value === 'system' && prefersDark.value) ? 'dark' : 'light',
  )
  const isDark = computed(() => resolvedMode.value === 'dark')

  function setMode(next: ChecklistThemeMode) {
    mode.value = next
  }

  function cycleMode() {
    const order: ChecklistThemeMode[] = ['system', 'light', 'dark']
    const index = order.indexOf(mode.value)
    setMode(order[(index + 1) % order.length] || 'system')
  }

  return { mode, resolvedMode, isDark, setMode, cycleMode }
}
