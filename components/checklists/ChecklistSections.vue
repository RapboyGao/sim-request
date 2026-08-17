<template>
  <div class="checklist-sections">
    <template v-for="block in blocks" :key="block.id">
      <div v-if="block.kind === 'exclusive'" class="exclusive-group">
        <div class="exclusive-group__header">
          <div>
            <div class="exclusive-group__title">
              <v-icon icon="mdi-swap-horizontal-bold" size="18" />
              {{ groupTitle(block.sections) }}
            </div>
          </div>
          <v-chip size="small" variant="tonal" color="primary">{{ block.sections.length }} {{ exclusiveCountLabel }}</v-chip>
        </div>
        <div class="exclusive-group__sections">
          <ChecklistSection
            v-for="section in block.sections"
            :key="section.id"
            :section="section"
            :status="status"
            :disabled="isSectionDisabled(section)"
            :disabled-hint="exclusiveDisabledHint"
            :previous-sections-complete="previousSectionsComplete(sectionIndex(section))"
            @toggle="toggleItem"
            @set-all="setAll"
            @reset-section="resetSection"
          />
        </div>
      </div>

      <ChecklistSection
        v-else
        :section="block.section"
        :status="status"
        :previous-sections-complete="previousSectionsComplete(block.sectionIndex)"
        @toggle="toggleItem"
        @set-all="setAll"
        @reset-section="resetSection"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import ChecklistSection from '~/components/checklists/ChecklistSection.vue'
import type { Checklist, ChecklistSection as ChecklistSectionData, ChecklistStatus } from '~/types/checklist'
import { exclusiveGroupName, exclusiveSectionDisabled, exclusiveSectionGroups, sectionStats } from '~/utils/checklists'

type ExclusiveBlock = {
  id: string
  kind: 'exclusive'
  sections: ChecklistSectionData[]
}

type NormalBlock = {
  id: string
  kind: 'normal'
  sectionIndex: number
  section: ChecklistSectionData
}

const props = withDefaults(defineProps<{
  checklist: Checklist
  status: ChecklistStatus
  exclusiveDefaultName?: string
  exclusiveDisabledHint?: string
  exclusiveCountLabel?: string
}>(), {
  exclusiveDefaultName: '选一组完成',
  exclusiveDisabledHint: '已选择另一分组',
  exclusiveCountLabel: '项选 1',
})

const emit = defineEmits<{
  toggle: [itemId: string]
  setAll: [section: ChecklistSectionData, checked: boolean]
  resetSection: [section: ChecklistSectionData]
}>()

const groups = computed(() => exclusiveSectionGroups(props.checklist))
const blocks = computed<Array<ExclusiveBlock | NormalBlock>>(() => {
  const renderedGroups = new Set<ChecklistSectionData[]>()
  return props.checklist.sections.flatMap((section, sectionIndex): Array<ExclusiveBlock | NormalBlock> => {
    if (section.completion !== 'exclusive') {
      return [{ kind: 'normal', id: section.id, sectionIndex, section }]
    }
    const group = groups.value.find((candidate) => candidate.includes(section))
    if (!group || renderedGroups.has(group)) return []
    renderedGroups.add(group)
    return [{ kind: 'exclusive', id: `exclusive-${group[0]?.id || section.id}`, sections: group }]
  })
})

function sectionIndex(section: ChecklistSectionData) {
  return props.checklist.sections.indexOf(section)
}

function groupTitle(group: ChecklistSectionData[]) {
  return exclusiveGroupName(group, props.exclusiveDefaultName)
}

function isSectionDisabled(section: ChecklistSectionData) {
  return exclusiveSectionDisabled(props.checklist, props.status, section)
}

function previousSectionsComplete(index: number) {
  if (index <= 0) return true
  const handledGroups = new Set<ChecklistSectionData[]>()
  for (const section of props.checklist.sections.slice(0, index)) {
    if (section.completion !== 'exclusive') {
      if (!sectionStats(section, props.status).complete) return false
      continue
    }
    const group = groups.value.find((candidate) => candidate.includes(section))
    if (!group || handledGroups.has(group)) continue
    if (!group.some((candidate) => sectionStats(candidate, props.status).complete)) return false
    handledGroups.add(group)
  }
  return true
}

function toggleItem(itemId: string) {
  emit('toggle', itemId)
}

function setAll(section: ChecklistSectionData, checked: boolean) {
  emit('setAll', section, checked)
}

function resetSection(section: ChecklistSectionData) {
  emit('resetSection', section)
}
</script>

<style scoped>
.checklist-sections { display: grid; gap: 2px; }
.exclusive-group {
  margin: 14px 0;
  padding: 10px 10px 2px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 38%, var(--border));
  border-radius: 16px;
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 4%, var(--surface));
}
.exclusive-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 4px 10px;
  border-bottom: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 25%, var(--border));
}
.exclusive-group__title { display: flex; align-items: center; gap: 7px; color: rgb(var(--v-theme-primary)); font-size: .86rem; font-weight: 800; }
.exclusive-group__sections { display: grid; gap: 2px; }
@media (max-width: 600px) {
  .exclusive-group { margin: 12px 0; padding: 8px 7px 1px; }
  .exclusive-group__header { align-items: flex-start; }
}
</style>
