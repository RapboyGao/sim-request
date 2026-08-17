<template><ChecklistDetailPage :checklist-id="String(route.params.id)" /></template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
definePageMeta({ layout: 'checklists' })
const route = useRoute()
</script>
