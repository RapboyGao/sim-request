import type { Checklist, ChecklistItem, ChecklistSection, ChecklistStatus } from '~/types/checklist'

export const DEFAULT_EXPIRY_HOURS = 6

export function checklistSections(checklist: Checklist) {
  return checklist.sections
}

export function checklistItems(checklist: Checklist): ChecklistItem[] {
  return checklist.sections.flatMap((section) => section.items)
}

export function checkedAtFor(status: ChecklistStatus, itemId: string) {
  return status[itemId] || null
}

export function isItemExpired(item: ChecklistItem, checkedAt: string | null, now = Date.now()) {
  if (!checkedAt || item.expiresAfterHours === null) return false
  const timestamp = Date.parse(checkedAt)
  if (!Number.isFinite(timestamp)) return false
  return timestamp + item.expiresAfterHours * 60 * 60 * 1000 < now
}

export function checklistStats(checklist: Checklist, status: ChecklistStatus, now = Date.now()) {
  const items = checklistItems(checklist)
  const checked = items.filter((item) => Boolean(checkedAtFor(status, item.id))).length
  const expired = items.filter((item) => isItemExpired(item, checkedAtFor(status, item.id), now)).length
  return {
    checked,
    total: items.length,
    expired,
    progress: items.length ? checked / items.length : 0,
    complete: items.length > 0 && checked === items.length,
  }
}

export type ChecklistCompletionStatus = 'complete' | 'partial' | 'idle'

export function checklistCompletionStatus(checklist: Checklist, status: ChecklistStatus): ChecklistCompletionStatus {
  const stats = checklistStats(checklist, status)
  if (stats.complete) return 'complete'
  if (stats.checked > 0) return 'partial'
  return 'idle'
}

export function sortChecklistsByFavorite(checklists: Checklist[], favorites: string[]) {
  const favoriteIds = new Set(favorites)
  return [...checklists].sort((a, b) => Number(favoriteIds.has(b.id)) - Number(favoriteIds.has(a.id)))
}

export function sectionStats(section: ChecklistSection, status: ChecklistStatus, now = Date.now()) {
  const checked = section.items.filter((item) => Boolean(checkedAtFor(status, item.id))).length
  const expired = section.items.filter((item) => isItemExpired(item, checkedAtFor(status, item.id), now)).length
  return {
    checked,
    total: section.items.length,
    expired,
    progress: section.items.length ? checked / section.items.length : 0,
    complete: section.items.length > 0 && checked === section.items.length,
  }
}

export function toggleStatus(status: ChecklistStatus, itemId: string, now = new Date()) {
  return {
    ...status,
    [itemId]: status[itemId] ? null : now.toISOString(),
  }
}

export function setSectionStatus(status: ChecklistStatus, section: ChecklistSection, checked: boolean, now = new Date()) {
  const next = { ...status }
  for (const item of section.items) {
    next[item.id] = checked ? now.toISOString() : null
  }
  return next
}

export function resetChecklistStatus(status: ChecklistStatus, checklist: Checklist) {
  const next = { ...status }
  for (const item of checklistItems(checklist)) next[item.id] = null
  return next
}

export function removeChecklistStatus(status: ChecklistStatus, checklist: Checklist) {
  const next = { ...status }
  for (const item of checklistItems(checklist)) delete next[item.id]
  return next
}

export function removeDeletedItemStatuses(status: ChecklistStatus, previous: Checklist, nextChecklist: Checklist) {
  const next = { ...status }
  const nextItemIds = new Set(checklistItems(nextChecklist).map((item) => item.id))
  for (const item of checklistItems(previous)) {
    if (!nextItemIds.has(item.id)) delete next[item.id]
  }
  return next
}

export function cloneChecklist(checklist: Checklist, id: string, title = checklist.title) {
  return {
    ...structuredClone(checklist),
    id,
    title,
    source: 'custom' as const,
    sections: checklist.sections.map((section, sectionIndex) => ({
      ...section,
      id: `${id}-section-${sectionIndex + 1}`,
      items: section.items.map((item, itemIndex) => ({
        ...item,
        id: `${id}-section-${sectionIndex + 1}-item-${itemIndex + 1}`,
      })),
    })),
  }
}

export function validateCustomChecklists(value: unknown): Checklist[] | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as { version?: unknown; checklists?: unknown }
  if (candidate.version !== 1 || !Array.isArray(candidate.checklists)) return null
  if (!candidate.checklists.every((checklist) => isValidChecklist(checklist, 'custom'))) return null
  return candidate.checklists as Checklist[]
}

export function validateBackup(value: unknown): { checklists: Checklist[]; status: ChecklistStatus } | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as { version?: unknown; checklists?: unknown; status?: unknown }
  if (candidate.version !== 1 || !Array.isArray(candidate.checklists) || !isStatus(candidate.status)) return null
  if (!candidate.checklists.every((checklist) => isValidChecklist(checklist, 'custom'))) return null
  return {
    checklists: candidate.checklists as Checklist[],
    status: candidate.status as ChecklistStatus,
  }
}

function isValidChecklist(value: unknown, source: 'builtin' | 'custom') {
  if (!value || typeof value !== 'object') return false
  const checklist = value as Partial<Checklist>
  return typeof checklist.id === 'string'
    && typeof checklist.title === 'string'
    && typeof checklist.description === 'string'
    && checklist.source === source
    && Array.isArray(checklist.sections)
    && checklist.sections.every(isValidSection)
    && Array.isArray(checklist.notes)
}

function isValidSection(value: unknown) {
  if (!value || typeof value !== 'object') return false
  const section = value as Partial<ChecklistSection>
  return typeof section.id === 'string'
    && typeof section.title === 'string'
    && Array.isArray(section.items)
    && section.items.every(isValidItem)
}

function isValidItem(value: unknown) {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ChecklistItem>
  return typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.detail === 'string'
    && (item.expiresAfterHours === null || typeof item.expiresAfterHours === 'number')
}

function isStatus(value: unknown): value is ChecklistStatus {
  if (!value || typeof value !== 'object') return false
  return Object.values(value).every((timestamp) => timestamp === null || typeof timestamp === 'string')
}
