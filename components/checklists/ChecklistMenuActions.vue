<template>
  <template v-if="actions">
    <v-divider class="my-2" />
    <v-btn
      class="checklist-reset-action mx-2"
      variant="tonal"
      prepend-icon="mdi-backup-restore"
      block
      @click="run(actions.reset)"
    >
      重置检查单
    </v-btn>
    <template v-if="actions.edit || actions.duplicate || actions.remove">
      <v-divider class="my-2" />
      <v-list-subheader>当前检查单</v-list-subheader>
      <v-list-item v-if="actions.edit" prepend-icon="mdi-pencil-outline" title="编辑检查单" @click="run(actions.edit)" />
      <v-list-item v-if="actions.duplicate" prepend-icon="mdi-content-copy" title="复制检查单" @click="run(actions.duplicate)" />
      <v-list-item v-if="actions.remove" prepend-icon="mdi-delete-outline" title="删除检查单" @click="run(actions.remove)" />
    </template>
  </template>
</template>

<script setup lang="ts">
import type { ChecklistPageActions } from '~/composables/useChecklistsPageActions'

defineProps<{
  actions: ChecklistPageActions | null
}>()

const emit = defineEmits<{
  select: []
}>()

function run(action: (() => void) | undefined) {
  action?.()
  emit('select')
}
</script>

<style scoped>
.checklist-reset-action {
  width: calc(100% - 16px);
  justify-content: flex-start;
}
</style>
