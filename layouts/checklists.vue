<template>
  <v-app class="checklists-app" :class="isDark ? 'checklists-app--dark' : 'checklists-app--light'">
    <v-app-bar class="checklists-bar" flat density="comfortable">
      <v-btn v-if="!isHome" icon="mdi-arrow-left" variant="text" aria-label="返回检查单首页" @click="goHome" />
      <v-btn class="d-sm-none" icon="mdi-menu" variant="text" aria-label="打开检查单菜单" @click="drawer = true" />
      <v-app-bar-title class="checklists-brand">
        <v-icon icon="mdi-airplane-check" color="primary" class="mr-2" />
        <span class="d-none d-sm-inline">Aviation Checklist</span>
        <span class="d-sm-none">Checklist</span>
      </v-app-bar-title>
      <v-spacer />

      <v-menu class="d-none d-sm-flex">
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="tonal" prepend-icon="mdi-format-list-bulleted" append-icon="mdi-chevron-down">
            Menu
          </v-btn>
        </template>
        <v-list density="comfortable" min-width="280">
          <v-list-subheader>内置检查单</v-list-subheader>
          <v-list-item
            v-for="item in builtinChecklists"
            :key="item.id"
            :to="checklistRoute(passwords, item.id)"
            :active="activeChecklistId === item.id"
            :title="item.title"
            prepend-icon="mdi-format-list-checks"
          />
          <v-divider class="my-2" />
          <v-list-item :to="checklistsHomeRoute(passwords)" title="检查单首页" prepend-icon="mdi-home-outline" />
        </v-list>
      </v-menu>

      <v-btn icon variant="text" :aria-label="themeLabel" @click="cycleMode">
        <v-icon :icon="themeIcon" :color="isDark ? 'indigo-lighten-2' : 'amber-darken-2'" />
      </v-btn>
      <v-btn icon="mdi-home-outline" variant="text" aria-label="检查单首页" @click="goHome" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" class="checklists-drawer">
      <v-list nav density="comfortable">
        <v-list-item title="检查单首页" prepend-icon="mdi-home-outline" :to="checklistsHomeRoute(passwords)" @click="drawer = false" />
        <v-divider class="my-2" />
        <v-list-subheader>内置检查单</v-list-subheader>
        <v-list-item
          v-for="item in builtinChecklists"
          :key="item.id"
          :to="checklistRoute(passwords, item.id)"
          :active="activeChecklistId === item.id"
          :title="item.title"
          prepend-icon="mdi-format-list-checks"
          @click="drawer = false"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="checklists-main">
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { builtinChecklists } from '~/data/checklists'
import { resolveThemeName, useThemeMode } from '~/composables/useThemeMode'
import { CHECKLIST_ROUTE_IDS, checklistRoute, checklistsHomeRoute } from '~/utils/checklist-routes'

const route = useRoute()
const router = useRouter()
const drawer = ref(false)
const checklistsTheme = useChecklistsTheme()
const vuetifyTheme = useTheme()
const bookingTheme = useThemeMode()
const passwords = computed(() => String(route.params.passwords || ''))
const homePath = computed(() => checklistsHomeRoute(passwords.value).replace(/\/$/, ''))
const isHome = computed(() => route.path === homePath.value || route.path === `${homePath.value}/`)
const isDark = checklistsTheme.isDark
const themeIcon = computed(() => checklistsTheme.mode.value === 'dark' ? 'mdi-weather-night' : checklistsTheme.mode.value === 'light' ? 'mdi-weather-sunny' : 'mdi-theme-light-dark')
const themeLabel = computed(() => checklistsTheme.mode.value === 'dark' ? '深色模式' : checklistsTheme.mode.value === 'light' ? '浅色模式' : '跟随系统')
const activeChecklistId = computed(() => {
  const path = route.path.replace(/\/$/, '')
  return CHECKLIST_ROUTE_IDS.find((id) => path.endsWith(`/${id}`)) || String(route.params.id || '')
})

function applyChecklistsTheme() {
  vuetifyTheme.global.name.value = isDark.value ? 'bookingDark' : 'bookingLight'
  if (import.meta.client) {
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
  }
}

function restoreBookingTheme() {
  const prefersDark = import.meta.client ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  vuetifyTheme.global.name.value = resolveThemeName(bookingTheme.themeMode.value, prefersDark)
  if (import.meta.client) {
    document.documentElement.style.colorScheme = bookingTheme.themeMode.value === 'dark' || (bookingTheme.themeMode.value === 'system' && prefersDark) ? 'dark' : 'light'
  }
}

function cycleMode() {
  checklistsTheme.cycleMode()
}

function goHome() {
  router.push(checklistsHomeRoute(passwords.value))
}

watch([checklistsTheme.mode, checklistsTheme.isDark], applyChecklistsTheme, { immediate: true })
onBeforeUnmount(restoreBookingTheme)

useHead({
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} · Aviation Checklist` : 'Aviation Checklist',
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
    { name: 'description', content: '离线航空检查单工具' },
  ],
})
</script>

<style scoped>
.checklists-app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.checklists-app--light {
  --bg: #f6f4ef;
  --bg-accent-start: rgba(15, 118, 110, 0.12);
  --bg-accent-end: rgba(249, 115, 22, 0.12);
  --bg-gradient-end: #fbfaf7;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-elevated: rgba(255, 255, 255, 0.72);
  --text: #1f2937;
  --muted: #6b7280;
  --border: rgba(15, 23, 42, 0.08);
  --soft-border: rgba(15, 23, 42, 0.06);
  --primary: #0f766e;
  --accent: #f97316;
  --shadow: rgba(15, 23, 42, 0.08);
}

.checklists-app--dark {
  --bg: #0f172a;
  --bg-accent-start: rgba(45, 212, 191, 0.12);
  --bg-accent-end: rgba(251, 146, 60, 0.12);
  --bg-gradient-end: #111827;
  --surface: rgba(15, 23, 42, 0.88);
  --surface-elevated: rgba(17, 24, 39, 0.88);
  --text: #e5e7eb;
  --muted: #9ca3af;
  --border: rgba(148, 163, 184, 0.22);
  --soft-border: rgba(148, 163, 184, 0.14);
  --primary: #2dd4bf;
  --accent: #fb923c;
  --shadow: rgba(0, 0, 0, 0.32);
}

.checklists-app::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, var(--bg-accent-start), transparent 30%),
    radial-gradient(circle at right top, var(--bg-accent-end), transparent 26%),
    linear-gradient(180deg, var(--bg-gradient-end) 0%, var(--bg) 100%);
}

.checklists-app :deep(.v-card),
.checklists-app :deep(.v-dialog .v-card),
.checklists-app :deep(.v-menu .v-list),
.checklists-app :deep(.v-navigation-drawer) {
  background-color: var(--surface);
  color: var(--text);
}

.checklists-app :deep(.v-expansion-panel-text__wrapper),
.checklists-app :deep(.v-expansion-panel-title) {
  color: var(--text);
}

.checklists-bar { border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 92%, transparent) !important; backdrop-filter: blur(14px); }
.checklists-brand { display: flex; align-items: center; font-size: 1.02rem; font-weight: 750; letter-spacing: .02em; }
.checklists-main { background: transparent; }
</style>
