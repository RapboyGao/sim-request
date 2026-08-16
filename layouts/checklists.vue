<template>
  <v-app class="checklists-app" :class="isDark ? 'checklists-app--dark' : 'checklists-app--light'">
    <v-app-bar class="checklists-bar" flat density="comfortable">
      <v-btn v-if="!isHome" icon="mdi-arrow-left" variant="text" aria-label="返回检查单首页" @click="goHome" />
      <v-app-bar-title class="checklists-brand">
        {{ activeChecklistTitle }}
      </v-app-bar-title>
      <v-spacer />

      <v-menu v-if="smAndUp" v-model="menuOpen" content-class="checklists-menu-content">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-format-list-bulleted" variant="text" aria-label="打开检查单目录" title="检查单目录" />
        </template>
        <ChecklistNavigationList :scope="scope" :passwords="passwords" :builtin-checklists="builtinChecklists" :active-checklist-id="activeChecklistId" @select="menuOpen = false">
          <ChecklistMenuActions :actions="pageActions" @select="menuOpen = false" />
        </ChecklistNavigationList>
      </v-menu>
      <v-btn
        v-else
        icon="mdi-format-list-bulleted"
        variant="text"
        aria-label="打开检查单目录"
        title="检查单目录"
        @click="drawer = true"
      />

      <v-btn icon variant="text" :aria-label="themeLabel" @click="cycleMode">
        <v-icon :icon="themeIcon" :color="isDark ? 'indigo-lighten-2' : 'amber-darken-2'" />
      </v-btn>
      <v-btn v-if="!isHome" icon="mdi-home-outline" variant="text" aria-label="检查单首页" @click="goHome" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" class="checklists-drawer" :width="300">
      <ChecklistNavigationList :scope="scope" :passwords="passwords" :builtin-checklists="builtinChecklists" :active-checklist-id="activeChecklistId" @select="drawer = false">
        <ChecklistMenuActions :actions="pageActions" @select="drawer = false" />
      </ChecklistNavigationList>
    </v-navigation-drawer>

    <v-main class="checklists-main">
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import ChecklistNavigationList from '~/components/checklists/ChecklistNavigationList.vue'
import ChecklistMenuActions from '~/components/checklists/ChecklistMenuActions.vue'
import { resolveThemeName, useThemeMode } from '~/composables/useThemeMode'
import { provideChecklistsPageActions } from '~/composables/useChecklistsPageActions'
import { CHECKLIST_ROUTE_IDS, privateChecklistsHomeRoute, publicChecklistsHomeRoute } from '~/utils/checklist-routes'
import { builtinChecklists as privateBuiltins } from '~/data/checklists'
import { publicDeicingChecklist } from '~/data/public-deicing'
import type { Checklist } from '~/types/checklist'

const route = useRoute()
const router = useRouter()
const drawer = ref(false)
const menuOpen = ref(false)
const { smAndUp } = useDisplay()
const { actions: pageActions } = provideChecklistsPageActions()
const scope = computed(() => route.path.startsWith('/private-checklists/') ? 'private' : 'public')
const { locale } = useI18n()
const builtinChecklists = computed<Checklist[]>(() => scope.value === 'private' ? [...privateBuiltins] : [publicDeicingChecklist(locale.value).checklist])
const privateChecklistsTheme = useChecklistsTheme('private')
const publicChecklistsTheme = useChecklistsTheme('public')
const vuetifyTheme = useTheme()
const bookingTheme = useThemeMode()
const privateChecklistStore = useChecklists({ scope: 'private', builtins: computed(() => [...privateBuiltins]) })
const publicChecklistStore = useChecklists({ scope: 'public', builtins: computed(() => [publicDeicingChecklist(locale.value).checklist]) })
const allChecklists = computed(() => scope.value === 'private' ? privateChecklistStore.allChecklists.value : publicChecklistStore.allChecklists.value)
const passwords = computed(() => String(route.params.passwords || ''))
const homePath = computed(() => (scope.value === 'public' ? publicChecklistsHomeRoute() : privateChecklistsHomeRoute(passwords.value)).replace(/\/$/, ''))
const isHome = computed(() => route.path === homePath.value || route.path === `${homePath.value}/`)
const activeTheme = computed(() => scope.value === 'private' ? privateChecklistsTheme : publicChecklistsTheme)
const isDark = computed(() => activeTheme.value.isDark.value)
const themeMode = computed(() => activeTheme.value.mode.value)
const themeIcon = computed(() => themeMode.value === 'dark' ? 'mdi-weather-night' : themeMode.value === 'light' ? 'mdi-weather-sunny' : 'mdi-theme-light-dark')
const themeLabel = computed(() => themeMode.value === 'dark' ? '深色模式' : themeMode.value === 'light' ? '浅色模式' : '跟随系统')
const activeChecklistId = computed(() => {
  const path = route.path.replace(/\/$/, '')
  if (scope.value === 'public' && path.endsWith('/deicing')) return 'deicing'
  return CHECKLIST_ROUTE_IDS.find((id) => path.endsWith(`/${id}`)) || String(route.params.id || '')
})
const activeChecklistTitle = computed(() => allChecklists.value.find((item) => item.id === activeChecklistId.value)?.title || (scope.value === 'public' ? '公开检查单' : 'Private Checklist'))

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
  activeTheme.value.cycleMode()
}

function goHome() {
  router.push(scope.value === 'public' ? publicChecklistsHomeRoute() : privateChecklistsHomeRoute(passwords.value))
}

watch([themeMode, isDark], applyChecklistsTheme, { immediate: true })
watch(smAndUp, () => {
  menuOpen.value = false
  drawer.value = false
})
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

.checklists-app :deep(.checklists-drawer .v-list-item-title),
.checklists-app :deep(.checklists-drawer .v-list-subheader),
.checklists-app :deep(.checklists-drawer .v-list-item__prepend > .v-icon) {
  color: var(--text);
  opacity: 1;
}

:global(.checklists-menu-content) {
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

:global(.checklists-menu-content .v-list-item-title),
:global(.checklists-menu-content .v-list-subheader),
:global(.checklists-menu-content .v-list-item__prepend > .v-icon),
:global(.checklists-menu-content .v-list-item__append > .v-icon) {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 1 !important;
}

:global(.checklists-menu-content .v-list-item--active) {
  color: rgb(var(--v-theme-primary)) !important;
}

.checklists-app :deep(.v-expansion-panel-text__wrapper),
.checklists-app :deep(.v-expansion-panel-title) {
  color: var(--text);
}

.checklists-bar { border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--surface) 92%, transparent) !important; backdrop-filter: blur(14px); }
.checklists-brand { display: flex; align-items: center; min-width: 0; overflow: hidden; font-size: 1.02rem; font-weight: 750; letter-spacing: .02em; text-overflow: ellipsis; white-space: nowrap; }
.checklists-main { background: transparent; }
</style>
