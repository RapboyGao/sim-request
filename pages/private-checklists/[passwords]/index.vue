<template><ChecklistHomePage scope="private" :builtins="[...builtinChecklists]" :passwords="passwords" /></template>

<script setup lang="ts">
import ChecklistHomePage from '~/components/checklists/ChecklistHomePage.vue'
import { builtinChecklists } from '~/data/checklists'
definePageMeta({ layout: 'checklists' })
const route = useRoute()
const passwords = computed(() => String(route.params.passwords || ''))
</script>
