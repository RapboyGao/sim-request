export type ThemeMode = 'system' | 'light' | 'dark'

export function useThemeMode() {
  const themeMode = useState<ThemeMode>('booking-theme-mode', () => 'system')

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
  }

  function themeModeIcon(mode = themeMode.value) {
    if (mode === 'dark') return 'mdi-weather-night'
    if (mode === 'light') return 'mdi-weather-sunny'
    return 'mdi-theme-light-dark'
  }

  function themeModeColor(mode = themeMode.value) {
    if (mode === 'dark') return 'indigo-darken-1'
    if (mode === 'light') return 'amber-darken-1'
    return 'primary'
  }

  function themeModeLabel(mode = themeMode.value) {
    const { t } = useI18n()
    const map: Record<ThemeMode, string> = {
      system: t('app.themeSystem'),
      light: t('app.themeLight'),
      dark: t('app.themeDark'),
    }
    return map[mode]
  }

  return {
    themeMode,
    setThemeMode,
    themeModeIcon,
    themeModeColor,
    themeModeLabel,
  }
}
