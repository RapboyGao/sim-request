<template>
  <section class="checklists-section">
    <div class="section-rail" :class="railClass" />
    <div class="section-content">
      <button class="section-header" type="button" @click="toggleSection">
        <div>
          <div class="section-title-row">
            <div class="section-title">{{ section.title }}</div>
            <span v-if="section.completion === 'exclusive'" class="section-rule">任选其一</span>
          </div>
          <div v-if="section.detail" class="section-detail">{{ section.detail }}</div>
          <div v-if="section.completion === 'exclusive'" class="section-exclusive-detail">本组互斥：完成其中一个分组即可</div>
          <div class="section-meta">
            <span>{{ sectionStats.checked }} / {{ sectionStats.total }}</span>
            <span v-if="sectionStats.expired" class="text-warning">{{ sectionStats.expired }} 项过期</span>
          </div>
        </div>
        <div class="section-header-actions">
          <v-progress-circular :model-value="sectionStats.progress * 100" :color="sectionStats.complete ? 'success' : 'primary'" size="34" width="4">
            <span class="progress-number">{{ Math.round(sectionStats.progress * 100) }}</span>
          </v-progress-circular>
          <v-icon :icon="sectionStats.complete ? 'mdi-checkbox-marked-circle-outline' : 'mdi-chevron-down'" :class="{ 'rotate-180': !sectionStats.complete }" />
        </div>
      </button>

      <div class="section-items">
        <button
          v-for="item in section.items"
          :key="item.id"
          class="check-item"
          :class="{ 'check-item--checked': isChecked(item.id) }"
          type="button"
          @click="toggleItem(item.id)"
        >
          <span class="check-box">
            <v-icon v-if="isChecked(item.id)" icon="mdi-check" size="18" />
          </span>
          <span class="check-item-copy">
            <span class="check-item-title-row">
              <span class="check-item-title">{{ item.title }}</span>
              <span v-if="isChecked(item.id)" class="check-item-time">
                {{ checkedTime(item.id) }}<span v-if="isExpired(item)" class="text-warning ml-2">已过期</span>
              </span>
            </span>
            <span v-if="item.detail" class="check-item-detail">{{ item.detail }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChecklistItem, ChecklistSection, ChecklistStatus } from '~/types/checklist'
import { formatTimeAgo, useNow } from '@vueuse/core'
import { isItemExpired, sectionStats as getSectionStats } from '~/utils/checklists'

const props = defineProps<{
  section: ChecklistSection
  status: ChecklistStatus
  previousSectionsComplete: boolean
}>()

const emit = defineEmits<{
  toggle: [itemId: string]
  setAll: [section: ChecklistSection, checked: boolean]
}>()

const stats = computed(() => getSectionStats(props.section, props.status))
const sectionStats = stats
const now = useNow({ interval: 30_000 })
const railClass = computed(() => {
  if (!sectionStats.value.complete) return sectionStats.value.checked ? 'section-rail--partial' : ''
  return props.previousSectionsComplete ? 'section-rail--complete' : 'section-rail--complete-blocked'
})

function isChecked(itemId: string) {
  return Boolean(props.status[itemId])
}

function toggleItem(itemId: string) {
  emit('toggle', itemId)
}

function toggleSection() {
  emit('setAll', props.section, !sectionStats.value.complete)
}

function checkedTime(itemId: string) {
  const value = props.status[itemId]
  if (!value) return ''
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return ''
  return formatTimeAgo(new Date(timestamp), {
    showSecond: true,
    messages: {
      justNow: 'a few seconds ago',
      past: '{0} ago',
      future: 'in {0}',
      second: 'a few seconds',
      minute: 'a few minutes',
      hour: 'a few hours',
      day: 'a day',
      week: 'a week',
      month: 'a month',
      year: 'a year',
      invalid: '',
    },
  }, Math.max(now.value.getTime(), timestamp))
}

function isExpired(item: ChecklistItem) {
  return isItemExpired(item, props.status[item.id] || null)
}
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
.section-rail--complete-blocked { background: rgb(var(--v-theme-primary)); }

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

.section-title-row { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.section-title { font-weight: 750; font-size: 1.04rem; }
.section-rule { color: rgb(var(--v-theme-primary)); font-size: .72rem; font-weight: 750; border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 45%, var(--border)); border-radius: 999px; padding: 2px 8px; }
.section-detail { color: var(--muted); font-size: .82rem; line-height: 1.45; margin-top: 5px; max-width: 720px; }
.section-exclusive-detail { color: rgb(var(--v-theme-primary)); font-size: .78rem; line-height: 1.4; margin-top: 5px; }
.section-meta { display: flex; gap: 12px; color: var(--muted); font-size: .82rem; margin-top: 4px; }
.section-header-actions { display: flex; align-items: center; gap: 10px; color: var(--muted); }
.progress-number { font-size: .68rem; font-weight: 700; }
.rotate-180 { transform: rotate(180deg); }

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
.check-item--checked { background: color-mix(in srgb, rgb(var(--v-theme-primary)) 9%, var(--surface-elevated)); }
.check-box { display: grid; place-items: center; width: 24px; height: 24px; flex: 0 0 24px; border: 2px solid var(--muted); border-radius: 7px; color: white; }
.check-item--checked .check-box { border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary)); }
.check-item-copy { display: grid; gap: 3px; min-width: 0; }
.check-item-title-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.check-item-title { font-weight: 600; line-height: 1.35; }
.check-item--checked .check-item-title { color: var(--muted); text-decoration: line-through; }
.check-item-detail, .check-item-time { color: var(--muted); font-size: .82rem; line-height: 1.4; }
.check-item-time { flex: 0 0 auto; white-space: nowrap; }
.text-warning { color: rgb(var(--v-theme-secondary)); }

@media (max-width: 600px) {
  .checklists-section { gap: 8px; }
  .section-rail { flex-basis: 5px; }
  .section-header, .check-item { padding: 13px 12px; }
}
</style>
