<template>
  <ChecklistDetailPage :checklist="firstLegChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { firstLegChecklist } from '~/data/checklist-pages/first-leg'

definePageMeta({ layout: 'checklists' })
</script>
