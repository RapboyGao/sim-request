<template>
  <v-container v-if="checklist" class="checklists-detail py-6 py-md-10">
    <div class="checklist-detail-layout">
      <div class="checklist-detail-content">
    <div class="detail-head mb-7">
      <div class="detail-title-wrap">
        <div class="detail-title-row">
          <v-icon
            v-if="checklist.icon"
            :icon="checklist.icon"
            size="30"
            color="primary"
            aria-hidden="true"
          />
          <h1 class="text-h4 text-md-h3 font-weight-bold">{{ checklist.title }}</h1>
        </div>
        <p v-if="checklist.description" class="detail-description">{{ checklist.description }}</p>
      </div>
      <div class="detail-actions">
        <v-btn
          icon="mdi-backup-restore"
          variant="tonal"
          aria-label="重置检查单"
          title="重置检查单"
          @click="resetDialog = true"
        />
      </div>
    </div>

    <div v-if="checklist.notes.length" class="notes-stack mb-8">
      <v-expansion-panels variant="accordion" multiple>
        <v-expansion-panel v-for="item in checklist.notes" :key="item.id" rounded="lg">
          <v-expansion-panel-title>
            <v-icon icon="mdi-lightbulb-outline" color="warning" class="mr-3" />
            {{ item.title }}
            <template #actions>
              <v-btn size="small" variant="tonal" prepend-icon="mdi-content-copy" @click.stop="copyNote(item)">
                复制说明
              </v-btn>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p v-for="paragraph in item.paragraphs" :key="paragraph" class="note-paragraph">{{ paragraph }}</p>
            <ul v-if="item.bullets.length" class="note-list">
              <li v-for="bullet in item.bullets" :key="bullet">{{ bullet }}</li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <ChecklistSections
      :checklist="checklist"
      :status="status"
      class="sections-stack"
      @toggle="toggleItem"
      @set-all="setAll"
      @reset-section="resetSection"
    />

    <div class="detail-footer">
      <v-btn variant="text" prepend-icon="mdi-arrow-up" @click="scrollTop">回到顶部</v-btn>
      <span>勾选状态会自动保存在本机</span>
    </div>

    <v-dialog v-model="resetDialog" max-width="420">
      <v-card>
        <v-card-title>重置检查单？</v-card-title>
        <v-card-text>当前检查单的所有勾选状态都会被清除。</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="resetDialog = false">取消</v-btn>
          <v-btn color="primary" @click="reset">确认重置</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>删除检查单？</v-card-title>
        <v-card-text>“{{ checklist.title }}”及其本机保存的状态将被删除。</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" @click="remove">确认删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.open" :color="snackbar.color" timeout="3000">{{ snackbar.message }}</v-snackbar>
      </div>

      <aside v-if="stats.checked > 0" class="checklist-progress-rail" :aria-label="`检查单状态：${railStatusLabel}，完成度 ${Math.round(stats.progress * 100)}%`">
        <span class="checklist-progress-track" :class="`checklist-progress-track--${railStatus}`" />
        <span class="checklist-progress-label">{{ Math.round(stats.progress * 100) }}%</span>
      </aside>
    </div>
  </v-container>
  <v-container v-else class="py-16 text-center">
    <v-icon icon="mdi-file-question-outline" size="48" color="primary" />
    <div class="text-h6 mt-3">找不到这个检查单</div>
  </v-container>
</template>

<script setup lang="ts">
import ChecklistSections from '~/components/checklists/ChecklistSections.vue'
import { publicBuiltinChecklists } from '~/data/public-checklists'
import type { Checklist } from '~/types/checklist'
import { useChecklistsPageActions } from '~/composables/useChecklistsPageActions'
import { checklistStats } from '~/utils/checklists'
import { publicChecklistsHomeRoute, publicCustomChecklistEditRoute, publicCustomChecklistRoute } from '~/utils/checklist-routes'

const props = defineProps<{ checklistId?: string; checklist?: Checklist }>()
const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()
const builtins = computed(() => publicBuiltinChecklists(locale.value))
const { allChecklists, status, toggleItem: toggleStoredItem, setSection, resetChecklist, duplicateChecklist, deleteChecklist } = useChecklists({ builtins })
const { register: registerPageActions } = useChecklistsPageActions()
const resetDialog = ref(false)
const deleteDialog = ref(false)
const snackbar = reactive({ open: false, message: '', color: 'success' })

const checklist = computed(() => props.checklist || allChecklists.value.find((item) => item.id === props.checklistId))
const stats = computed(() => checklist.value ? checklistStats(checklist.value, status.value) : { checked: 0, total: 0, expired: 0, progress: 0, complete: false })
const railStatus = computed(() => {
  if (stats.value.complete) return 'complete'
  return 'partial'
})
const railStatusLabel = computed(() => ({
  complete: '已完成',
  partial: '部分完成',
}[railStatus.value]))
const homeRoute = () => localePath(publicChecklistsHomeRoute())
const customRoute = (id: string) => localePath(publicCustomChecklistRoute(id))
const editRoute = (id: string) => localePath(publicCustomChecklistEditRoute(id))

function toggleItem(itemId: string) {
  if (checklist.value) toggleStoredItem(itemId, checklist.value)
}

function setAll(section: Checklist['sections'][number], checked: boolean) {
  if (checklist.value) setSection(section, checked, checklist.value)
}

function resetSection(section: Checklist['sections'][number]) {
  if (checklist.value) setSection(section, false, checklist.value)
}

function reset() {
  if (!checklist.value) return
  resetChecklist(checklist.value)
  resetDialog.value = false
  showMessage('检查单已重置')
}

function openEditor() {
  if (!checklist.value || checklist.value.source !== 'custom') return
  router.push(editRoute(checklist.value.id))
}

function duplicate() {
  if (!checklist.value) return
  const id = duplicateChecklist(checklist.value.id)
  if (id) router.push(customRoute(id))
}

function remove() {
  if (!checklist.value) return
  deleteChecklist(checklist.value.id)
  router.push(homeRoute())
}

onMounted(() => {
  registerPageActions({
    reset: () => { resetDialog.value = true },
    duplicate,
    ...(checklist.value?.source === 'custom' ? {
      edit: openEditor,
      remove: () => { deleteDialog.value = true },
    } : {}),
  })
})

onBeforeUnmount(() => registerPageActions(null))

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showMessage(message: string, color = 'success') {
  snackbar.message = message
  snackbar.color = color
  snackbar.open = true
}

async function copyNote(item: Checklist['notes'][number]) {
  const content = [item.title, ...item.paragraphs, ...item.bullets].join('\n')
  await copyText(content, '说明已复制')
}

async function copyText(content: string, successMessage: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    showMessage(successMessage)
  } catch {
    showMessage('复制失败，请手动选择文本', 'error')
  }
}

useHead(() => ({ title: checklist.value?.title || '检查单' }))
</script>

<style scoped>
.checklists-detail { max-width: 980px; min-height: calc(100vh - 64px); }
.checklist-detail-layout { display: flex; align-items: stretch; gap: 18px; }
.checklist-detail-content { min-width: 0; flex: 1; }
.checklist-progress-rail { display: flex; flex: 0 0 36px; flex-direction: column; align-items: center; gap: 8px; min-height: calc(100vh - 150px); position: sticky; top: 84px; }
.checklist-progress-track { display: block; width: 3px; flex: 1; min-height: 220px; border-radius: 999px; transition: background-color 240ms ease; }
.checklist-progress-track--partial { background: rgb(var(--v-theme-warning)); }
.checklist-progress-track--complete { background: rgb(var(--v-theme-success)); }
.checklist-progress-label { color: var(--muted); font-size: .72rem; font-weight: 750; }
.detail-head { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.detail-title-wrap { min-width: 0; flex: 1 1 auto; }
.detail-title-row { display: flex; align-items: center; gap: 12px; min-width: 0; }
.detail-title-row .v-icon { flex: 0 0 auto; }
.detail-description { max-width: 700px; color: var(--muted); line-height: 1.6; margin: 10px 0 0; white-space: pre-line; }
.detail-actions { display: flex; align-items: center; flex: 0 0 auto; }
.sections-stack { display: grid; gap: 2px; }
.notes-stack :deep(.v-expansion-panel) { background: var(--surface-elevated); border: 1px solid var(--border); }
.note-paragraph { line-height: 1.6; margin: 0 0 8px; }
.note-list { padding-left: 20px; margin: 0; display: grid; gap: 8px; line-height: 1.55; }
.detail-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; color: var(--muted); font-size: .8rem; }
.text-warning { color: rgb(var(--v-theme-secondary)); }
@media (max-width: 650px) {
  .checklist-detail-layout { gap: 8px; }
  .checklist-progress-rail { flex-basis: 20px; }
  .checklist-progress-track { width: 2px; min-height: 180px; }
  .detail-head { gap: 12px; }
  .detail-actions { align-self: center; }
  .detail-footer { align-items: flex-start; flex-direction: column; gap: 5px; }
}
</style>
