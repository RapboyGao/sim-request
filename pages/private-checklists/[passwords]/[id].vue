<template><ChecklistDetailPage :checklist-id="String(route.params.id)" :scope="'private'" :builtins="[...builtinChecklists]" /></template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { builtinChecklists } from '~/data/checklists'
definePageMeta({ layout: 'checklists' })
const route = useRoute()
</script>
