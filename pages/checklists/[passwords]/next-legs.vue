<template>
  <ChecklistDetailPage :checklist="nextLegsChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { nextLegsChecklist } from '~/data/checklist-pages/next-legs'

definePageMeta({ layout: 'checklists' })
</script>
