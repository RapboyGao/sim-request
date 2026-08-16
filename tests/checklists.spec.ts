import { describe, expect, it } from 'vitest'
import { builtinChecklists } from '../data/checklists'
import { publicDeicingChecklist } from '../data/public-deicing'
import { CHECKLIST_ROUTE_IDS, DEFAULT_CHECKLIST_PASSWORD, checklistRoute, checklistsHomeRoute, customChecklistEditRoute, customChecklistRoute } from '../utils/checklist-routes'
import { extractReadableChecklistNotes } from '../utils/checklist-source'
import type { ChecklistStatus } from '../types/checklist'
import {
  checklistStats,
  checklistCompletionStatus,
  exclusiveGroupName,
  exclusiveSectionDisabled,
  exclusiveSectionGroups,
  isItemExpired,
  normalizeChecklist,
  removeDeletedItemStatuses,
  resetChecklistStatus,
  sectionStats,
  setSectionStatus,
  setChecklistSectionStatus,
  sortChecklistsByFavorite,
  toggleStatus,
  toggleChecklistItemStatus,
  validateBackup,
  validateCustomChecklists,
} from '../utils/checklists'

describe('checklists data', () => {
  it('contains all six private aviation source pages', () => {
    expect(builtinChecklists).toHaveLength(6)
    expect(builtinChecklists.map((item) => item.id)).toEqual([
      'before-flight-day',
      'before-sleep',
      'before-flight-going',
      'first-leg',
      'next-legs',
      'leaving-aircraft',
    ])
    expect(builtinChecklists.every((item) => item.sections.length > 0)).toBe(true)
    expect(builtinChecklists.every((item) => typeof item.sourceMarkdown === 'string' && item.sourceMarkdown.length > 0)).toBe(true)
    expect(builtinChecklists.find((item) => item.id === 'before-flight-day')?.sourceMarkdown).toContain('Before Flight Recommendations')
  })

  it('contains the revised bilingual public deicing procedures', () => {
    const english = publicDeicingChecklist('en').checklist
    const chinese = publicDeicingChecklist('zh-CN').checklist

    const englishNotes = extractReadableChecklistNotes(english.sourceMarkdown || '')
    const chineseNotes = extractReadableChecklistNotes(chinese.sourceMarkdown || '')

    expect(english.sections.map((section) => section.title)).toEqual([
      '1. Before Taxi Procedure',
      '2. Approaching De-icing Pad',
      '3a. At De-icing Pad - Engine-Off Deicing',
      '3b. At De-icing Pad - Engine-Idle Deicing',
    ])
    expect(chinese.sections.map((section) => section.title)).toEqual([
      '1. 滑行前程序',
      '2. 即将到达除冰位',
      '3a. 如关车除冰',
      '3b. 如慢车除冰',
    ])
    expect(englishNotes).toHaveLength(1)
    expect(chineseNotes).toHaveLength(1)
    expect(englishNotes[0]?.title).toBe('APU Note')
    expect(chineseNotes[0]?.title).toBe('APU 说明')
    expect(englishNotes[0]?.content).toContain('Keep APU generator ON.')
    expect(chineseNotes[0]?.content).toContain('保持 APU 发电机接通。')
    expect(englishNotes[0]?.content).not.toContain('Engine start levers ...... CUTOFF')
    expect(chineseNotes[0]?.content).not.toContain('发动机起动手柄 ...... CUTOFF')
    expect(chinese.sections[0]?.items.map((item) => item.title)).toContain('发电机 ...... ON')
    expect(chinese.sections[3]?.items.map((item) => item.title)).toContain('滑行前检查单 ...... 完成')
    expect(english.sections[0]?.description).toContain('Keep APU generator ON.')
    expect(chinese.sections[0]?.description).toContain('保持 APU 发电机接通。')
    expect(english.sections[0]?.items[1]?.description).toBe('This step ensures the engine generators are free of faults.')
    expect(chinese.sections[0]?.items[1]?.description).toBe('此步骤可确保发动机发电机无故障。')
    expect(english.sections[2]?.items.map((item) => item.title)).toContain('Engine start levers ...... CUTOFF')
    expect(english.sections[2]?.items.map((item) => item.title)).toContain('After deicing')
    expect(chinese.sections[2]?.items.map((item) => item.title)).toContain('除冰完成后')
    expect(english.sections[2]?.completion).toBe('exclusive')
    expect(english.sections[3]?.completion).toBe('exclusive')
    expect(exclusiveSectionGroups(english)).toHaveLength(1)
    expect(exclusiveSectionGroups(english).map((group) => group.map((section) => section.title))).toEqual([
      ['3a. At De-icing Pad - Engine-Off Deicing', '3b. At De-icing Pad - Engine-Idle Deicing'],
    ])
  })

  it('uses canonical descriptions and stable unique item IDs for every built-in', () => {
    for (const checklist of builtinChecklists) {
      const ids = checklist.sections.flatMap((section) => section.items.map((item) => item.id))
      expect(ids.length).toBeGreaterThan(0)
      expect(new Set(ids).size).toBe(ids.length)
      expect(checklist.sections.every((section) => typeof section.description === 'string')).toBe(true)
      expect(checklist.sections.every((section) => section.items.every((item) => (
        typeof item.id === 'string'
        && item.id.length > 0
        && typeof item.description === 'string'
        && typeof item.isEmphasized === 'boolean'
        && (item.expiresAfterHours === null || typeof item.expiresAfterHours === 'number')
      )))).toBe(true)
    }
  })

  it('keeps the same logical item IDs across public deicing locales', () => {
    const idsFor = (locale: string) => publicDeicingChecklist(locale).checklist.sections.flatMap((section) => section.items.map((item) => item.id))
    const englishIds = idsFor('en')
    for (const locale of ['zh-CN', 'ja', 'ko', 'fr']) expect(idsFor(locale)).toEqual(englishIds)
  })

  it('exposes the same four-section deicing checklist in every public locale', () => {
    const english = publicDeicingChecklist('en').checklist
    const chinese = publicDeicingChecklist('zh-CN').checklist
    expect(english.sections).toHaveLength(4)
    expect(chinese.sections).toHaveLength(4)
    expect(publicDeicingChecklist('ja').checklist.sections.flatMap((section) => section.items)).toHaveLength(english.sections.flatMap((section) => section.items).length)
    expect(publicDeicingChecklist('ko').checklist.sections.flatMap((section) => section.items)).toHaveLength(english.sections.flatMap((section) => section.items).length)
    expect(publicDeicingChecklist('fr').checklist.sections.flatMap((section) => section.items)).toHaveLength(english.sections.flatMap((section) => section.items).length)
    expect(chinese.sections[0]?.items[0]?.title).toBe('发电机 ...... ON')
    expect(chinese.sections[0]?.description).toContain('保持 APU 接通。')
    expect(english.sections[2]?.items.map((item) => item.title).indexOf('Engine anti-ice ...... OFF')).toBeLessThan(english.sections[2]?.items.map((item) => item.title).indexOf('Engine start switches ...... OFF') ?? -1)
    expect(chinese.sections[2]?.items.map((item) => item.title)).toContain('除冰完成后')
    expect(publicDeicingChecklist('ja').checklist.sections[2]?.items.map((item) => item.title)).toContain('除氷完了後')
  })

  it('calculates checklist and section progress', () => {
    const checklist = builtinChecklists[0]!
    const section = checklist.sections[0]!
    const status: ChecklistStatus = { [section.items[0]!.id]: '2026-08-12T00:00:00.000Z' }

    expect(sectionStats(section, status)).toMatchObject({ checked: 1, total: 6 })
    expect(checklistStats(checklist, status).checked).toBe(1)
  })

  it('supports adjacent exclusive sections as one completion unit', () => {
    const checklist = {
      id: 'exclusive',
      title: 'Exclusive',
      description: '',
      source: 'custom' as const,
      sections: [
        { id: 'normal', title: 'Normal', description: '', completion: 'all' as const, items: [{ id: 'normal-item', title: 'Normal item', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'choice-a', title: 'Choice A', description: 'A description', completion: 'exclusive' as const, items: [{ id: 'choice-a-item', title: 'A', description: 'A item description', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'choice-b', title: 'Choice B', description: '', completion: 'exclusive' as const, items: [{ id: 'choice-b-item', title: 'B', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'after', title: 'After', description: '', completion: 'all' as const, items: [{ id: 'after-item', title: 'After item', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
      ],
      notes: [],
    }

    expect(exclusiveSectionGroups(checklist)).toHaveLength(1)
    expect(exclusiveSectionGroups(checklist)[0]).toHaveLength(2)
    expect(checklistStats(checklist, { 'normal-item': 'now', 'choice-a-item': 'now', 'after-item': 'now' }).complete).toBe(true)
    expect(checklistStats(checklist, { 'normal-item': 'now', 'after-item': 'now' }).complete).toBe(false)
    expect(exclusiveGroupName(exclusiveSectionGroups(checklist)[0]!, '选一组完成')).toBe('选一组完成')
  })

  it('does not join non-adjacent exclusive sections into one group', () => {
    const checklist = {
      id: 'non-adjacent', title: 'Non-adjacent', description: '', source: 'custom' as const,
      sections: [
        { id: 'a', title: 'A', description: '', completion: 'exclusive' as const, items: [{ id: 'a-item', title: 'A', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'middle', title: 'Middle', description: '', completion: 'all' as const, items: [{ id: 'middle-item', title: 'Middle', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'b', title: 'B', description: '', completion: 'exclusive' as const, items: [{ id: 'b-item', title: 'B', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
      ], notes: [],
    }
    expect(exclusiveSectionGroups(checklist)).toHaveLength(2)
    expect(checklistStats(checklist, { 'a-item': 'now', 'middle-item': 'now' }).complete).toBe(false)
  })

  it('strictly clears other adjacent exclusive sections when selecting one', () => {
    const checklist = {
      id: 'exclusive', title: 'Exclusive', description: '', source: 'custom' as const,
      sections: [
        { id: 'a', title: 'A', description: '', completion: 'exclusive' as const, items: [{ id: 'a-item', title: 'A', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'b', title: 'B', description: '', completion: 'exclusive' as const, items: [{ id: 'b-item', title: 'B', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
        { id: 'c', title: 'C', description: '', completion: 'exclusive' as const, items: [{ id: 'c-item', title: 'C', description: '', isEmphasized: false, expiresAfterHours: 6 }] },
      ], notes: [],
    }
    const initial = { 'a-item': 'old', 'b-item': 'old', 'unrelated': 'keep' }
    expect(toggleChecklistItemStatus(initial, checklist, 'c-item', new Date('2026-08-12T10:00:00.000Z'))).toMatchObject({
      'a-item': null, 'b-item': null, 'unrelated': 'keep',
    })
    expect(setChecklistSectionStatus(initial, checklist, checklist.sections[0]!, true)).toMatchObject({ 'b-item': null, 'c-item': null })
  })

  it('disables only the other section in the selected public deicing group', () => {
    const checklist = publicDeicingChecklist('en').checklist
    const [firstGroup] = exclusiveSectionGroups(checklist)
    const firstSelectedItem = firstGroup![0]!.items[0]!
    const secondSelectedItem = firstGroup![1]!.items[0]!
    const normalSection = checklist.sections[0]!

    expect(exclusiveSectionDisabled(checklist, {}, firstGroup![1]!)).toBe(false)
    expect(exclusiveSectionDisabled(checklist, { [firstSelectedItem.id]: 'now' }, firstGroup![1]!)).toBe(true)
    expect(exclusiveSectionDisabled(checklist, { [firstSelectedItem.id]: 'now' }, normalSection)).toBe(false)
    expect(exclusiveSectionDisabled(checklist, { [secondSelectedItem.id]: 'now' }, firstGroup![0]!)).toBe(true)
    expect(exclusiveSectionDisabled(checklist, {}, firstGroup![1]!)).toBe(false)
  })

  it('normalizes canonical sections and items without legacy fields', () => {
    const canonical = {
      id: 'canonical', title: 'Canonical', description: '', source: 'custom' as const,
      sections: [{
        id: 'section', title: 'Section', description: 'Section description', completion: 'all' as const,
        items: [{ id: 'item', title: 'Item', description: 'Item description', isEmphasized: true, expiresAfterHours: null }],
      }], notes: [],
    }
    const normalized = normalizeChecklist(canonical)
    expect(normalized.sections[0]).toMatchObject({ description: 'Section description', completion: 'all' })
    expect(normalized.sections[0]?.items[0]).toMatchObject({ description: 'Item description', isEmphasized: true })
    expect(normalized.sections[0]).not.toHaveProperty('detail')
    expect(normalized.sections[0]?.items[0]).not.toHaveProperty('detail')
  })

  it('normalizes and preserves exclusive group names across every section', () => {
    const named = {
      id: 'named', title: 'Named', description: '', source: 'custom' as const,
      sections: [
        { id: 'a', title: 'A', description: '', completion: 'exclusive' as const, exclusiveGroupName: '起飞方式', items: [] },
        { id: 'b', title: 'B', description: '', completion: 'exclusive' as const, items: [] },
      ], notes: [],
    }
    const normalized = normalizeChecklist(named)
    expect(normalized.sections.map((section) => section.exclusiveGroupName)).toEqual(['起飞方式', '起飞方式'])

    const afterFirstSectionRemoved = normalizeChecklist({ ...normalized, sections: normalized.sections.slice(1) })
    expect(afterFirstSectionRemoved.sections[0]?.exclusiveGroupName).toBe('起飞方式')
  })

  it('extracts readable notes without exposing source-file code', () => {
    const source = builtinChecklists.find((item) => item.id === 'before-flight-day')?.sourceMarkdown || ''
    const notes = extractReadableChecklistNotes(source)

    expect(notes).toHaveLength(5)
    expect(notes[0]?.title).toBe('早班 737-NG')
    expect(notes[0]?.content).toContain('# 航班安全要求')
    expect(notes[0]?.content).toContain('## 准备前')
    expect(notes[0]?.content).not.toContain('<script setup')
    expect(notes[0]?.content).not.toContain('MyChecklistItemGroup')
  })
})

describe('checklists routes', () => {
  it('maps all six private built-in checklists to stable pages', () => {
    expect(CHECKLIST_ROUTE_IDS).toHaveLength(6)
    expect(CHECKLIST_ROUTE_IDS).toEqual(builtinChecklists.map((item) => item.id))
    expect(checklistRoute('demo key', CHECKLIST_ROUTE_IDS[0]!)).toBe('/checklists/demo%20key/before-flight-day')
    expect(checklistsHomeRoute('demo')).toBe('/checklists/demo/')
    expect(DEFAULT_CHECKLIST_PASSWORD).toBe('13515')
    expect(checklistsHomeRoute()).toBe('/checklists/13515/')
    expect(customChecklistRoute('demo', 'custom-1')).toBe('/checklists/demo/custom/custom-1')
    expect(customChecklistEditRoute('demo', 'custom-1')).toBe('/checklists/demo/custom/custom-1/edit')
  })
})

describe('checklists status', () => {
  it('toggles items and sections with timestamps', () => {
    const checklist = builtinChecklists[1]!
    const section = checklist.sections[0]!
    const now = new Date('2026-08-12T10:00:00.000Z')
    let status: ChecklistStatus = {}

    status = toggleStatus(status, section.items[0]!.id, now)
    expect(status[section.items[0]!.id]).toBe(now.toISOString())
    status = setSectionStatus(status, section, true, now)
    expect(sectionStats(section, status).complete).toBe(true)
    status = resetChecklistStatus(status, checklist)
    expect(sectionStats(section, status).checked).toBe(0)
  })

  it('reports configured expiry without clearing state', () => {
    const item = builtinChecklists[0]!.sections[0]!.items[0]!
    const checkedAt = '2026-08-12T00:00:00.000Z'
    expect(isItemExpired(item, checkedAt, Date.parse('2026-08-12T07:00:01.000Z'))).toBe(true)
    expect(isItemExpired({ ...item, expiresAfterHours: null }, checkedAt, Date.parse('2030-01-01T00:00:00.000Z'))).toBe(false)
  })

  it('maps checklist completion to card border states', () => {
    const checklist = builtinChecklists[0]!
    const firstItem = checklist.sections[0]!.items[0]!

    expect(checklistCompletionStatus(checklist, {})).toBe('idle')
    expect(checklistCompletionStatus(checklist, { [firstItem.id]: '2026-08-12T10:00:00.000Z' })).toBe('partial')

    const completeStatus = Object.fromEntries(
      checklist.sections.flatMap((section) => section.items.map((item) => [item.id, '2026-08-12T10:00:00.000Z'] as const)),
    )
    expect(checklistCompletionStatus(checklist, completeStatus)).toBe('complete')
  })

  it('places favorited checklists first without changing the remaining order', () => {
    const checklists = [builtinChecklists[1]!, builtinChecklists[0]!, builtinChecklists[2]!]
    expect(sortChecklistsByFavorite(checklists, ['before-flight-day']).map((item) => item.id)).toEqual([
      'before-flight-day',
      'before-sleep',
      'before-flight-going',
    ])
  })
})

describe('checklists backup validation', () => {
  const custom = {
    id: 'custom-1',
    title: 'Custom',
    description: '',
    source: 'custom' as const,
    sections: [{
      id: 'section-1',
      title: 'Section',
      description: '',
      completion: 'all' as const,
      items: [{ id: 'item-1', title: 'Item', description: '', isEmphasized: false, expiresAfterHours: 6 }],
    }],
    notes: [],
  }

  it('accepts valid custom data and backups', () => {
    expect(validateCustomChecklists({ version: 2, checklists: [custom] })).toHaveLength(1)
    expect(validateBackup({ version: 2, exportedAt: new Date().toISOString(), checklists: [custom], status: { 'item-1': null } })).not.toBeNull()
  })

  it('rejects malformed or builtin backup content', () => {
    expect(validateCustomChecklists({ version: 1, checklists: [custom] })).toBeNull()
    expect(validateBackup({ version: 1, checklists: [custom], status: {} })).toBeNull()
    expect(validateBackup({ version: 2, checklists: [{ ...custom, source: 'builtin' }], status: {} })).toBeNull()
    expect(validateBackup({ version: 2, checklists: [custom], status: { 'item-1': 42 } })).toBeNull()
    expect(validateCustomChecklists({ version: 2, checklists: [{ ...custom, sections: [{ ...custom.sections[0]!, items: [{ ...custom.sections[0]!.items[0]!, id: '' }] }] }] })).toBeNull()
    expect(validateCustomChecklists({ version: 2, checklists: [{ ...custom, sections: [{ ...custom.sections[0]!, items: [custom.sections[0]!.items[0]!, custom.sections[0]!.items[0]!] }] }] })).toBeNull()
  })
})

describe('checklist editor data updates', () => {
  const previous = {
    id: 'custom-1',
    title: 'Custom',
    description: '',
    source: 'custom' as const,
    sections: [{
      id: 'section-1',
      title: 'Section',
      description: '',
      completion: 'all' as const,
      items: [
        { id: 'item-1', title: 'Keep', description: '', isEmphasized: false, expiresAfterHours: 6 },
        { id: 'item-2', title: 'Delete', description: '', isEmphasized: false, expiresAfterHours: 6 },
      ],
    }],
    notes: [],
  }

  it('clears status only for items removed during an edit', () => {
    const next = {
      ...previous,
      sections: [{
        ...previous.sections[0]!,
        items: [previous.sections[0]!.items[0]!],
      }],
    }
    const status = {
      'item-1': '2026-08-12T10:00:00.000Z',
      'item-2': '2026-08-12T10:00:00.000Z',
      unrelated: '2026-08-12T10:00:00.000Z',
    }

    expect(removeDeletedItemStatuses(status, previous, next)).toEqual({
      'item-1': '2026-08-12T10:00:00.000Z',
      unrelated: '2026-08-12T10:00:00.000Z',
    })
  })
})
