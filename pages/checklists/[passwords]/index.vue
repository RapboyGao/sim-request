<template>
  <v-container class="checklists-home py-6 py-md-10">
    <div class="checklists-hero mb-7">
      <div>
        <div class="checklists-eyebrow"><v-icon icon="mdi-flight-check" size="18" /> OFFLINE FLIGHT TOOL</div>
        <h1 class="text-h4 text-md-h3 font-weight-bold mt-2">航空检查单</h1>
        <p class="hero-copy">把准备、航段和除冰程序集中在一个安静、可靠的清单里。</p>
      </div>
      <div class="hero-actions">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createNew">新建检查单</v-btn>
        <v-menu content-class="checklists-menu-content">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="tonal" icon="mdi-dots-vertical" aria-label="更多操作" />
          </template>
          <v-list density="comfortable" min-width="190">
            <v-list-item prepend-icon="mdi-download-outline" title="导出 JSON" @click="exportBackup" />
            <v-list-item prepend-icon="mdi-upload-outline" title="还原 JSON" @click="pickBackup" />
          </v-list>
        </v-menu>
        <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importBackup" />
      </div>
    </div>

    <v-card class="checklists-toolbar mb-6" rounded="xl">
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索检查单" hide-details clearable />
      <div class="toolbar-hint">
        <v-icon icon="mdi-database-outline" size="16" class="mr-1" />
        本地保存 · 支持离线使用
      </div>
    </v-card>

    <template v-if="filteredChecklists.length">
      <section v-for="group in checklistGroups" :key="group.key" class="checklist-group">
        <div class="section-heading">
          <div>
            <h2 class="text-h6 font-weight-bold">{{ group.title }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ group.items.length }} 个检查单</p>
          </div>
        </div>
        <v-row v-if="group.items.length" class="checklist-grid">
          <v-col v-for="checklist in group.items" :key="checklist.id" cols="12" sm="6" lg="4">
            <ChecklistCard
              :checklist="checklist"
              :status="status"
              :favorite="favorites.includes(checklist.id)"
              @open="openChecklist(checklist.id)"
              @toggle-favorite="toggleFavorite(checklist.id)"
            />
          </v-col>
        </v-row>
        <v-card v-else class="empty-card pa-6 text-center" rounded="xl">
          <div class="text-body-2">没有匹配的检查单</div>
        </v-card>
      </section>
    </template>
    <v-card v-else class="empty-card pa-10 text-center" rounded="xl">
      <v-icon icon="mdi-text-search" size="44" color="primary" class="mb-3" />
      <div class="text-h6">没有匹配的检查单</div>
      <div class="text-body-2 text-medium-emphasis mt-1">试试其他关键词，或新建一个自定义检查单。</div>
    </v-card>

    <v-snackbar v-model="snackbar.open" :color="snackbar.color" timeout="3200">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import ChecklistCard from '~/components/checklists/ChecklistCard.vue'
import { checklistRoute, customChecklistEditRoute, customChecklistRoute } from '~/utils/checklist-routes'
import { sortChecklistsByFavorite } from '~/utils/checklists'

definePageMeta({ layout: 'checklists' })

const route = useRoute()
const { allChecklists, status, favorites, addChecklist, createBackup, importBackup: restoreBackup, toggleFavorite } = useChecklists()
const search = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const snackbar = reactive({ open: false, message: '', color: 'success' })

const filteredChecklists = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return allChecklists.value
  return allChecklists.value.filter((checklist) => `${checklist.title} ${checklist.description}`.toLowerCase().includes(keyword))
})

const checklistGroups = computed(() => [
  {
    key: 'builtin',
    title: '内置检查单',
    items: sortChecklistsByFavorite(filteredChecklists.value.filter((checklist) => checklist.source === 'builtin'), favorites.value),
  },
  {
    key: 'custom',
    title: '自定义检查单',
    items: sortChecklistsByFavorite(filteredChecklists.value.filter((checklist) => checklist.source === 'custom'), favorites.value),
  },
])

function openChecklist(id: string) {
  const target = allChecklists.value.find((item) => item.id === id)
  if (!target) return
  navigateTo(target.source === 'builtin'
    ? checklistRoute(String(route.params.passwords), id)
    : customChecklistRoute(String(route.params.passwords), id))
}

function createNew() {
  const id = addChecklist()
  if (id) navigateTo(customChecklistEditRoute(String(route.params.passwords), id))
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `aviation-checklists-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  showMessage('JSON 已导出')
}

function pickBackup() {
  fileInput.value?.click()
}

function importBackup(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      if (!restoreBackup(JSON.parse(String(reader.result)))) throw new Error('invalid')
      showMessage('JSON 已还原')
    } catch {
      showMessage('无法还原：文件格式不正确', 'error')
    }
  }
  reader.onerror = () => showMessage('无法读取文件', 'error')
  reader.readAsText(file)
}

function showMessage(message: string, color = 'success') {
  snackbar.message = message
  snackbar.color = color
  snackbar.open = true
}

useHead({ title: '检查单' })
</script>

<style scoped>
.checklists-home { max-width: 1240px; min-height: calc(100vh - 64px); }
.checklists-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
.checklists-eyebrow { display: flex; align-items: center; gap: 7px; color: rgb(var(--v-theme-primary)); font-size: .74rem; font-size: .74rem; font-weight: 800; letter-spacing: .14em; }
.hero-copy { color: var(--muted); max-width: 560px; margin: 10px 0 0; line-height: 1.6; }
.hero-actions { display: flex; align-items: center; gap: 10px; }
.checklists-toolbar { display: flex; align-items: center; gap: 18px; padding: 12px 16px; background: var(--surface); }
.checklists-toolbar .v-input { flex: 1; }
.toolbar-hint { flex: 0 0 auto; display: flex; align-items: center; color: var(--muted); font-size: .82rem; white-space: nowrap; }
.checklist-group + .checklist-group { margin-top: 32px; }
.section-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.checklist-grid { margin-top: 0; }
.empty-card { color: var(--muted); }
@media (max-width: 700px) {
  .checklists-hero { align-items: flex-start; flex-direction: column; }
  .hero-actions { width: 100%; }
  .hero-actions .v-btn:first-child { flex: 1; }
  .checklists-toolbar { display: block; }
  .toolbar-hint { margin-top: 8px; }
}
</style>
