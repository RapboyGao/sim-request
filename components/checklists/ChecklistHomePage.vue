<template>
  <v-container class="checklists-home py-6 py-md-10">
    <template v-if="allChecklists.length">
      <section v-for="group in checklistGroups" :key="group.key" class="checklist-group">
        <div class="section-heading">
          <div><h2 class="text-h6 font-weight-bold">{{ group.title }}</h2><p class="text-body-2 text-medium-emphasis mb-0">{{ group.items.length }} 个检查单</p></div>
          <div v-if="group.key === 'custom'" class="group-actions">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="createNew">新建检查单</v-btn>
            <v-menu content-class="checklists-menu-content">
              <template #activator="{ props }"><v-btn v-bind="props" variant="tonal" icon="mdi-dots-vertical" aria-label="更多操作" /></template>
              <v-list density="comfortable" min-width="190">
                <v-list-item prepend-icon="mdi-download-outline" title="导出 JSON" @click="exportBackup" />
                <v-list-item prepend-icon="mdi-upload-outline" title="还原 JSON" @click="pickBackup" />
              </v-list>
            </v-menu>
            <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importBackup" />
          </div>
        </div>
        <v-row v-if="group.items.length" class="checklist-grid">
          <v-col v-for="checklist in group.items" :key="checklist.id" cols="12" sm="6" lg="4">
            <ChecklistCard :checklist="checklist" :status="status" :favorite="favorites.includes(checklist.id)" @open="openChecklist(checklist.id)" @toggle-favorite="toggleFavorite(checklist.id)" />
          </v-col>
        </v-row>
        <v-card v-else class="empty-card pa-6 text-center" rounded="xl"><div class="text-body-2">没有匹配的检查单</div></v-card>
      </section>
    </template>
    <v-card v-else class="empty-card pa-10 text-center" rounded="xl"><div class="text-h6">暂无检查单</div></v-card>
    <v-snackbar v-model="snackbar.open" :color="snackbar.color" timeout="3200">{{ snackbar.message }}</v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import ChecklistCard from '~/components/checklists/ChecklistCard.vue'
import type { Checklist } from '~/types/checklist'
import { publicChecklistRoute, publicCustomChecklistEditRoute, publicCustomChecklistRoute } from '~/utils/checklist-routes'
import { sortChecklistsByFavorite } from '~/utils/checklists'

const props = defineProps<{ builtins: Checklist[] }>()
const localePath = useLocalePath()
const { allChecklists, status, favorites, addChecklist, createBackup, importBackup: restoreBackup, toggleFavorite } = useChecklists({ builtins: computed(() => props.builtins) })
const fileInput = ref<HTMLInputElement | null>(null)
const snackbar = reactive({ open: false, message: '', color: 'success' })

const checklistGroups = computed(() => [
  { key: 'builtin', title: '内置检查单', items: sortChecklistsByFavorite(allChecklists.value.filter((item) => item.source === 'builtin'), favorites.value) },
  { key: 'custom', title: '自定义检查单', items: sortChecklistsByFavorite(allChecklists.value.filter((item) => item.source === 'custom'), favorites.value) },
])

function openChecklist(id: string) {
  const target = allChecklists.value.find((item) => item.id === id)
  if (!target) return
  navigateTo(localePath(target.source === 'builtin' ? publicChecklistRoute(id) : publicCustomChecklistRoute(id)))
}
function createNew() {
  const id = addChecklist()
  if (id) navigateTo(localePath(publicCustomChecklistEditRoute(id)))
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `aviation-checklists-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); showMessage('JSON 已导出')
}
function pickBackup() { fileInput.value?.click() }
function importBackup(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (!file) return
  const reader = new FileReader(); reader.onload = () => { try { if (!restoreBackup(JSON.parse(String(reader.result)))) throw new Error('invalid'); showMessage('JSON 已还原') } catch { showMessage('无法还原：文件格式不正确', 'error') } }; reader.onerror = () => showMessage('无法读取文件', 'error'); reader.readAsText(file)
}
function showMessage(message: string, color = 'success') { snackbar.message = message; snackbar.color = color; snackbar.open = true }
useHead({ title: '检查单' })
</script>

<style scoped>
.checklists-home { max-width: 1240px; min-height: calc(100vh - 64px); }
.group-actions { display: flex; align-items: center; gap: 10px; }
.checklist-group + .checklist-group { margin-top: 32px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.checklist-grid { margin-top: 0; }
.empty-card { color: var(--muted); }
@media (max-width: 700px) { .section-heading { align-items: flex-start; gap: 12px; } .group-actions { flex: 0 0 auto; } }
</style>
