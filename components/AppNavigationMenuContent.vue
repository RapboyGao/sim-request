<template>
  <template v-if="mobile">
    <v-list-item
      :to="localePath('/')"
      :title="t('app.navBooking')"
      prepend-icon="mdi-bookmark-plus-outline"
      :active="normalizedPath === '/'"
      @click="emit('select')"
    />
    <v-list-item
      :to="localePath('/people')"
      :title="t('app.navPeople')"
      prepend-icon="mdi-account-group-outline"
      :active="normalizedPath === '/people'"
      @click="emit('select')"
    />
    <v-list-item
      :to="localePath('/calendar')"
      :title="t('app.navCalendar')"
      prepend-icon="mdi-calendar-month-outline"
      :active="normalizedPath === '/calendar'"
      @click="emit('select')"
    />
    <v-list-item
      :to="localePath('/rules')"
      :title="t('app.navRules')"
      prepend-icon="mdi-book-open-variant-outline"
      :active="normalizedPath === '/rules'"
      @click="emit('select')"
    />
    <v-list-item
      :to="localePath('/barometric')"
      :title="t('app.navBarometric')"
      prepend-icon="mdi-weather-windy"
      :active="normalizedPath === '/barometric'"
      @click="emit('select')"
    />
    <v-list-item
      :to="localePath('/airspeed')"
      :title="t('app.navAirspeed')"
      prepend-icon="mdi-airplane-takeoff"
      :active="normalizedPath === '/airspeed'"
      @click="emit('select')"
    />
    <v-list-group v-model="mobileChecklistOpen" value="public-checklists">
      <template #activator="{ props }">
        <v-list-item v-bind="props" :title="t('app.navChecklists')" prepend-icon="mdi-clipboard-check-outline" :active="normalizedPath.startsWith('/checklists')" />
      </template>
      <PublicChecklistMenuItems @select="emit('select')" />
    </v-list-group>
    <ChecklistMenuActions v-if="checklistActions" :actions="checklistActions" @select="emit('select')" />
    <v-list-item
      :to="localePath('/admin')"
      :title="t('app.navAdmin')"
      prepend-icon="mdi-shield-account-outline"
      :active="normalizedPath === '/admin'"
      @click="emit('select')"
    />
  </template>

  <template v-else>
    <v-list-item :to="localePath('/')" :title="t('app.navBooking')" prepend-icon="mdi-bookmark-plus-outline" :active="normalizedPath === '/'" @click="emit('select')" />
    <v-list-item :to="localePath('/people')" :title="t('app.navPeople')" prepend-icon="mdi-account-group-outline" :active="normalizedPath === '/people'" @click="emit('select')" />
    <v-list-item :to="localePath('/calendar')" :title="t('app.navCalendar')" prepend-icon="mdi-calendar-month-outline" :active="normalizedPath === '/calendar'" @click="emit('select')" />
    <v-list-item :to="localePath('/rules')" :title="t('app.navRules')" prepend-icon="mdi-book-open-variant-outline" :active="normalizedPath === '/rules'" @click="emit('select')" />
    <v-list-item :to="localePath('/barometric')" :title="t('app.navBarometric')" prepend-icon="mdi-weather-windy" :active="normalizedPath === '/barometric'" @click="emit('select')" />
    <v-list-item :to="localePath('/airspeed')" :title="t('app.navAirspeed')" prepend-icon="mdi-airplane-takeoff" :active="normalizedPath === '/airspeed'" @click="emit('select')" />

    <v-menu v-model="desktopChecklistOpen" location="end" :close-on-content-click="false" :offset="4">
      <template #activator="{ props }">
        <v-list-item
          v-bind="props"
          :title="t('app.navChecklists')"
          prepend-icon="mdi-clipboard-check-outline"
          append-icon="mdi-chevron-right"
          :active="normalizedPath.startsWith('/checklists')"
          @click.stop
          @keydown.stop
        />
      </template>
      <v-list nav density="comfortable" min-width="260" class="app-checklist-submenu">
        <PublicChecklistMenuItems @select="closeDesktopChecklist" />
      </v-list>
    </v-menu>
    <ChecklistMenuActions v-if="checklistActions" :actions="checklistActions" @select="emit('select')" />
    <v-list-item :to="localePath('/admin')" :title="t('app.navAdmin')" prepend-icon="mdi-shield-account-outline" :active="normalizedPath === '/admin'" @click="emit('select')" />
  </template>
</template>

<script setup lang="ts">
import ChecklistMenuActions from '~/components/checklists/ChecklistMenuActions.vue'
import PublicChecklistMenuItems from '~/components/checklists/PublicChecklistMenuItems.vue'
import type { ChecklistPageActions } from '~/composables/useChecklistsPageActions'

withDefaults(defineProps<{
  checklistActions?: ChecklistPageActions | null
  mobile?: boolean
}>(), {
  checklistActions: null,
  mobile: false,
})

const emit = defineEmits<{ select: [] }>()
const route = useRoute()
const locale = useI18n().locale
const t = useI18n().t
const localePath = useLocalePath()
const desktopChecklistOpen = ref(false)
const mobileChecklistOpen = ref(false)

const normalizedPath = computed(() => {
  const prefix = `/${locale.value}`
  return route.path === prefix
    ? '/'
    : route.path.startsWith(`${prefix}/`)
      ? route.path.slice(prefix.length)
      : route.path
})

function closeDesktopChecklist() {
  desktopChecklistOpen.value = false
  emit('select')
}
</script>

<style scoped>
.app-checklist-submenu {
  background: rgb(var(--v-theme-surface));
}
</style>
