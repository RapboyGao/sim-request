<template>
  <ChecklistDetailPage :checklist="beforeFlightGoingChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { beforeFlightGoingChecklist } from '~/data/checklist-pages/before-flight-going'

definePageMeta({ layout: 'checklists' })
</script>
