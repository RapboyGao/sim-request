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

  it('keeps the first-leg and turnaround checklist differences aligned', () => {
    const checklists = publicBuiltinChecklists('zh-CN')
    const firstLeg = checklists.find((checklist) => checklist.id === 'first-leg')!
    const turnaround = checklists.find((checklist) => checklist.id === 'turnaround')!
    const firstLegBeforeStart = firstLeg.sections.find((section) => section.id.endsWith('.before-start'))!
    const firstLegDocuments = firstLeg.sections.find((section) => section.id.endsWith('.documents'))!
    const turnaroundDeplaning = turnaround.sections.find((section) => section.id.endsWith('.deplaning'))!
    const turnaroundBeforeStart = turnaround.sections.find((section) => section.id.endsWith('.before-start'))!
    const turnaroundDocuments = turnaround.sections.find((section) => section.id.endsWith('.documents'))!
    const sunglasses = firstLegBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))!

    expect(turnaroundDeplaning.items.map((item) => item.title)).toContain('单发滑行')
    expect(firstLegBeforeStart.items.map((item) => item.title)).not.toContain('配平 ...... 起飞配平')
    expect(turnaroundBeforeStart.items.map((item) => item.title)).not.toContain('配平 ...... 起飞配平')
    expect(firstLegBeforeStart.items.map((item) => item.title)).toContain('配平 ...... 起飞配平，绿区')
    expect(firstLegBeforeStart.items.map((item) => item.title)).toContain('墨镜/屏幕亮度')
    expect(turnaroundBeforeStart.items.map((item) => item.title)).toContain('墨镜/屏幕亮度')
    expect(sunglasses.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(turnaroundBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))?.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.logbook-pages')
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.clb-location')
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.logbook-pages')
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.clb-location')
    expect(firstLegBeforeStart.items.find((item) => item.id.endsWith('.transition-altitude'))?.title).toBe('CDU中的Transition Altitude')
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
