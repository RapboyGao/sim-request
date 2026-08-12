<template>
  <v-card class="checklists-card" hover rounded="xl" @click="$emit('open')">
    <v-card-item>
      <template #prepend>
        <v-avatar :color="stats.complete ? 'success' : 'primary'" variant="tonal" size="44">
          <v-icon :icon="stats.complete ? 'mdi-check-all' : 'mdi-format-list-checks'" />
        </v-avatar>
      </template>
      <v-card-title class="text-wrap">{{ checklist.title }}</v-card-title>
      <v-card-subtitle v-if="checklist.source === 'custom'" class="d-flex align-center mt-1">
        <v-icon icon="mdi-account-edit-outline" size="14" class="mr-1" /> 自定义
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="pt-2">
      <p v-if="checklist.description" class="card-description">{{ checklist.description }}</p>
      <div class="d-flex align-center justify-space-between text-body-2 mb-2">
        <span>{{ stats.checked }} / {{ stats.total }}</span>
        <span v-if="stats.expired" class="text-warning">
          <v-icon icon="mdi-clock-alert-outline" size="16" class="mr-1" />{{ stats.expired }} 项过期
        </span>
        <span v-else-if="stats.complete" class="text-success">已完成</span>
      </div>
      <v-progress-linear :model-value="stats.progress * 100" :color="stats.complete ? 'success' : 'primary'" rounded height="8" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Checklist, ChecklistStatus } from '~/types/checklist'
import { checklistStats } from '~/utils/checklists'

const props = defineProps<{
  checklist: Checklist
  status: ChecklistStatus
}>()

defineEmits<{ open: [] }>()

const stats = computed(() => checklistStats(props.checklist, props.status))
</script>

<style scoped>
.checklists-card {
  height: 100%;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.checklists-card:hover {
  transform: translateY(-2px);
}

.card-description {
  min-height: 2.8em;
  color: var(--muted);
  line-height: 1.45;
}
</style>
