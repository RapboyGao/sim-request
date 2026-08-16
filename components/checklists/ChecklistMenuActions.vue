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
      {{ t('app.checklistsReset') }}
    </v-btn>
    <template v-if="actions.edit || actions.duplicate || actions.remove">
      <v-divider class="my-2" />
      <v-list-subheader>{{ t('app.checklistsCurrent') }}</v-list-subheader>
      <v-list-item v-if="actions.edit" prepend-icon="mdi-pencil-outline" :title="t('app.checklistsEdit')" @click="run(actions.edit)" />
      <v-list-item v-if="actions.duplicate" prepend-icon="mdi-content-copy" :title="t('app.checklistsDuplicate')" @click="run(actions.duplicate)" />
      <v-list-item v-if="actions.remove" prepend-icon="mdi-delete-outline" :title="t('app.checklistsDelete')" @click="run(actions.remove)" />
    </template>
  </template>
</template>

<script setup lang="ts">
import type { ChecklistPageActions } from '~/composables/useChecklistsPageActions'
const { t } = useI18n()

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
