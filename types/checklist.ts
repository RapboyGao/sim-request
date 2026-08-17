export type ChecklistSource = 'builtin' | 'custom'

export type ChecklistItem = {
  id: string
  title: string
  description: string
  isEmphasized: boolean
  expiresAfterHours: number | null
}

export type ChecklistSectionCompletion = 'all' | 'exclusive'

export type ChecklistSection = {
  id: string
  title: string
  description: string
  completion: ChecklistSectionCompletion
  exclusiveGroupName?: string
  items: ChecklistItem[]
}

export type ChecklistNote = {
  id: string
  title: string
  paragraphs: string[]
  bullets: string[]
}

export type Checklist = {
  id: string
  title: string
  description: string
  icon?: string
  source: ChecklistSource
  sections: ChecklistSection[]
  notes: ChecklistNote[]
  sourceMarkdown?: string
}

export type ChecklistStatus = Record<string, string | null>

export type StoredCustomChecklists = {
  version: 2
  checklists: Checklist[]
}

export type ChecklistBackup = {
  version: 2
  exportedAt: string
  checklists: Checklist[]
  status: ChecklistStatus
}
