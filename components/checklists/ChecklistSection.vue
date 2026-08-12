<template>
  <section class="checklists-section">
    <div class="section-rail" :class="sectionStats.complete ? 'section-rail--complete' : sectionStats.checked ? 'section-rail--partial' : ''" />
    <div class="section-content">
      <button class="section-header" type="button" @click="toggleSection">
        <div>
          <div class="section-title">{{ section.title }}</div>
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
            <span class="check-item-title">{{ item.title }}</span>
            <span v-if="item.detail" class="check-item-detail">{{ item.detail }}</span>
            <span v-if="isChecked(item.id)" class="check-item-time">
              {{ checkedTime(item.id) }}<span v-if="isExpired(item)" class="text-warning ml-2">已过期</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChecklistItem, ChecklistSection, ChecklistStatus } from '~/types/checklist'
import { isItemExpired, sectionStats as getSectionStats } from '~/utils/checklists'

const props = defineProps<{
  section: ChecklistSection
  status: ChecklistStatus
}>()

const emit = defineEmits<{
  toggle: [itemId: string]
  setAll: [section: ChecklistSection, checked: boolean]
}>()

const stats = computed(() => getSectionStats(props.section, props.status))
const sectionStats = stats

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
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
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
.section-rail--complete { background: rgb(var(--v-theme-primary)); }

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

.section-title { font-weight: 750; font-size: 1.04rem; }
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
.check-item-title { font-weight: 600; line-height: 1.35; }
.check-item--checked .check-item-title { color: var(--muted); text-decoration: line-through; }
.check-item-detail, .check-item-time { color: var(--muted); font-size: .82rem; line-height: 1.4; }
.text-warning { color: rgb(var(--v-theme-secondary)); }

@media (max-width: 600px) {
  .checklists-section { gap: 8px; }
  .section-rail { flex-basis: 5px; }
  .section-header, .check-item { padding: 13px 12px; }
}
</style>
