<template>
  <v-form @submit.prevent="save">
    <v-card-title class="px-0 pt-0">{{ isNew ? '新建检查单' : '编辑检查单' }}</v-card-title>
    <v-card-text class="px-0">
      <v-text-field v-model="working.title" label="检查单名称" autofocus :rules="[requiredRule]" />
      <v-textarea v-model="working.description" label="说明 / 提示" rows="2" auto-grow />

      <div class="editor-heading">
        <span>检查分组</span>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addSection">添加分组</v-btn>
      </div>

      <div v-for="(section, sectionIndex) in working.sections" :key="section.id" class="editor-section">
        <div class="d-flex align-center ga-2">
          <v-text-field v-model="section.title" label="分组名称" hide-details density="compact" />
          <v-btn icon="mdi-chevron-up" size="small" variant="text" :disabled="sectionIndex === 0" aria-label="分组上移" @click="moveSection(sectionIndex, -1)" />
          <v-btn icon="mdi-chevron-down" size="small" variant="text" :disabled="sectionIndex === working.sections.length - 1" aria-label="分组下移" @click="moveSection(sectionIndex, 1)" />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" aria-label="删除分组" @click="removeSection(sectionIndex)" />
        </div>

        <div v-for="(item, itemIndex) in section.items" :key="item.id" class="editor-item">
          <v-text-field v-model="item.title" label="条目" hide-details density="compact" class="flex-grow-1" />
          <v-text-field v-model="item.detail" label="提示" hide-details density="compact" class="flex-grow-1" />
          <v-text-field v-model.number="item.expiresAfterHours" label="时效（小时）" type="number" min="0" hide-details density="compact" class="expiry-input" />
          <v-btn icon="mdi-chevron-up" size="small" variant="text" :disabled="itemIndex === 0" aria-label="条目上移" @click="moveItem(section, itemIndex, -1)" />
          <v-btn icon="mdi-chevron-down" size="small" variant="text" :disabled="itemIndex === section.items.length - 1" aria-label="条目下移" @click="moveItem(section, itemIndex, 1)" />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" aria-label="删除条目" @click="removeItem(section, itemIndex)" />
        </div>
        <v-btn size="small" variant="text" prepend-icon="mdi-plus" @click="addItem(section)">添加条目</v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="px-0 justify-end">
      <v-btn variant="text" @click="$emit('cancel')">取消</v-btn>
      <v-btn color="primary" type="submit">保存</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup lang="ts">
import type { Checklist, ChecklistSection } from '~/types/checklist'
import { DEFAULT_EXPIRY_HOURS } from '~/utils/checklists'

const props = defineProps<{ checklist: Checklist }>()
const emit = defineEmits<{ save: [checklist: Checklist]; cancel: [] }>()
const working = ref(structuredClone(props.checklist))
const isNew = computed(() => !props.checklist.sections.some((section) => section.items.length > 0) && props.checklist.title === '新检查单')

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function requiredRule(value: string) {
  return value.trim().length > 0 || '请输入名称'
}

function addSection() {
  working.value.sections.push({ id: id('section'), title: '新分组', items: [] })
}

function removeSection(index: number) {
  if (working.value.sections.length <= 1) return
  working.value.sections.splice(index, 1)
}

function moveSection(index: number, direction: number) {
  const next = index + direction
  if (next < 0 || next >= working.value.sections.length) return
  const sections = working.value.sections
  ;[sections[index], sections[next]] = [sections[next]!, sections[index]!]
}

function addItem(section: ChecklistSection) {
  section.items.push({ id: id('item'), title: '新条目', detail: '', expiresAfterHours: DEFAULT_EXPIRY_HOURS })
}

function removeItem(section: ChecklistSection, index: number) {
  section.items.splice(index, 1)
}

function moveItem(section: ChecklistSection, index: number, direction: number) {
  const next = index + direction
  if (next < 0 || next >= section.items.length) return
  ;[section.items[index], section.items[next]] = [section.items[next]!, section.items[index]!]
}

function save() {
  if (!working.value.title.trim()) return
  emit('save', structuredClone(working.value))
}
</script>

<style scoped>
.editor-heading { display: flex; align-items: center; justify-content: space-between; margin: 18px 0 10px; font-weight: 700; }
.editor-section { display: grid; gap: 10px; padding: 14px; margin-bottom: 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-elevated); }
.editor-item { display: flex; align-items: center; gap: 6px; }
.expiry-input { max-width: 105px; }
@media (max-width: 700px) {
  .editor-item { flex-wrap: wrap; }
  .editor-item > :first-child, .editor-item > :nth-child(2) { min-width: calc(50% - 4px); }
  .expiry-input { max-width: 140px; }
}
</style>
