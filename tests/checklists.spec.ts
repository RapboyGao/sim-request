import { describe, expect, it } from 'vitest'
import { builtinChecklists } from '../data/checklists'
import { CHECKLIST_ROUTE_IDS, checklistRoute, checklistsHomeRoute, customChecklistRoute } from '../utils/checklist-routes'
import { extractReadableChecklistNotes } from '../utils/checklist-source'
import type { ChecklistStatus } from '../types/checklist'
import {
  checklistStats,
  isItemExpired,
  resetChecklistStatus,
  sectionStats,
  setSectionStatus,
  toggleStatus,
  validateBackup,
  validateCustomChecklists,
} from '../utils/checklists'

describe('checklists data', () => {
  it('contains all eight aviation source pages', () => {
    expect(builtinChecklists).toHaveLength(8)
    expect(builtinChecklists.map((item) => item.id)).toEqual([
      'before-flight-day',
      'before-sleep',
      'before-flight-going',
      'first-leg',
      'next-legs',
      'leaving-aircraft',
      'b737-deicing-en',
      'b737-deicing-zh',
    ])
    expect(builtinChecklists.every((item) => item.sections.length > 0)).toBe(true)
    expect(builtinChecklists.every((item) => typeof item.sourceMarkdown === 'string' && item.sourceMarkdown.length > 0)).toBe(true)
    expect(builtinChecklists.find((item) => item.id === 'before-flight-day')?.sourceMarkdown).toContain('Before Flight Recommendations')
    expect(builtinChecklists.find((item) => item.id === 'b737-deicing-zh')?.sourceMarkdown).toContain('标准除冰程序')
  })

  it('calculates checklist and section progress', () => {
    const checklist = builtinChecklists[0]!
    const section = checklist.sections[0]!
    const status: ChecklistStatus = { [section.items[0]!.id]: '2026-08-12T00:00:00.000Z' }

    expect(sectionStats(section, status)).toMatchObject({ checked: 1, total: 6 })
    expect(checklistStats(checklist, status).checked).toBe(1)
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
  it('maps all eight built-in checklists to stable pages', () => {
    expect(CHECKLIST_ROUTE_IDS).toHaveLength(8)
    expect(CHECKLIST_ROUTE_IDS).toEqual(builtinChecklists.map((item) => item.id))
    expect(checklistRoute('demo key', CHECKLIST_ROUTE_IDS[0]!)).toBe('/checklists/demo%20key/before-flight-day')
    expect(checklistsHomeRoute('demo')).toBe('/checklists/demo/')
    expect(customChecklistRoute('demo', 'custom-1')).toBe('/checklists/demo/custom/custom-1')
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
      items: [{ id: 'item-1', title: 'Item', detail: '', expiresAfterHours: 6 }],
    }],
    notes: [],
  }

  it('accepts valid custom data and backups', () => {
    expect(validateCustomChecklists({ version: 1, checklists: [custom] })).toHaveLength(1)
    expect(validateBackup({ version: 1, exportedAt: new Date().toISOString(), checklists: [custom], status: { 'item-1': null } })).not.toBeNull()
  })

  it('rejects malformed or builtin backup content', () => {
    expect(validateCustomChecklists({ version: 2, checklists: [custom] })).toBeNull()
    expect(validateBackup({ version: 1, checklists: [{ ...custom, source: 'builtin' }], status: {} })).toBeNull()
    expect(validateBackup({ version: 1, checklists: [custom], status: { 'item-1': 42 } })).toBeNull()
  })
})
