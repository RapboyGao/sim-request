import type { Checklist, ChecklistItem, ChecklistNote, ChecklistSection, ChecklistSectionCompletion } from '../types/checklist'
import { DEFAULT_EXPIRY_HOURS } from '../utils/checklists'

export type BuiltinItemInput = {
  id: string
  title: string
  description?: string
  isEmphasized?: boolean
  expiresAfterHours?: number | null
}

export type BuiltinSectionInput = {
  id: string
  title: string
  description?: string
  completion?: ChecklistSectionCompletion
  exclusiveGroupName?: string
  items: BuiltinItemInput[]
}

export function createBuiltinChecklist(
  id: string,
  title: string,
  description: string,
  sections: BuiltinSectionInput[],
  notes: ChecklistNote[] = [],
): Checklist {
  return {
    id,
    title,
    description,
    source: 'builtin',
    sections: sections.map((input): ChecklistSection => ({
      id: input.id,
      title: input.title,
      description: input.description || '',
      completion: input.completion || 'all',
      exclusiveGroupName: input.exclusiveGroupName || '',
      items: input.items.map((item): ChecklistItem => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        isEmphasized: item.isEmphasized === true,
        expiresAfterHours: item.expiresAfterHours === undefined ? DEFAULT_EXPIRY_HOURS : item.expiresAfterHours,
      })),
    })),
    notes,
  }
}
