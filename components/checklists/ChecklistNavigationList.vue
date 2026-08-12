<template>
  <v-list nav density="comfortable">
    <v-list-item
      title="检查单首页"
      prepend-icon="mdi-home-outline"
      :to="checklistsHomeRoute(passwords)"
      :active="!activeChecklistId"
      @click="emit('select')"
    />
    <v-divider class="my-2" />
    <v-list-subheader>内置检查单</v-list-subheader>
    <v-list-item
      v-for="item in builtinChecklists"
      :key="item.id"
      :to="checklistRoute(passwords, item.id)"
      :active="activeChecklistId === item.id"
      :title="item.title"
      prepend-icon="mdi-format-list-checks"
      @click="emit('select')"
    />
    <slot />
  </v-list>
</template>

<script setup lang="ts">
import { builtinChecklists } from '~/data/checklists'
import { checklistRoute, checklistsHomeRoute } from '~/utils/checklist-routes'

defineProps<{
  passwords: string
  activeChecklistId: string
}>()

const emit = defineEmits<{
  select: []
}>()
</script>
