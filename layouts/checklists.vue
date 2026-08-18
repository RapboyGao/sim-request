<template>
  <v-app class="checklists-app" :class="isDark ? 'checklists-app--dark' : 'checklists-app--light'">
    <v-app-bar class="checklists-bar" flat density="comfortable">
      <v-btn v-if="!isHome" icon="mdi-arrow-left" variant="text" aria-label="返回检查单首页" @click="goHome" />
      <v-app-bar-title class="checklists-brand">{{ activeChecklistTitle }}</v-app-bar-title>
      <v-spacer />
      <v-menu v-if="smAndUp" v-model="menuOpen" content-class="checklists-menu-content" :close-on-content-click="false">
        <template #activator="{ props }"><v-btn v-bind="props" icon="mdi-format-list-bulleted" variant="text" :aria-label="t('app.checklistsMenu')" :title="t('app.checklistsMenu')" /></template>
        <v-list nav density="comfortable"><AppNavigationMenuContent :checklist-actions="pageActions" @select="menuOpen = false" /><LocaleMenuItems @select="menuOpen = false" /></v-list>
      </v-menu>
      <v-btn v-else icon="mdi-format-list-bulleted" variant="text" :aria-label="t('app.checklistsMenu')" :title="t('app.checklistsMenu')" @click="drawer = true" />
      <v-btn icon variant="text" :aria-label="themeLabel" @click="cycleMode"><v-icon :icon="themeIcon" :color="isDark ? 'indigo-lighten-2' : 'amber-darken-2'" /></v-btn>
      <v-btn v-if="!isHome" icon="mdi-home-outline" variant="text" aria-label="检查单首页" @click="goHome" />
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" temporary location="start" class="checklists-drawer" :width="300">
      <v-list nav density="comfortable"><AppNavigationMenuContent mobile :checklist-actions="pageActions" @select="drawer = false" /><LocaleMenuItems @select="drawer = false" /></v-list>
    </v-navigation-drawer>
    <v-main class="checklists-main"><NuxtPage /></v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import AppNavigationMenuContent from '~/components/AppNavigationMenuContent.vue'
import LocaleMenuItems from '~/components/LocaleMenuItems.vue'
import { provideChecklistsPageActions } from '~/composables/useChecklistsPageActions'
import { publicBuiltinChecklists } from '~/data/public-checklists'
import { publicChecklistsHomeRoute } from '~/utils/checklist-routes'
import { useChecklistsTheme } from '~/composables/useChecklistsTheme'

const route = useRoute(); const router = useRouter(); const localePath = useLocalePath(); const { locale, t } = useI18n(); const { smAndUp } = useDisplay()
const { actions: pageActions } = provideChecklistsPageActions(); const drawer = ref(false); const menuOpen = ref(false)
const theme = useChecklistsTheme(); const vuetifyTheme = useTheme(); const builtins = computed(() => publicBuiltinChecklists(locale.value)); const { allChecklists } = useChecklists({ builtins })
const isDark = computed(() => theme.isDark.value); const themeMode = computed(() => theme.mode.value)
const resolvedThemeMode = computed(() => theme.resolvedMode.value)
const themeIcon = computed(() => themeMode.value === 'dark' ? 'mdi-weather-night' : themeMode.value === 'light' ? 'mdi-weather-sunny' : 'mdi-theme-light-dark')
const themeLabel = computed(() => themeMode.value === 'dark' ? '深色模式' : themeMode.value === 'light' ? '浅色模式' : '跟随系统')
const homePath = computed(() => localePath(publicChecklistsHomeRoute())); const isHome = computed(() => route.path === homePath.value || route.path === `${homePath.value}/`)
const activeChecklistId = computed(() => { const path = route.path.replace(/\/$/, ''); if (path.endsWith('/deicing')) return 'deicing'; if (path.endsWith('/no-engine-bleed-takeoff')) return 'no-engine-bleed-takeoff'; return String(route.params.id || '') })
const activeChecklistTitle = computed(() => allChecklists.value.find((item) => item.id === activeChecklistId.value)?.title || '检查单')
function applyTheme() {
  vuetifyTheme.global.name.value = isDark.value ? 'bookingDark' : 'bookingLight'
  if (import.meta.client) {
    document.documentElement.dataset.theme = resolvedThemeMode.value
    document.documentElement.style.colorScheme = resolvedThemeMode.value
  }
}
function cycleMode() { theme.cycleMode() }
function goHome() { router.push(localePath(publicChecklistsHomeRoute())) }
watch(resolvedThemeMode, applyTheme, { immediate: true }); watch(smAndUp, () => { menuOpen.value = false; drawer.value = false })
useHead({ titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} · Aviation Checklist` : 'Aviation Checklist', meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }, { name: 'description', content: '离线航空检查单工具' }] })
</script>

<style scoped>
.checklists-app { min-height: 100vh; background: var(--bg); color: var(--text); }
.checklists-app--light { --bg: #f6f4ef; --bg-gradient-end: #fbfaf7; --surface: rgba(255,255,255,.82); --text: #1f2937; --muted: #6b7280; --border: rgba(15,23,42,.08); }
.checklists-app--dark { --bg: #0f172a; --bg-gradient-end: #111827; --surface: rgba(15,23,42,.88); --text: #e5e7eb; --muted: #9ca3af; --border: rgba(148,163,184,.22); }
.checklists-app::before { content:''; position:fixed; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(180deg,var(--bg-gradient-end) 0%,var(--bg) 100%); }
.checklists-app :deep(.v-card), .checklists-app :deep(.v-menu .v-list), .checklists-app :deep(.v-navigation-drawer) { background-color:var(--surface); color:var(--text); }
.checklists-bar { border-bottom:1px solid var(--border); background:color-mix(in srgb,var(--surface) 92%,transparent)!important; backdrop-filter:blur(14px); }
.checklists-brand { display:flex; align-items:center; min-width:0; overflow:hidden; font-size:1.02rem; font-weight:750; letter-spacing:.02em; text-overflow:ellipsis; white-space:nowrap; }
.checklists-main { background:transparent; }
</style>
