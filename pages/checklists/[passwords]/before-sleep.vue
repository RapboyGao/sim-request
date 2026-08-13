<template>
  <ChecklistDetailPage :checklist="beforeSleepChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { beforeSleepChecklist } from '~/data/checklist-pages/before-sleep'

definePageMeta({ layout: 'checklists' })
</script>
