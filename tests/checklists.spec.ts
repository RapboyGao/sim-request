import { describe, expect, it } from 'vitest'
import { publicBuiltinChecklists } from '../data/public-checklists'
import { publicDeicingChecklist } from '../data/public-deicing'
import { publicChecklistRoute, publicChecklistsHomeRoute, publicCustomChecklistEditRoute, publicCustomChecklistRoute } from '../utils/checklist-routes'
import { checklistCompletionStatus, checklistStats, cloneChecklist, exclusiveSectionGroups, normalizeChecklist, toggleChecklistItemStatus } from '../utils/checklists'

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
    const firstLegCockpit = firstLeg.sections.find((section) => section.id.endsWith('.cockpit'))!
    const firstLegCdu = firstLeg.sections.find((section) => section.id.endsWith('.cdu'))!
    const firstLegDocuments = firstLeg.sections.find((section) => section.id.endsWith('.documents'))!
    const turnaroundDeplaning = turnaround.sections.find((section) => section.id.endsWith('.deplaning'))!
    const turnaroundBeforeStart = turnaround.sections.find((section) => section.id.endsWith('.before-start'))!
    const turnaroundCdu = turnaround.sections.find((section) => section.id.endsWith('.cdu'))!
    const turnaroundDocuments = turnaround.sections.find((section) => section.id.endsWith('.documents'))!
    const sunglasses = firstLegBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))!
    const windshieldWipers = firstLegCockpit.items.find((item) => item.id.endsWith('.windshield-wipers'))!
    const headset = firstLegCockpit.items.find((item) => item.id.endsWith('.headset-and-microphone'))!

    expect(turnaroundDeplaning.items.map((item) => item.title)).toContain('单发滑行')
    expect(firstLegBeforeStart.items.map((item) => item.title)).not.toContain('配平 ...... 起飞配平')
    expect(turnaroundBeforeStart.items.map((item) => item.title)).not.toContain('配平 ...... 起飞配平')
    expect(firstLegBeforeStart.items.map((item) => item.title)).toContain('配平 ...... 起飞配平，绿区')
    expect(firstLegBeforeStart.items.map((item) => item.title)).toContain('墨镜/屏幕亮度')
    expect(firstLegCockpit.items.map((item) => item.title)).toContain('屏幕和操纵 ...... 按需清洁')
    expect(firstLegCockpit.items.at(-1)?.title).toBe('屏幕和操纵 ...... 按需清洁')
    expect(firstLegCockpit.items.map((item) => item.title)).toContain('Defferd Defects')
    expect(firstLegCockpit.items.map((item) => item.title)).toContain('驾驶舱准备')
    expect(firstLegCockpit.items.map((item) => item.title)).not.toContain('驾驶舱准备 ...... 已检查')
    expect(turnaround.sections.find((section) => section.id.endsWith('.turnaround-cockpit'))?.items.map((item) => item.title)).toContain('驾驶舱准备')
    expect(turnaround.sections.find((section) => section.id.endsWith('.turnaround-cockpit'))?.items.map((item) => item.title)).not.toContain('驾驶舱准备 ...... 检查')
    expect(firstLegCockpit.items.indexOf(windshieldWipers)).toBeLessThan(firstLegCockpit.items.indexOf(headset))
    expect(windshieldWipers.title).toBe('风挡/雨刷 ...... 检查')
    expect(windshieldWipers.description).toBe('如果没有降水，则执行以下步骤：\n1. 在插入耳机前检查风挡雨刷，以防关闭风挡时夹到耳机线。\n2. 打开风挡，并确认飞机下方无人。\n3. 倒水，检查雨刷能否达到满意的清洁效果。\n4. 检查风挡框无夹杂物，尤其要从下向上观察。\n5. 关闭并锁好风挡。')
    expect(firstLegCdu.items.findIndex((item) => item.title === '航路 ...... 检查')).toBeGreaterThan(firstLegCdu.items.findIndex((item) => item.title === '目的地四字码 ...... 检查'))
    expect(turnaroundCdu.items.findIndex((item) => item.title === '航路 ...... 检查')).toBeGreaterThan(turnaroundCdu.items.findIndex((item) => item.title === '目的地四字码 ...... 检查'))
    expect(turnaroundBeforeStart.items.map((item) => item.title)).toContain('墨镜/屏幕亮度')
    expect(sunglasses.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(turnaroundBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))?.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.logbook-pages')
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.clb-location')
    expect(firstLegDocuments.description).toBe('Documents 检查可与下方的“起动前”检查单同时进行。')
    expect(turnaroundDocuments.description).toBe('Documents 检查可与下方的“起动前”检查单同时进行。')
    expect(firstLeg.description).toMatch(/^无需执行的项目也要勾选（例如修正海压机场的QFE）。/)
    expect(turnaround.description).toMatch(/^无需执行的项目也要勾选（例如修正海压机场的QFE）。/)
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.logbook-pages')
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.clb-location')
    expect(firstLegBeforeStart.items.find((item) => item.id.endsWith('.transition-altitude'))?.title).toBe('CDU中的Transition Altitude')
  })

  it('clones a checklist as custom content with fresh IDs for every entity', () => {
    const source = structuredClone(publicBuiltinChecklists('zh-CN')[0]!)
    source.notes = [{ id: 'builtin-note', title: 'Note', paragraphs: ['Text'], bullets: [] }]
    let sequence = 0
    const createId = (prefix: string) => `${prefix}-random-${++sequence}`
    const collectIds = (checklist: typeof source) => [
      checklist.id,
      ...checklist.sections.flatMap((section) => [section.id, ...section.items.map((item) => item.id)]),
      ...checklist.notes.map((note) => note.id),
    ]

    const first = cloneChecklist(source, createId, `${source.title} 副本`)
    const second = cloneChecklist(source, createId, `${source.title} 副本`)
    const sourceIds = new Set(collectIds(source))
    const clonedIds = [...collectIds(first), ...collectIds(second)]

    expect(first.source).toBe('custom')
    expect(first.title).toBe(`${source.title} 副本`)
    expect(Object.keys(first).some((key) => key.endsWith('Markdown'))).toBe(false)
    expect(new Set(clonedIds).size).toBe(clonedIds.length)
    expect(clonedIds.every((id) => !sourceIds.has(id))).toBe(true)
    expect(first.notes[0]?.id).not.toBe(source.notes[0]?.id)
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
