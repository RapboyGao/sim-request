<template>
  <v-container v-if="checklist" class="checklists-editor-page py-6 py-md-10"><div class="editor-page-head"><v-btn icon="mdi-arrow-left" variant="text" aria-label="返回检查单" @click="cancel" /><div><div class="text-overline text-primary">CUSTOM CHECKLIST</div><h1 class="text-h5 font-weight-bold">{{ checklist.title }}</h1></div></div><v-card class="editor-page-card pa-5 pa-sm-7" rounded="xl"><ChecklistEditor :checklist="checklist" @save="save" @cancel="cancel" /></v-card></v-container>
  <v-container v-else class="py-16 text-center"><div class="text-h6">找不到这个自定义检查单</div><v-btn class="mt-5" color="primary" @click="goHome">返回检查单首页</v-btn></v-container>
</template>
<script setup lang="ts">
import ChecklistEditor from '~/components/checklists/ChecklistEditor.vue'
import type { Checklist } from '~/types/checklist'
import { publicChecklistsHomeRoute, publicCustomChecklistRoute } from '~/utils/checklist-routes'
definePageMeta({ layout: 'checklists' })
const route = useRoute(); const router = useRouter()
const { customChecklists, updateChecklist } = useChecklists({ scope: 'public', builtins: computed(() => []) })
const checklist = computed(() => customChecklists.value.find((item) => item.id === String(route.params.id || '')))
function goHome() { router.push(publicChecklistsHomeRoute()) }
function cancel() { checklist.value ? router.push(publicCustomChecklistRoute(checklist.value.id)) : goHome() }
function save(next: Checklist) { if (next.source === 'custom') { updateChecklist(next); router.push(publicCustomChecklistRoute(next.id)) } }
onMounted(() => { if (!checklist.value) goHome() })
</script>
<style scoped>.checklists-editor-page{max-width:980px;min-height:calc(100vh - 64px)}.editor-page-head{display:flex;align-items:center;gap:10px;margin-bottom:22px}.editor-page-card{background:var(--surface)}</style>
