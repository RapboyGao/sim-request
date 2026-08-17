<template>
  <v-list-item
    :title="t('app.checklistsHome')"
    prepend-icon="mdi-home-outline"
    :to="localizedRoute(publicChecklistsHomeRoute())"
    :active="!activeId"
    @click="emit('select')"
  />
  <v-divider class="my-2" />
  <v-list-subheader>{{ t('app.checklistsBuiltin') }}</v-list-subheader>
  <v-list-item
    v-for="item in builtins"
    :key="item.id"
    :title="item.title"
    prepend-icon="mdi-format-list-checks"
    :to="localizedRoute(publicChecklistRoute(item.id))"
    :active="activeId === item.id"
    @click="emit('select')"
  />
  <template v-if="custom.length">
    <v-divider class="my-2" />
    <v-list-subheader>{{ t('app.checklistsCustom') }}</v-list-subheader>
    <v-list-item
      v-for="item in custom"
      :key="item.id"
      :title="item.title"
      prepend-icon="mdi-file-edit-outline"
      :to="localizedRoute(publicCustomChecklistRoute(item.id))"
      :active="activeId === item.id"
      @click="emit('select')"
    />
  </template>
</template>

<script setup lang="ts">
import { publicBuiltinChecklists } from '~/data/public-checklists'
import { useChecklists } from '~/composables/useChecklists'
import { publicChecklistRoute, publicChecklistsHomeRoute, publicCustomChecklistRoute } from '~/utils/checklist-routes'
import { sortChecklistsByFavorite } from '~/utils/checklists'

const props = defineProps<{ activeChecklistId?: string }>()
const emit = defineEmits<{ select: [] }>()
const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const builtins = computed(() => publicBuiltinChecklists(locale.value))
const { customChecklists, favorites } = useChecklists({ scope: 'public', builtins })
const custom = computed(() => sortChecklistsByFavorite(customChecklists.value, favorites.value))
const activeId = computed(() => {
  if (props.activeChecklistId !== undefined) return props.activeChecklistId
  const path = route.path.replace(/\/$/, '')
  if (path.endsWith('/deicing')) return 'deicing'
  if (path.endsWith('/no-engine-bleed-takeoff')) return 'no-engine-bleed-takeoff'
  const builtin = builtins.value.find((item) => path.endsWith(`/${item.id}`))
  if (builtin) return builtin.id
  return String(route.params.id || '')
})

function localizedRoute(path: string) {
  return localePath(path)
}
</script>
