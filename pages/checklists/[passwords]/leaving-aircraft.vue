<template>
  <ChecklistDetailPage :checklist="leavingAircraftChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { leavingAircraftChecklist } from '~/data/checklist-pages/leaving-aircraft'

definePageMeta({ layout: 'checklists' })
</script>
