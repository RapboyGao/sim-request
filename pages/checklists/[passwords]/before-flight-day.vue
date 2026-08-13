<template>
  <ChecklistDetailPage :checklist="beforeFlightDayChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { beforeFlightDayChecklist } from '~/data/checklist-pages/before-flight-day'

definePageMeta({ layout: 'checklists' })
</script>
