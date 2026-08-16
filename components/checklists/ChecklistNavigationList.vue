<template>
  <v-list nav density="comfortable">
    <v-list-item
      title="检查单首页"
      prepend-icon="mdi-home-outline"
      :to="homeRoute"
      :active="!activeChecklistId"
      @click="emit('select')"
    />
    <v-divider class="my-2" />
    <v-list-subheader>内置检查单</v-list-subheader>
    <v-list-item
      v-for="item in builtinChecklists"
      :key="item.id"
      :to="itemRoute(item.id)"
      :active="activeChecklistId === item.id"
      :title="item.title"
      prepend-icon="mdi-format-list-checks"
      @click="emit('select')"
    />
    <slot />
  </v-list>
</template>

<script setup lang="ts">
import type { Checklist } from '~/types/checklist'
import type { ChecklistScope } from '~/composables/useChecklists'
import { privateChecklistRoute, privateChecklistsHomeRoute, publicChecklistRoute, publicChecklistsHomeRoute } from '~/utils/checklist-routes'

const props = defineProps<{
  scope: ChecklistScope
  builtinChecklists: Checklist[]
  passwords?: string
  activeChecklistId: string
}>()

const builtinChecklists = computed(() => props.builtinChecklists)
const homeRoute = computed(() => props.scope === 'public' ? publicChecklistsHomeRoute() : privateChecklistsHomeRoute(props.passwords || ''))
const itemRoute = (id: string) => props.scope === 'public' ? publicChecklistRoute(id) : privateChecklistRoute(props.passwords || '', id)

const emit = defineEmits<{
  select: []
}>()
</script>
