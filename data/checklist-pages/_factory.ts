import type { Checklist, ChecklistNote, ChecklistSection } from '../../types/checklist'
import { DEFAULT_EXPIRY_HOURS } from '../../utils/checklists'

type GroupInput = [string, string[]]

export function createBuiltinChecklist(
  id: string,
  title: string,
  description: string,
  groups: GroupInput[],
  sourceMarkdown: string,
  notes: ChecklistNote[] = [],
): Checklist {
  return {
    id,
    title,
    description,
    source: 'builtin',
    sections: groups.map(([sectionTitle, items], sectionIndex) => {
      const sectionId = `${id}-section-${sectionIndex + 1}`
      const section: ChecklistSection = {
        id: sectionId,
        title: sectionTitle,
        detail: '',
        completion: 'all',
        items: items.map((itemTitle, itemIndex) => ({
          id: `${sectionId}-item-${itemIndex + 1}`,
          title: itemTitle,
          detail: '',
          expiresAfterHours: DEFAULT_EXPIRY_HOURS,
        })),
      }
      return section
    }),
    notes,
    sourceMarkdown,
  }
}
