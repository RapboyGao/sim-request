<template>
  <section class="checklists-section">
    <div class="section-rail" :class="railClass" />
    <div class="section-content">
      <button class="section-header" :class="{ 'section-header--disabled': disabled }" type="button" :disabled="disabled" @click="toggleSection">
        <div>
          <div class="section-title-row">
            <div class="section-title">{{ section.title }}</div>
          </div>
          <div v-if="section.description" class="section-description">{{ section.description }}</div>
          <div v-if="sectionStats.expired" class="section-meta">
            <span class="text-warning">{{ sectionStats.expired }} 项过期</span>
          </div>
          <div v-if="disabled && disabledHint" class="section-disabled-detail">
            <v-icon icon="mdi-lock-outline" size="14" class="mr-1" />{{ disabledHint }}
          </div>
        </div>
        <div class="section-header-actions">
          <v-progress-circular :model-value="sectionStats.progress * 100" :color="sectionStats.complete ? 'success' : 'primary'" size="34" width="4">
            <span class="progress-number">{{ Math.round(sectionStats.progress * 100) }}</span>
          </v-progress-circular>
          <v-icon v-if="sectionStats.complete" icon="mdi-checkbox-marked-circle-outline" />
        </div>
      </button>

      <div class="section-items">
        <button
          v-for="item in section.items"
          :key="item.id"
          class="check-item"
          :class="{ 'check-item--checked': isChecked(item.id), 'check-item--disabled': disabled, 'check-item--emphasized': item.isEmphasized }"
          type="button"
          :disabled="disabled"
          @click="toggleItem(item.id)"
        >
          <span class="check-box">
            <v-icon v-if="isChecked(item.id)" icon="mdi-check" size="18" />
          </span>
          <span class="check-item-copy">
            <span class="check-item-title-row">
              <span class="check-item-title">{{ item.title }}</span>
            </span>
            <span v-if="item.description" class="check-item-description">{{ item.description }}</span>
          </span>
          <span v-if="isChecked(item.id)" class="check-item-time" :class="{ 'check-item-time--expired': isExpired(item) }">
            {{ checkedTime(item.id) }}
          </span>
          <span v-if="item.isEmphasized" class="check-item-marker" aria-label="重点" title="重点">
            <v-icon icon="mdi-bookmark-outline" size="16" />
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChecklistItem, ChecklistSection, ChecklistStatus } from '~/types/checklist'
import { isItemExpired, sectionStats as getSectionStats } from '~/utils/checklists'
import { formatRelativeTime, type RelativeTimeMessages } from '~/utils/relative-time'

const props = defineProps<{
  section: ChecklistSection
  status: ChecklistStatus
  previousSectionsComplete: boolean
  disabled?: boolean
  disabledHint?: string
}>()

const emit = defineEmits<{
  toggle: [itemId: string]
  setAll: [section: ChecklistSection, checked: boolean]
}>()

const stats = computed(() => getSectionStats(props.section, props.status))
const sectionStats = stats
const { t } = useI18n()
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | undefined
const railClass = computed(() => {
  if (!sectionStats.value.complete) return sectionStats.value.checked ? 'section-rail--partial' : ''
  return props.previousSectionsComplete ? 'section-rail--complete' : 'section-rail--complete-blocked'
})

function isChecked(itemId: string) {
  return Boolean(props.status[itemId])
}

function toggleItem(itemId: string) {
  if (props.disabled) return
  emit('toggle', itemId)
  refreshNow()
}

function toggleSection() {
  if (props.disabled) return
  emit('setAll', props.section, !sectionStats.value.complete)
  refreshNow()
}

function refreshNow() {
  now.value = Date.now()
}

const relativeTimeMessages = computed<RelativeTimeMessages>(() => ({
  justNow: t('checklistTime.justNow'),
  minute: (count) => t(count === 1 ? 'checklistTime.minuteAgo' : 'checklistTime.minutesAgo', { count }),
  hour: (count) => t(count === 1 ? 'checklistTime.hourAgo' : 'checklistTime.hoursAgo', { count }),
  day: (count) => t(count === 1 ? 'checklistTime.dayAgo' : 'checklistTime.daysAgo', { count }),
}))

function checkedTime(itemId: string) {
  const value = props.status[itemId]
  if (!value) return ''
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return ''
  return formatRelativeTime(timestamp, now.value, relativeTimeMessages.value)
}

function isExpired(item: ChecklistItem) {
  return isItemExpired(item, props.status[item.id] || null)
}

onMounted(() => {
  refreshNow()
  clock = setInterval(refreshNow, 15_000)
})

onBeforeUnmount(() => {
  if (clock) clearInterval(clock)
})
</script>

<style scoped>
.checklists-section {
  display: flex;
  gap: 14px;
}

.section-rail {
  flex: 0 0 7px;
  margin: 12px 0 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted) 35%, transparent);
  transition: background 180ms ease;
}

.section-rail--partial { background: rgb(var(--v-theme-secondary)); }
.section-rail--complete { background: rgb(var(--v-theme-success)); }
.section-rail--complete-blocked { background: #2563eb; }

.section-content { min-width: 0; flex: 1; }

.section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-elevated);
  color: var(--text);
  text-align: left;
  cursor: pointer;
}
.section-header--disabled { opacity: .58; cursor: not-allowed; }

.section-title-row { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.section-title { font-weight: 750; font-size: 1.04rem; }
.section-description { color: var(--muted); font-size: .82rem; line-height: 1.45; margin-top: 5px; max-width: 720px; white-space: pre-line; }
.section-meta { display: flex; gap: 12px; color: var(--muted); font-size: .82rem; margin-top: 4px; }
.section-disabled-detail { display: flex; align-items: center; color: var(--muted); font-size: .78rem; margin-top: 6px; }
.section-header-actions { display: flex; align-items: center; gap: 10px; color: var(--muted); }
.progress-number { font-size: .68rem; font-weight: 700; }

.section-items { display: grid; gap: 8px; padding: 10px 0 20px; }

.check-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--soft-border);
  border-radius: 12px;
  background: var(--surface-elevated);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.check-item:hover { border-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 40%, var(--border)); transform: translateX(2px); }
.check-item:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.check-item:disabled:hover { border-color: var(--soft-border); }
.check-item--checked { background: color-mix(in srgb, rgb(var(--v-theme-primary)) 9%, var(--surface-elevated)); }
.check-item--emphasized .check-item-title { font-weight: 800; }
.check-box { display: grid; place-items: center; width: 24px; height: 24px; flex: 0 0 24px; border: 2px solid var(--muted); border-radius: 7px; color: white; }
.check-item--checked .check-box { border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary)); }
.check-item-copy { display: grid; flex: 1 1 auto; width: 100%; gap: 3px; min-width: 0; }
.check-item-title-row { display: flex; align-items: baseline; gap: 8px; width: 100%; min-width: 0; }
.check-item-title { flex: 1 1 auto; min-width: 0; font-weight: 600; line-height: 1.35; }
.check-item-time { margin-left: auto; text-align: right; align-self: center; }
.check-item-marker { flex: 0 0 auto; align-self: center; margin-left: 8px; color: rgb(var(--v-theme-primary)); opacity: .78; }
.check-item--checked .check-item-title { color: var(--muted); text-decoration: line-through; }
.check-item-description, .check-item-time { color: var(--muted); font-size: .82rem; line-height: 1.4; }
.check-item-description { white-space: pre-line; }
.check-item-time { flex: 0 0 auto; white-space: nowrap; }
.check-item-time--expired { color: rgb(var(--v-theme-secondary)); }
.text-warning { color: rgb(var(--v-theme-secondary)); }

@media (max-width: 600px) {
  .checklists-section { gap: 8px; }
  .section-rail { flex-basis: 5px; }
  .section-header, .check-item { padding: 13px 12px; }
}
</style>
