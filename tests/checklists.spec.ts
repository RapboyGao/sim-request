import { describe, expect, it } from 'vitest'
import { publicBuiltinChecklists } from '../data/public-checklists'
import { publicDeicingChecklist } from '../data/public-deicing'
import { publicChecklistRoute, publicChecklistsHomeRoute, publicCustomChecklistEditRoute, publicCustomChecklistRoute } from '../utils/checklist-routes'
import { checklistCompletionStatus, checklistStats, exclusiveSectionGroups, normalizeChecklist, toggleChecklistItemStatus } from '../utils/checklists'

describe('public checklist catalog', () => {
  it('contains only the public built-in checklists', () => {
    expect(publicBuiltinChecklists('zh-CN').map((item) => item.id)).toEqual(['deicing', 'no-engine-bleed-takeoff', 'preflight', 'first-leg', 'turnaround'])
    expect(publicBuiltinChecklists('zh-CN').every((item) => item.sections.length > 0)).toBe(true)
  })

  it('keeps public deicing content localized and mutually exclusive', () => {
    const checklist = publicDeicingChecklist('zh-CN').checklist
    expect(checklist.sections).toHaveLength(4)
    expect(checklist.sections[0]?.items.map((item) => item.title)).toContain('发电机 ...... ON')
    expect(exclusiveSectionGroups(checklist)).toHaveLength(1)
    expect(publicDeicingChecklist('en').checklist.sections.flatMap((section) => section.items).length).toBe(checklist.sections.flatMap((section) => section.items).length)
  })

  it('keeps stable canonical item fields', () => {
    for (const checklist of publicBuiltinChecklists('zh-CN')) {
      const ids = checklist.sections.flatMap((section) => section.items.map((item) => item.id))
      expect(new Set(ids).size).toBe(ids.length)
      expect(checklist.sections.every((section) => section.items.every((item) => typeof item.description === 'string' && typeof item.isEmphasized === 'boolean'))).toBe(true)
    }
  })
})

describe('public checklist routes and behavior', () => {
  it('uses public checklist routes without private password paths', () => {
    expect(publicChecklistsHomeRoute()).toBe('/checklists/')
    expect(publicChecklistRoute('deicing')).toBe('/checklists/deicing')
    expect(publicCustomChecklistRoute('custom-1')).toBe('/checklists/custom/custom-1')
    expect(publicCustomChecklistEditRoute('custom-1')).toBe('/checklists/custom/custom-1/edit')
    expect(publicChecklistRoute('deicing')).not.toContain('private')
  })

  it('calculates completion and preserves exclusive selection behavior', () => {
    const checklist = normalizeChecklist({
      id: 'exclusive', title: 'Exclusive', description: '', source: 'custom', notes: [],
      sections: [
        { id: 'a', title: 'A', description: '', completion: 'exclusive', items: [{ id: 'a-item', title: 'A', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'b', title: 'B', description: '', completion: 'exclusive', items: [{ id: 'b-item', title: 'B', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
      ],
    })
    expect(exclusiveSectionGroups(checklist)).toHaveLength(1)
    expect(toggleChecklistItemStatus({ 'a-item': 'old', 'b-item': null }, checklist, 'b-item')).toMatchObject({ 'a-item': null })
    const publicChecklist = publicBuiltinChecklists('zh-CN')[0]!
    expect(checklistCompletionStatus(publicChecklist, {})).toBe('idle')
    expect(checklistStats(publicChecklist, {}).checked).toBe(0)
  })
})
