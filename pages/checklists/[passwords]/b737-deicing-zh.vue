<template>
  <ChecklistDetailPage :checklist="b737DeicingZhChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { b737DeicingZhChecklist } from '~/data/checklist-pages/b737-deicing-zh'

definePageMeta({ layout: 'checklists' })
</script>
