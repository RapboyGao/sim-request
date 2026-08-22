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
    const firstLegThirdPosition = firstLeg.sections.find((section) => section.id.endsWith('.third-position'))!
    const firstLegCockpit = firstLeg.sections.find((section) => section.id.endsWith('.cockpit'))!
    const firstLegCdu = firstLeg.sections.find((section) => section.id.endsWith('.cdu'))!
    const firstLegDocuments = firstLeg.sections.find((section) => section.id.endsWith('.documents'))!
    const firstLegBeforeBrakeRelease = firstLeg.sections.find((section) => section.id.endsWith('.before-brake-release'))!
    const firstLegBeforeStartSwitchesGrd = firstLeg.sections.find((section) => section.id.endsWith('.before-start-switches-grd'))!
    const firstLegBeforeRunway = firstLeg.sections.find((section) => section.id.endsWith('.before-runway'))!
    const turnaroundBeforeBrakeRelease = turnaround.sections.find((section) => section.id.endsWith('.before-brake-release'))!
    const turnaroundBeforeStartSwitchesGrd = turnaround.sections.find((section) => section.id.endsWith('.before-start-switches-grd'))!
    const turnaroundDeplaning = turnaround.sections.find((section) => section.id.endsWith('.deplaning'))!
    const turnaroundBeforeStart = turnaround.sections.find((section) => section.id.endsWith('.before-start'))!
    const turnaroundCdu = turnaround.sections.find((section) => section.id.endsWith('.cdu'))!
    const turnaroundDocuments = turnaround.sections.find((section) => section.id.endsWith('.documents'))!
    const sunglasses = firstLegBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))!
    const lateralMode = firstLegBeforeRunway.items.find((item) => item.id.endsWith('.lateral-mode'))!
    const windshieldWipers = firstLegCockpit.items.find((item) => item.id.endsWith('.windshield-wipers'))!
    const headset = firstLegCockpit.items.find((item) => item.id.endsWith('.headset-and-microphone'))!

    expect(turnaroundDeplaning.items.map((item) => item.title)).toContain('单发滑行')
    expect(firstLegThirdPosition.description).toBe('第二位可直接全部勾选')
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
    expect(headset.description).toBe('使用驾驶盘上的“INT”发话，并测试耳机是否能正常听到自己的声音')
    expect(windshieldWipers.description).toBe('如果没有降水，则执行以下步骤：\n1. 在插入耳机前检查风挡雨刷，以防关闭风挡时夹到耳机线。\n2. 打开风挡，并确认飞机下方无人。\n3. 倒水，检查雨刷能否达到满意的清洁效果。\n4. 检查风挡框无夹杂物，尤其要从下向上观察。\n5. 关闭并锁好风挡。')
    expect(firstLegCdu.items.findIndex((item) => item.title === '航路 ...... 检查')).toBeGreaterThan(firstLegCdu.items.findIndex((item) => item.title === '目的地四字码 ...... 检查'))
    expect(turnaroundCdu.items.findIndex((item) => item.title === '航路 ...... 检查')).toBeGreaterThan(turnaroundCdu.items.findIndex((item) => item.title === '目的地四字码 ...... 检查'))
    expect(turnaroundBeforeStart.items.map((item) => item.title)).toContain('墨镜/屏幕亮度')
    expect(sunglasses.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(turnaroundBeforeStart.items.find((item) => item.id.endsWith('.sunglasses-screen-brightness'))?.description).toBe('如果向阳起飞或离场可能转向阳光较强一侧，调亮屏幕亮度并配戴墨镜\n如果从入口内移起飞，建议调亮屏幕亮度')
    expect(firstLegBeforeBrakeRelease.title).toBe('滑出前')
    expect(turnaroundBeforeBrakeRelease.title).toBe('滑出前')
    expect(firstLegBeforeStartSwitchesGrd.title).toBe('启动电门GRD位之前')
    expect(turnaroundBeforeStartSwitchesGrd.title).toBe('启动电门GRD位之前')
    expect(firstLeg.sections.indexOf(firstLegBeforeStartSwitchesGrd)).toBeLessThan(firstLeg.sections.indexOf(firstLegBeforeBrakeRelease))
    expect(firstLegBeforeStartSwitchesGrd.items.map((item) => item.title)).toEqual([
      '起动前检查单 ...... 完成',
      'ATC 有起动许可',
      '液压增压',
      '推力手柄 ...... IDLE',
      '起动1发前获得机务许可（提醒）',
    ])
    expect(firstLegBeforeStartSwitchesGrd.items.find((item) => item.id.endsWith('.hydraulic-pressurization'))?.description).toBe('如果没有增压许可，至少系统B两个泵要接通')
    expect(firstLegBeforeStartSwitchesGrd.items.find((item) => item.id.endsWith('.atc-start-clearance'))?.description).toBe('而不只是推出')
    expect(turnaroundBeforeStartSwitchesGrd.items.map((item) => item.title)).toEqual(firstLegBeforeStartSwitchesGrd.items.map((item) => item.title))
    expect(firstLegBeforeBrakeRelease.items.map((item) => item.title)).toEqual([
      '防撞灯 ...... ON',
      'ENG/SPAR VALVE CLOSED 灯 ...... 灭',
      '滑行前检查单 ...... 完成',
      '手势、销子、轮挡 ...... 检查',
      '组件(2 个) ...... AUTO',
    ])
    expect(firstLegBeforeStart.items.map((item) => item.title)).not.toContain('水平方式 ...... 正确')
    expect(firstLegBeforeRunway.items.map((item) => item.title)).toContain('水平方式 ...... 正确')
    expect(firstLegBeforeRunway.items.map((item) => item.title)).toContain('起飞前检查单 ...... 完成')
    expect(firstLegBeforeRunway.items.map((item) => item.title)).toContain('襟翼 ...... 绿灯且与性能计算一致')
    expect(firstLegBeforeRunway.items[0]?.title).toBe('起飞前检查单 ...... 完成')
    expect(turnaround.sections.find((section) => section.id.endsWith('.before-runway'))?.items[0]?.title).toBe('起飞前检查单 ...... 完成')
    expect(firstLegBeforeRunway.items.at(-1)?.title).toBe('水平方式 ...... 正确')
    expect(turnaround.sections.find((section) => section.id.endsWith('.before-runway'))?.items.at(-1)?.title).toBe('水平方式 ...... 正确')
    expect(turnaroundBeforeBrakeRelease.items.map((item) => item.title)).toEqual(firstLegBeforeBrakeRelease.items.map((item) => item.title))
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.logbook-pages')
    expect(firstLegDocuments.items.map((item) => item.id)).toContain('public-first-leg.documents.clb-location')
    expect(firstLegDocuments.description).toBe('Documents 检查可与下方的“起动前”检查单同时进行。')
    expect(turnaroundDocuments.description).toBe('Documents 检查可与下方的“起动前”检查单同时进行。')
    expect(firstLeg.description).toMatch(/^无需执行的项目也要勾选（例如修正海压机场的QFE）。/)
    expect(turnaround.description).toMatch(/^无需执行的项目也要勾选（例如修正海压机场的QFE）。/)
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.logbook-pages')
    expect(turnaroundDocuments.items.map((item) => item.id)).not.toContain('public-turnaround.documents.clb-location')
    expect(firstLegBeforeStart.items.find((item) => item.id.endsWith('.transition-altitude'))?.title).toBe('CDU中的Transition Altitude')
    expect(lateralMode.title).toBe('水平方式 ...... 正确')
    expect(lateralMode.description).toBe('以下情况不预位LNAV:\n1. 不按SID飞，例如保持跑道航向\n2. SID 为人工输入\n3. 使用QFE\n注: 如果SID数据有误，需要通知ATC\n注: 根据进跑道/起飞指令做最后的检查')
    expect(turnaround.sections.find((section) => section.id.endsWith('.before-runway'))?.items.find((item) => item.id.endsWith('.lateral-mode'))?.description).toBe(lateralMode.description)
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
