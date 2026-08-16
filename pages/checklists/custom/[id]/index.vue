<template><ChecklistDetailPage :checklist-id="String(route.params.id)" :scope="'public'" :builtins="builtins" /></template>

<script setup lang="ts">
import ChecklistDetailPage from '~/components/checklists/ChecklistDetailPage.vue'
import { publicDeicingChecklist } from '~/data/public-deicing'
import type { Checklist } from '~/types/checklist'
definePageMeta({ layout: 'checklists' })
const route = useRoute()
const { locale } = useI18n()
const builtins = computed<Checklist[]>(() => [publicDeicingChecklist(locale.value).checklist])
</script>
