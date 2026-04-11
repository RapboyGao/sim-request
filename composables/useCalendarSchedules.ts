import type { BookingEntry, SlotSummary } from '~/types/booking'

type DaySummary = {
  date: string
  slots: SlotSummary[]
  total: number
}

type DisplayEntry = {
  key: string
  name: string
  priorityLevel: BookingEntry['priorityLevel']
  createdAt: string
  targets: Array<{ date: string; slot: string; id: string; label: string }>
}

export type FlatSchedule = {
  date: string
  slot: string
  slotLabel: string
  sourceSlots: string[]
  segments: SlotSummary[]
  active: BookingEntry[]
  canceled: BookingEntry[]
  confirmed: DisplayEntry[]
  waitlist: DisplayEntry[]
  canceledRows: DisplayEntry[]
}

type RawSchedule = {
  date: string
  slot: string
  entries: BookingEntry[]
}

export function useCalendarSchedules(bookings: Ref<Record<string, BookingEntry[]> | null | undefined>, cutoff: Ref<Date>) {
  const groupedSchedules = computed<DaySummary[]>(() => {
    const payload = bookings.value
    if (!payload) return []

    const entries = Object.entries(payload)
      .flatMap(([key, value]): RawSchedule[] => {
        const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
        if (!match) return []
        const [, date, slot] = match as [string, string, string]
        const booked = (value as BookingEntry[]) || []
        const slotEnd = toSlotEnd(date, slot)
        if (booked.length === 0 || slotEnd < cutoff.value) return []
        return [{ date, slot, entries: booked }]
      })
      .sort((a: RawSchedule, b: RawSchedule) => {
        const byDate = a.date.localeCompare(b.date)
        return byDate !== 0 ? byDate : a.slot.localeCompare(b.slot)
      })

    const grouped = new Map<string, DaySummary>()
    for (const item of entries) {
      const active = item.entries.filter((entry) => entry.status !== 'canceled')
      const canceled = item.entries.filter((entry) => entry.status === 'canceled')
      if (!grouped.has(item.date)) {
        grouped.set(item.date, { date: item.date, slots: [], total: 0 })
      }
      const day = grouped.get(item.date)!
      day.slots.push({ slot: item.slot, active, canceled })
      day.total += item.entries.length
    }

    return [...grouped.values()]
  })

  const flatSchedules = computed<FlatSchedule[]>(() => {
    return groupedSchedules.value.flatMap((day) => {
      const merged: FlatSchedule[] = []

      for (const slot of day.slots) {
        const last = merged.at(-1)
        if (last && last.date === day.date && canMergeSlots(last, slot)) {
          last.slot = mergeSlotLabels(last.slot, slot.slot)
          const firstSlot = last.sourceSlots[0]
          if (firstSlot) {
            last.slotLabel = formatMergedSlotLabel(firstSlot, slot.slot)
          }
          last.sourceSlots.push(slot.slot)
          last.segments.push(slot)
          continue
        }

        merged.push({
          date: day.date,
          slot: slot.slot,
          slotLabel: slot.slot,
          sourceSlots: [slot.slot],
          segments: [slot],
          active: slot.active,
          canceled: slot.canceled || [],
          confirmed: [],
          waitlist: [],
          canceledRows: [],
        })
      }

      return merged.map((item) => {
        const confirmed = buildDisplayEntries(item.segments, 'confirmed', item.date)
        const waitlist = buildDisplayEntries(item.segments, 'waitlist', item.date)
        const canceledRows = buildDisplayEntries(item.segments, 'canceled', item.date)
        return {
          ...item,
          confirmed,
          waitlist,
          canceledRows,
        }
      })
    })
  })

  return {
    groupedSchedules,
    flatSchedules,
  }
}

function canMergeSlots(left: FlatSchedule, right: SlotSummary) {
  const lastSegment = left.segments.at(-1)
  if (!lastSegment) return false
  if (!areSlotSummariesEqual(lastSegment.active, lastSegment.canceled, right.active, right.canceled)) return false
  return isConsecutiveSlot(lastSegment.slot, right.slot)
}

function buildDisplayEntries(segments: SlotSummary[], type: 'confirmed' | 'waitlist' | 'canceled', date: string) {
  const rows = new Map<string, DisplayEntry>()

  for (const segment of segments) {
    const active = sortActiveEntries(segment.active)
    const selected = type === 'confirmed'
      ? active.slice(0, 2)
      : type === 'waitlist'
        ? active.slice(2)
        : sortActiveEntries(segment.canceled)

    for (const entry of selected) {
      const key = `${entry.name}|${entry.priorityLevel}|${entry.status}`
      const target = {
        date,
        slot: segment.slot,
        id: entry.id,
        label: segment.slot,
      }
      if (!rows.has(key)) {
        rows.set(key, {
          key,
          name: entry.name,
          priorityLevel: entry.priorityLevel,
          createdAt: entry.createdAt,
          targets: [target],
        })
        continue
      }

      const current = rows.get(key)!
      current.targets.push(target)
      if (entry.createdAt < current.createdAt) {
        current.createdAt = entry.createdAt
      }
    }
  }

  return [...rows.values()].sort((left, right) => {
    if (left.priorityLevel !== right.priorityLevel) {
      const order: Record<BookingEntry['priorityLevel'], number> = {
        specified: 0,
        classmate: 1,
        normal: 2,
      }
      return order[left.priorityLevel] - order[right.priorityLevel]
    }
    return left.createdAt.localeCompare(right.createdAt)
  })
}

function areSlotSummariesEqual(
  leftActive: BookingEntry[],
  leftCanceled: BookingEntry[],
  rightActive: BookingEntry[],
  rightCanceled: BookingEntry[],
) {
  return signature(leftActive) === signature(rightActive)
    && signature(leftCanceled) === signature(rightCanceled)
}

function signature(entries: BookingEntry[]) {
  return entries
    .map((entry) => `${entry.name}|${entry.priorityLevel}|${entry.status}`)
    .join('||')
}

function isConsecutiveSlot(leftSlot: string, rightSlot: string) {
  const leftEnd = leftSlot.split('-')[1]
  const rightStart = rightSlot.split('-')[0]
  return Boolean(leftEnd && rightStart && leftEnd === rightStart)
}

function formatMergedSlotLabel(startSlot: string, endSlot: string) {
  const start = startSlot.split('-')[0] || startSlot
  const end = endSlot.split('-')[1] || endSlot
  return `${start}-${end}`
}

function mergeSlotLabels(leftSlot: string, rightSlot: string) {
  const start = leftSlot.split('-')[0] || leftSlot
  const end = rightSlot.split('-')[1] || rightSlot
  return `${start}-${end}`
}

function toSlotEnd(date: string, slot: string) {
  const [start] = slot.split('-')
  if (!start) return new Date(`${date}T00:00:00`)
  const [hoursRaw, minutesRaw] = start.split(':')
  const [yearRaw, monthRaw, dayRaw] = date.split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw ?? 0)
  const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
}

function sortActiveEntries(entries: BookingEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.priorityLevel !== right.priorityLevel) {
      const order: Record<BookingEntry['priorityLevel'], number> = {
        specified: 0,
        classmate: 1,
        normal: 2,
      }
      return order[left.priorityLevel] - order[right.priorityLevel]
    }
    return left.createdAt.localeCompare(right.createdAt)
  })
}
