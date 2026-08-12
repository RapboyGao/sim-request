import { useStorage } from '@vueuse/core'
import { builtinChecklists } from '~/data/checklists'
import type { Checklist, ChecklistBackup, ChecklistStatus, StoredCustomChecklists } from '~/types/checklist'
import {
  cloneChecklist,
  removeDeletedItemStatuses,
  removeChecklistStatus,
  resetChecklistStatus,
  setSectionStatus,
  toggleStatus,
  validateBackup,
  validateCustomChecklists,
} from '~/utils/checklists'

const CUSTOM_STORAGE_KEY = 'private-checklists-v1'
const STATUS_STORAGE_KEY = 'private-checklist-status-v1'
const FAVORITES_STORAGE_KEY = 'private-checklist-favorites-v1'

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function newId(prefix: string) {
  const uuid = import.meta.client && typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${uuid}`
}

function normalizeFavoriteIds(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string'))]
}

export function useChecklists() {
  const storedCustom = useStorage<StoredCustomChecklists>(CUSTOM_STORAGE_KEY, { version: 1, checklists: [] }, undefined, {
    mergeDefaults: true,
  })
  const storedStatus = useStorage<ChecklistStatus>(STATUS_STORAGE_KEY, {})
  const storedFavorites = useStorage<string[]>(FAVORITES_STORAGE_KEY, [])
  const custom = useState<Checklist[]>('checklists-custom-checklists', () => {
    const valid = validateCustomChecklists(storedCustom.value)
    return valid ? copy(valid) : []
  })
  const status = useState<ChecklistStatus>('checklists-status', () => copy(storedStatus.value))
  const favorites = useState<string[]>('checklists-favorites', () => normalizeFavoriteIds(storedFavorites.value))

  if (import.meta.client) {
    watch(custom, (value) => {
      storedCustom.value = { version: 1, checklists: copy(value) }
    }, { deep: true })
    watch(status, (value) => {
      storedStatus.value = copy(value)
    }, { deep: true })
    watch(favorites, (value) => {
      storedFavorites.value = normalizeFavoriteIds(value)
    }, { deep: true })
  }

  const allChecklists = computed(() => [...builtinChecklists, ...custom.value])

  function addChecklist(title = '新检查单') {
    const id = newId('custom-checklist')
    custom.value = [...custom.value, {
      id,
      title,
      description: '',
      source: 'custom',
      sections: [{
        id: `${id}-section-1`,
        title: '未命名分组',
        items: [],
      }],
      notes: [],
    }]
    return id
  }

  function updateChecklist(next: Checklist) {
    if (next.source !== 'custom') return
    const previous = custom.value.find((item) => item.id === next.id)
    if (!previous) return
    custom.value = custom.value.map((item) => item.id === next.id ? copy(next) : item)
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
    const duplicate = cloneChecklist(target, copyId, `${target.title} 副本`)
    custom.value = [...custom.value, duplicate]
    return copyId
  }

  function toggleItem(itemId: string) {
    status.value = toggleStatus(status.value, itemId)
  }

  function resetChecklist(checklist: Checklist) {
    status.value = resetChecklistStatus(status.value, checklist)
  }

  function setSection(section: Checklist['sections'][number], checked: boolean) {
    status.value = setSectionStatus(status.value, section, checked)
  }

  function replaceCustomChecklists(checklists: Checklist[], importedStatus: ChecklistStatus = {}) {
    custom.value = copy(checklists)
    const validFavoriteIds = new Set([...builtinChecklists, ...checklists].map((checklist) => checklist.id))
    favorites.value = favorites.value.filter((id) => validFavoriteIds.has(id))
    const builtinItemIds = new Set(builtinChecklists.flatMap((checklist) => checklist.sections.flatMap((section) => section.items.map((item) => item.id))))
    const nextStatus = Object.fromEntries(Object.entries(status.value).filter(([id]) => builtinItemIds.has(id))) as ChecklistStatus
    for (const checklist of checklists) {
      for (const section of checklist.sections) {
        for (const item of section.items) nextStatus[item.id] = importedStatus[item.id] || null
      }
    }
    status.value = nextStatus
  }

  function toggleFavorite(id: string) {
    if (!allChecklists.value.some((checklist) => checklist.id === id)) return
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter((favoriteId) => favoriteId !== id)
      : [...favorites.value, id]
  }

  function createBackup(): ChecklistBackup {
    const customIds = new Set(custom.value.flatMap((checklist) => checklist.sections.flatMap((section) => section.items.map((item) => item.id))))
    const customStatus = Object.fromEntries(Object.entries(status.value).filter(([id]) => customIds.has(id)))
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      checklists: copy(custom.value),
      status: customStatus,
    }
  }

  function importBackup(value: unknown) {
    const backup = validateBackup(value)
    if (!backup) return false
    replaceCustomChecklists(backup.checklists, backup.status)
    return true
  }

  return {
    builtinChecklists,
    customChecklists: custom,
    allChecklists,
    status,
    favorites,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    duplicateChecklist,
    toggleFavorite,
    toggleItem,
    setSection,
    resetChecklist,
    createBackup,
    importBackup,
  }
}
