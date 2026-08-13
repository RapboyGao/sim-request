<template>
  <ChecklistDetailPage :checklist="b737DeicingEnChecklist" />
</template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { b737DeicingEnChecklist } from '~/data/checklist-pages/b737-deicing-en'

definePageMeta({ layout: 'checklists' })
</script>
