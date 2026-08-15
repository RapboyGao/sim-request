import type { Checklist, ChecklistItem, ChecklistSection, ChecklistStatus } from '~/types/checklist'

export const DEFAULT_EXPIRY_HOURS = 6

export function checklistSections(checklist: Checklist) {
  return checklist.sections
}

export function checklistItems(checklist: Checklist): ChecklistItem[] {
  return checklist.sections.flatMap((section) => section.items)
}

export function normalizeChecklist(checklist: Checklist): Checklist {
  const normalized: Checklist = {
    id: checklist.id,
    title: checklist.title,
    description: checklist.description,
    source: checklist.source,
    sections: checklist.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      completion: section.completion,
      ...(section.exclusiveGroupName === undefined ? {} : { exclusiveGroupName: section.exclusiveGroupName }),
      items: section.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isEmphasized: item.isEmphasized,
        expiresAfterHours: item.expiresAfterHours,
      })),
    })),
    notes: checklist.notes,
    ...(checklist.sourceMarkdown ? { sourceMarkdown: checklist.sourceMarkdown } : {}),
  }

  for (const group of exclusiveSectionGroups(normalized)) {
    const name = group.find((section) => section.exclusiveGroupName?.trim())?.exclusiveGroupName?.trim() || ''
    for (const section of group) section.exclusiveGroupName = name
  }
  return normalized
}

export function exclusiveSectionGroups(checklist: Checklist): ChecklistSection[][] {
  const groups: ChecklistSection[][] = []
  let current: ChecklistSection[] = []
  let currentPhase: string | null = null
  for (const section of checklist.sections) {
    if (section.completion === 'exclusive') {
      // Numbered aviation branches such as 3a/3b and 4a/4b are separate
      // choice groups even though their sections are adjacent in the source.
      const phase = section.title.match(/^\s*(\d+)[a-z]?\s*[.)\-:]?\s/i)?.[1] || null
      if (current.length && phase && currentPhase && phase !== currentPhase) {
        groups.push(current)
        current = []
      }
      current.push(section)
      currentPhase = phase || currentPhase
      continue
    }
    if (current.length) groups.push(current)
    current = []
    currentPhase = null
  }
  if (current.length) groups.push(current)
  return groups
}

export function exclusiveGroupName(group: ChecklistSection[], fallback = '') {
  return group.find((section) => section.exclusiveGroupName?.trim())?.exclusiveGroupName?.trim() || fallback
}

export function exclusiveSectionDisabled(checklist: Checklist, status: ChecklistStatus, section: ChecklistSection) {
  const group = exclusiveSectionGroups(checklist).find((candidate) => candidate.includes(section))
  if (!group || section.items.some((item) => Boolean(status[item.id]))) return false
  return group.some((candidate) => candidate !== section && candidate.items.some((item) => Boolean(status[item.id])))
}

function sectionGroupForItem(checklist: Checklist, itemId: string) {
  return exclusiveSectionGroups(checklist).find((group) => group.some((section) => section.items.some((item) => item.id === itemId)))
}

function sectionForItem(checklist: Checklist, itemId: string) {
  return checklist.sections.find((section) => section.items.some((item) => item.id === itemId))
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
  const exclusiveGroups = exclusiveSectionGroups(checklist)
  const exclusiveSections = new Set(exclusiveGroups.flat())
  const regularSections = checklist.sections.filter((section) => !exclusiveSections.has(section))
  const completedUnits = regularSections.filter((section) => sectionStats(section, status, now).complete).length
    + exclusiveGroups.filter((group) => group.some((section) => sectionStats(section, status, now).complete)).length
  const totalUnits = regularSections.length + exclusiveGroups.length
  return {
    checked,
    total: items.length,
    expired,
    progress: totalUnits ? completedUnits / totalUnits : 0,
    complete: totalUnits > 0 && completedUnits === totalUnits,
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

export function toggleChecklistItemStatus(status: ChecklistStatus, checklist: Checklist, itemId: string, now = new Date()) {
  const next = toggleStatus(status, itemId, now)
  if (!next[itemId]) return next
  const group = sectionGroupForItem(checklist, itemId)
  const targetSection = sectionForItem(checklist, itemId)
  if (!group || !targetSection) return next
  for (const section of group) {
    if (section === targetSection) continue
    for (const item of section.items) next[item.id] = null
  }
  return next
}

export function setChecklistSectionStatus(status: ChecklistStatus, checklist: Checklist, section: ChecklistSection, checked: boolean, now = new Date()) {
  const next = { ...status }
  if (checked) {
    const group = exclusiveSectionGroups(checklist).find((candidate) => candidate.includes(section))
    if (group) {
      for (const other of group) {
        if (other === section) continue
        for (const item of other.items) next[item.id] = null
      }
    }
  }
  return setSectionStatus(next, section, checked, now)
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
  if (candidate.version !== 2 || !Array.isArray(candidate.checklists)) return null
  if (!candidate.checklists.every((checklist) => isValidChecklist(checklist, 'custom'))) return null
  if (!(candidate.checklists as Checklist[]).every(hasUniqueItemIds)) return null
  return (candidate.checklists as Checklist[]).map(normalizeChecklist)
}

export function validateBackup(value: unknown): { checklists: Checklist[]; status: ChecklistStatus } | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as { version?: unknown; checklists?: unknown; status?: unknown }
  if (candidate.version !== 2 || !Array.isArray(candidate.checklists) || !isStatus(candidate.status)) return null
  if (!candidate.checklists.every((checklist) => isValidChecklist(checklist, 'custom'))) return null
  if (!(candidate.checklists as Checklist[]).every(hasUniqueItemIds)) return null
  return {
    checklists: (candidate.checklists as Checklist[]).map(normalizeChecklist),
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
    && section.id.trim().length > 0
    && typeof section.title === 'string'
    && typeof section.description === 'string'
    && (section.completion === 'all' || section.completion === 'exclusive')
    && (section.exclusiveGroupName === undefined || typeof section.exclusiveGroupName === 'string')
    && Array.isArray(section.items)
    && section.items.every(isValidItem)
}

function isValidItem(value: unknown) {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ChecklistItem>
  return typeof item.id === 'string'
    && item.id.trim().length > 0
    && typeof item.title === 'string'
    && typeof item.description === 'string'
    && typeof item.isEmphasized === 'boolean'
    && (item.expiresAfterHours === null || (typeof item.expiresAfterHours === 'number' && Number.isFinite(item.expiresAfterHours)))
}

function hasUniqueItemIds(checklist: Checklist) {
  const ids = checklist.sections.flatMap((section) => section.items.map((item) => item.id))
  return ids.every((id, index) => id.trim().length > 0 && ids.indexOf(id) === index)
}

function isStatus(value: unknown): value is ChecklistStatus {
  if (!value || typeof value !== 'object') return false
  return Object.values(value).every((timestamp) => timestamp === null || typeof timestamp === 'string')
}
