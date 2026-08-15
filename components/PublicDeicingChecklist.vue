<template>
  <v-container class="checklists-detail py-6 py-md-10">
    <div class="checklist-detail-layout">
      <div class="checklist-detail-content">
        <div class="detail-head mb-7">
          <div class="detail-title-wrap">
            <div class="eyebrow">
              <v-icon icon="mdi-snowflake-melt" size="18" class="mr-1" />
              {{ t('deicing.eyebrow') }}
            </div>
            <h1 class="text-h4 text-md-h3 font-weight-bold mt-2">{{ content.checklist.title }}</h1>
            <p class="detail-description">{{ content.checklist.description }}</p>
          </div>
          <div class="detail-actions">
            <v-btn
              icon="mdi-backup-restore"
              variant="tonal"
              :aria-label="t('deicing.reset')"
              :title="t('deicing.reset')"
              @click="resetDialog = true"
            />
          </div>
        </div>

        <div class="source-stack mb-8">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel rounded="lg">
              <v-expansion-panel-title>
                <v-icon icon="mdi-file-document-outline" color="primary" class="mr-3" />
                {{ content.noteTitle }}
                <template #actions>
                  <v-btn size="small" variant="tonal" prepend-icon="mdi-content-copy" @click.stop="copyNote">
                    {{ t('deicing.copy') }}
                  </v-btn>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre class="source-content">{{ content.note }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <ChecklistSections
          :checklist="content.checklist"
          :status="status"
          class="sections-stack"
          :exclusive-default-name="t('deicing.exclusiveGroupName')"
          :exclusive-disabled-hint="t('deicing.exclusiveDisabled')"
          :exclusive-count-label="t('deicing.exclusiveCount')"
          @toggle="toggleItem"
          @set-all="setAll"
        />

        <div class="detail-footer">
          <v-btn variant="text" prepend-icon="mdi-arrow-up" @click="scrollTop">回到顶部</v-btn>
          <span>{{ t('deicing.publicHint') }}</span>
        </div>
      </div>

      <aside v-if="stats.checked > 0" class="checklist-progress-rail" :aria-label="`${t('deicing.progress')} ${Math.round(stats.progress * 100)}%`">
        <span class="checklist-progress-track" :class="`checklist-progress-track--${railStatus}`" />
        <span class="checklist-progress-label">{{ Math.round(stats.progress * 100) }}%</span>
      </aside>
    </div>

    <v-dialog v-model="resetDialog" max-width="420">
      <v-card>
        <v-card-title>{{ t('deicing.reset') }}？</v-card-title>
        <v-card-text>{{ t('deicing.resetConfirm') }}</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="resetDialog = false">{{ t('deicing.cancel') }}</v-btn>
          <v-btn color="primary" @click="reset">{{ t('deicing.reset') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.open" :color="snackbar.color" timeout="3000">{{ snackbar.message }}</v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import ChecklistSections from '~/components/checklists/ChecklistSections.vue'
import { useStorage } from '@vueuse/core'
import { publicDeicingChecklist } from '~/data/public-deicing'
import type { Checklist, ChecklistStatus } from '~/types/checklist'
import { checklistStats, resetChecklistStatus, setChecklistSectionStatus, toggleChecklistItemStatus } from '~/utils/checklists'

const { t, locale } = useI18n()
const content = computed(() => publicDeicingChecklist(locale.value))
const status = useStorage<ChecklistStatus>('public-deicing-status-v2', {})
const resetDialog = ref(false)
const snackbar = reactive({ open: false, message: '', color: 'success' })
const stats = computed(() => checklistStats(content.value.checklist, status.value))
const railStatus = computed(() => stats.value.complete ? 'complete' : 'partial')

function toggleItem(itemId: string) {
  status.value = toggleChecklistItemStatus(status.value, content.value.checklist, itemId)
}

function setAll(section: Checklist['sections'][number], checked: boolean) {
  status.value = setChecklistSectionStatus(status.value, content.value.checklist, section, checked)
}

function reset() {
  status.value = resetChecklistStatus(status.value, content.value.checklist)
  resetDialog.value = false
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function copyNote() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(content.value.note)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = content.value.note
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    snackbar.message = t('deicing.copied')
    snackbar.color = 'success'
  } catch {
    snackbar.message = t('deicing.copyUnavailable')
    snackbar.color = 'error'
  }
  snackbar.open = true
}

useHead(() => ({ title: content.value.checklist.title }))
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
.detail-description { max-width: 700px; color: var(--muted); line-height: 1.6; margin: 10px 0 0; }
.detail-actions { display: flex; align-items: center; flex: 0 0 auto; }
.sections-stack { display: grid; gap: 2px; }
.source-stack :deep(.v-expansion-panel) { background: var(--surface-elevated); border: 1px solid var(--border); }
.source-content { max-height: 520px; overflow: auto; margin: 0; padding: 14px; border-radius: 10px; background: color-mix(in srgb, var(--surface) 76%, var(--bg)); color: var(--text); font: .78rem/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
.detail-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; color: var(--muted); font-size: .8rem; }
@media (max-width: 650px) {
  .checklist-detail-layout { gap: 8px; }
  .checklist-progress-rail { flex-basis: 20px; }
  .checklist-progress-track { width: 2px; min-height: 180px; }
  .detail-head { gap: 12px; }
  .detail-actions { align-self: center; }
  .detail-footer { align-items: flex-start; flex-direction: column; gap: 5px; }
}
</style>
