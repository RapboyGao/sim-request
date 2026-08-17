import { useStorage } from '@vueuse/core'
import type { Checklist, ChecklistBackup, ChecklistStatus, StoredCustomChecklists } from '~/types/checklist'
import { cloneChecklist, normalizeChecklist, removeDeletedItemStatuses, removeChecklistStatus, resetChecklistStatus, setSectionStatus, setChecklistSectionStatus, toggleChecklistItemStatus, toggleStatus, validateBackup, validateCustomChecklists } from '~/utils/checklists'

function copy<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }
function newId(prefix: string) {
  const uuid = import.meta.client && typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${uuid}`
}
function normalizeFavoriteIds(value: unknown) { return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : [] }

export function useChecklists(options: { builtins?: MaybeRef<Checklist[]> } = {}) {
  const builtinChecklists = computed(() => toValue(options.builtins) || [])
  const storedCustom = useStorage<StoredCustomChecklists>('public-checklists-v2', { version: 2, checklists: [] }, undefined, { mergeDefaults: true })
  const storedStatus = useStorage<ChecklistStatus>('public-checklist-status-v2', {})
  const storedFavorites = useStorage<string[]>('public-checklist-favorites-v2', [])
  const custom = useState<Checklist[]>('public-checklists-custom-checklists', () => {
    const valid = validateCustomChecklists(storedCustom.value)
    return valid ? copy(valid.map(normalizeChecklist)) : []
  })
  const status = useState<ChecklistStatus>('public-checklists-status', () => copy(storedStatus.value))
  const favorites = useState<string[]>('public-checklists-favorites', () => normalizeFavoriteIds(storedFavorites.value))

  if (import.meta.client) {
    watch(custom, (value) => { storedCustom.value = { version: 2, checklists: copy(value) } }, { deep: true })
    watch(status, (value) => { storedStatus.value = copy(value) }, { deep: true })
    watch(favorites, (value) => { storedFavorites.value = normalizeFavoriteIds(value) }, { deep: true })
  }

  const allChecklists = computed(() => [...builtinChecklists.value, ...custom.value])
  function addChecklist(title = '新检查单') {
    const id = newId('custom-checklist')
    custom.value = [...custom.value, { id, title, description: '', source: 'custom', sections: [{ id: `${id}-section-1`, title: '未命名分组', description: '', completion: 'all', items: [] }], notes: [] }]
    return id
  }
  function updateChecklist(next: Checklist) {
    if (next.source !== 'custom') return
    const previous = custom.value.find((item) => item.id === next.id)
    if (!previous) return
    custom.value = custom.value.map((item) => item.id === next.id ? copy(normalizeChecklist(next)) : item)
    status.value = removeDeletedItemStatuses(status.value, previous, next)
  }
  function deleteChecklist(id: string) {
    const target = custom.value.find((item) => item.id === id)
    if (!target) return
    custom.value = custom.value.filter((item) => item.id !== id)
    status.value = removeChecklistStatus(status.value, target)
    favorites.value = favorites.value.filter((favoriteId) => favoriteId !== id)
  }
  function duplicateChecklist(id: string) {
    const target = custom.value.find((item) => item.id === id)
    if (!target) return ''
    const copyId = newId('custom-checklist')
    custom.value = [...custom.value, cloneChecklist(target, copyId, `${target.title} 副本`)]
    return copyId
  }
  function toggleItem(itemId: string, checklist?: Checklist) { status.value = checklist ? toggleChecklistItemStatus(status.value, checklist, itemId) : toggleStatus(status.value, itemId) }
  function resetChecklist(checklist: Checklist) { status.value = resetChecklistStatus(status.value, checklist) }
  function setSection(section: Checklist['sections'][number], checked: boolean, checklist?: Checklist) { status.value = checklist ? setChecklistSectionStatus(status.value, checklist, section, checked) : setSectionStatus(status.value, section, checked) }
  function replaceCustomChecklists(checklists: Checklist[], importedStatus: ChecklistStatus = {}) {
    custom.value = copy(checklists.map(normalizeChecklist))
    const validIds = new Set([...builtinChecklists.value, ...custom.value].map((checklist) => checklist.id))
    favorites.value = favorites.value.filter((id) => validIds.has(id))
    const builtinItemIds = new Set(builtinChecklists.value.flatMap((checklist) => checklist.sections.flatMap((section) => section.items.map((item) => item.id))))
    const nextStatus = Object.fromEntries(Object.entries(status.value).filter(([id]) => builtinItemIds.has(id))) as ChecklistStatus
    for (const checklist of custom.value) for (const section of checklist.sections) for (const item of section.items) nextStatus[item.id] = importedStatus[item.id] || null
    status.value = nextStatus
  }
  function toggleFavorite(id: string) {
    if (!allChecklists.value.some((checklist) => checklist.id === id)) return
    favorites.value = favorites.value.includes(id) ? favorites.value.filter((favoriteId) => favoriteId !== id) : [...favorites.value, id]
  }
  function createBackup(): ChecklistBackup {
    const customIds = new Set(custom.value.flatMap((checklist) => checklist.sections.flatMap((section) => section.items.map((item) => item.id))))
    return { version: 2, exportedAt: new Date().toISOString(), checklists: copy(custom.value), status: Object.fromEntries(Object.entries(status.value).filter(([id]) => customIds.has(id))) }
  }
  function importBackup(value: unknown) { const backup = validateBackup(value); if (!backup) return false; replaceCustomChecklists(backup.checklists, backup.status); return true }
  return { builtinChecklists, customChecklists: custom, allChecklists, status, favorites, addChecklist, updateChecklist, deleteChecklist, duplicateChecklist, toggleFavorite, toggleItem, setSection, resetChecklist, createBackup, importBackup }
}
