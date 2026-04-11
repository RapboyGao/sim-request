<template>
  <v-app>
    <v-app-bar color="surface" elevation="1" density="comfortable">
      <v-app-bar-nav-icon class="d-md-none" icon="mdi-menu" @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">{{ t('app.title') }}</v-app-bar-title>
      <v-spacer />
      <div class="d-none d-md-flex app-links">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon variant="text" v-bind="props" :aria-label="t('app.navTheme')">
              <v-icon :icon="themeModeIcon()" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="mode in themeModes"
              :key="mode.value"
              :active="themeMode === mode.value"
              :prepend-icon="mode.icon"
              :title="mode.label"
              @click="setThemeMode(mode.value)"
            />
          </v-list>
        </v-menu>
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon variant="text" v-bind="props" :aria-label="t('app.navLanguage')">
              <v-icon icon="mdi-web" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item v-for="locale in locales" :key="locale.code" :to="switchLocalePath(locale.code)"
              :title="locale.code" :prepend-icon="localeIcon(locale.code)" />
          </v-list>
        </v-menu>
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon variant="text" v-bind="props" :aria-label="t('app.title')">
              <v-icon icon="mdi-menu" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item :to="localePath('/')" :title="t('app.navBooking')" prepend-icon="mdi-bookmark-plus-outline" />
            <v-list-item :to="localePath('/rules')" :title="t('app.navRules')"
              prepend-icon="mdi-book-open-variant-outline" />
            <v-list-item :to="localePath('/calendar')" :title="t('app.navCalendar')"
              prepend-icon="mdi-calendar-month-outline" />
            <v-list-item :to="localePath('/admin')" :title="t('app.navAdmin')"
              prepend-icon="mdi-shield-account-outline" />
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" class="d-md-none">
      <v-list nav density="comfortable">
        <v-list-item
          :title="t('app.navTheme')"
          :prepend-icon="themeModeIcon()"
          @click.stop
        >
          <template #append>
            <v-menu location="end">
              <template #activator="{ props }">
                <v-btn icon variant="text" size="small" v-bind="props" :aria-label="t('app.navTheme')">
                  <v-icon icon="mdi-menu-down" />
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  v-for="mode in themeModes"
                  :key="mode.value"
                  :active="themeMode === mode.value"
                  :prepend-icon="mode.icon"
                  :title="mode.label"
                  @click="setThemeMode(mode.value)"
                />
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
        <v-list-item :to="localePath('/')" :title="t('app.navBooking')" prepend-icon="mdi-bookmark-plus-outline" />
        <v-list-item :to="localePath('/rules')" :title="t('app.navRules')"
          prepend-icon="mdi-book-open-variant-outline" />
        <v-list-item :to="localePath('/calendar')" :title="t('app.navCalendar')"
          prepend-icon="mdi-calendar-month-outline" />
        <v-list-item :to="localePath('/admin')" :title="t('app.navAdmin')" prepend-icon="mdi-shield-account-outline" />
        <v-divider class="my-2" />
        <v-list-item v-for="locale in locales" :key="locale.code" :to="switchLocalePath(locale.code)"
          :title="locale.code" :prepend-icon="localeIcon(locale.code)" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const { themeMode, setThemeMode, themeModeIcon } = useThemeMode()
const { t, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const drawer = ref(false)

const themeModes = computed(() => [
  { value: 'system', label: t('app.themeSystem'), icon: 'mdi-theme-light-dark' },
  { value: 'light', label: t('app.themeLight'), icon: 'mdi-weather-sunny' },
  { value: 'dark', label: t('app.themeDark'), icon: 'mdi-weather-night' },
] as const)

function localeIcon(code: string) {
  const map: Record<string, string> = {
    'zh-CN': 'mdi-alpha-c-box-outline',
    en: 'mdi-alpha-e-box-outline',
    ja: 'mdi-alpha-j-box-outline',
    ko: 'mdi-alpha-k-box-outline',
    fr: 'mdi-alpha-f-box-outline',
  }
  return map[code] || 'mdi-web'
}
</script>

<style scoped>
.app-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
