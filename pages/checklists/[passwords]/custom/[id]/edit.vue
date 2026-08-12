<template>
  <v-container v-if="checklist" class="checklists-editor-page py-6 py-md-10">
    <div class="editor-page-head">
      <v-btn icon="mdi-arrow-left" variant="text" aria-label="返回检查单" title="返回检查单" @click="cancel" />
      <div class="editor-page-heading">
        <div class="text-overline text-primary">CUSTOM CHECKLIST</div>
        <h1 class="text-h5 text-md-h4 font-weight-bold">{{ checklist.title }}</h1>
      </div>
    </div>

    <v-card class="editor-page-card pa-5 pa-sm-7" rounded="xl">
      <ChecklistEditor :checklist="checklist" @save="save" @cancel="cancel" />
    </v-card>
  </v-container>
  <v-container v-else class="py-16 text-center">
    <v-icon icon="mdi-file-question-outline" size="48" color="primary" />
    <div class="text-h6 mt-3">找不到这个自定义检查单</div>
    <v-btn class="mt-5" color="primary" @click="goHome">返回检查单首页</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import ChecklistEditor from '~/components/checklists/ChecklistEditor.vue'
import type { Checklist } from '~/types/checklist'
import { checklistsHomeRoute, customChecklistRoute } from '~/utils/checklist-routes'

definePageMeta({ layout: 'checklists' })

const route = useRoute()
const router = useRouter()
const { customChecklists, updateChecklist } = useChecklists()
const passwords = computed(() => String(route.params.passwords || ''))
const checklistId = computed(() => String(route.params.id || ''))
const checklist = computed(() => customChecklists.value.find((item) => item.id === checklistId.value))

function goHome() {
  router.push(checklistsHomeRoute(passwords.value))
}

function cancel() {
  if (checklist.value) router.push(customChecklistRoute(passwords.value, checklist.value.id))
  else goHome()
}

function save(next: Checklist) {
  if (next.source !== 'custom' || !checklist.value) return
  updateChecklist(next)
  router.push(customChecklistRoute(passwords.value, next.id))
}

onMounted(() => {
  if (!checklist.value) goHome()
})

useHead(() => ({ title: checklist.value ? `编辑｜${checklist.value.title}` : '编辑检查单' }))
</script>

<style scoped>
.checklists-editor-page { max-width: 980px; min-height: calc(100vh - 64px); }
.editor-page-head { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.editor-page-heading { min-width: 0; }
.editor-page-card { background: var(--surface); }
</style>
