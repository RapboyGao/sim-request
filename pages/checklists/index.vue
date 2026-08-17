<template><ChecklistHomePage :builtins="builtins" /></template>

<script setup lang="ts">
import ChecklistHomePage from '~/components/checklists/ChecklistHomePage.vue'
import { publicBuiltinChecklists } from '~/data/public-checklists'
import type { Checklist } from '~/types/checklist'

definePageMeta({ layout: 'checklists' })
const { locale } = useI18n()
const builtins = computed<Checklist[]>(() => publicBuiltinChecklists(locale.value))
</script>
