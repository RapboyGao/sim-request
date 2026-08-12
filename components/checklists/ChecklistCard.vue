<template>
  <v-card
    class="checklists-card"
    hover
    rounded="xl"
    role="button"
    tabindex="0"
    @click="$emit('open')"
    @keydown.enter="$emit('open')"
    @keydown.space.prevent="$emit('open')"
  >
    <v-card-item class="py-4">
      <v-card-title class="checklist-card-title text-wrap text-body-1 font-weight-bold">
        <span
          v-if="completionStatus !== 'idle'"
          class="checklist-status-dot"
          :class="`checklist-status-dot--${completionStatus}`"
          :aria-label="completionStatus === 'complete' ? '已完成' : '部分完成'"
          :title="completionStatus === 'complete' ? '已完成' : '部分完成'"
        />
        <span>{{ checklist.title }}</span>
      </v-card-title>
      <template #append>
        <v-btn
          :icon="favorite ? 'mdi-star' : 'mdi-star-outline'"
          :color="favorite ? 'warning' : undefined"
          variant="text"
          size="small"
          :aria-label="favorite ? '取消收藏' : '收藏检查单'"
          :title="favorite ? '取消收藏' : '收藏检查单'"
          @click.stop="$emit('toggle-favorite')"
        />
      </template>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import type { Checklist, ChecklistStatus } from '~/types/checklist'
import { checklistCompletionStatus } from '~/utils/checklists'

const props = defineProps<{
  checklist: Checklist
  status: ChecklistStatus
  favorite?: boolean
}>()

defineEmits<{ open: []; 'toggle-favorite': [] }>()

const completionStatus = computed(() => checklistCompletionStatus(props.checklist, props.status))
</script>

<style scoped>
.checklists-card {
  height: 100%;
  border: 1px solid var(--border) !important;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.checklists-card:hover {
  transform: translateY(-2px);
}

.checklist-card-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.checklist-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}

.checklist-status-dot--partial {
  background: rgb(var(--v-theme-warning));
}

.checklist-status-dot--complete {
  background: rgb(var(--v-theme-success));
}
</style>
