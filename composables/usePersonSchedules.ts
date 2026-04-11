import type { BookingEntry } from '~/types/booking'
import { buildSlots } from '~/utils/slots'

export type PersonBookingRow = {
  date: string
  slot: string
  slotLabel: string
  createdAt: string
  status: 'confirmed' | 'waitlist' | 'canceled'
  priorityLevel: BookingEntry['priorityLevel']
  id: string
}

export type PersonSchedule = {
  name: string
  rows: PersonBookingRow[]
}

const slotOrder = buildSlots()
const slotIndex = new Map(slotOrder.map((slot, index) => [slot, index]))

export function usePersonSchedules(bookings: Ref<Record<string, BookingEntry[]> | null | undefined>, cutoff: Ref<Date>) {
  const personSchedules = computed<PersonSchedule[]>(() => {
    const payload = bookings.value
    if (!payload) return []

    const slotBuckets = new Map<string, BookingEntry[]>()

    for (const [key, items] of Object.entries(payload)) {
      const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
      if (!match) continue
      const [, date, slot] = match as [string, string, string]
      if (toSlotEnd(date, slot) < cutoff.value) continue
      const bucketKey = `${date}::${slot}`
      const list = slotBuckets.get(bucketKey) || []
      list.push(...(items || []))
      slotBuckets.set(bucketKey, list)
    }

    const rows: PersonBookingRow[] = []

    for (const [bucketKey, entries] of slotBuckets.entries()) {
      const [date, slot] = bucketKey.split('::') as [string, string]
      const active = sortActiveEntries(entries.filter((entry) => entry.status !== 'canceled'))
      const canceled = sortActiveEntries(entries.filter((entry) => entry.status === 'canceled'))

      active.forEach((entry, index) => {
        rows.push({
          date,
          slot,
          slotLabel: slot,
          createdAt: entry.createdAt,
          status: index < 2 ? 'confirmed' : 'waitlist',
          priorityLevel: entry.priorityLevel,
          id: entry.id,
        })
      })

      canceled.forEach((entry) => {
        rows.push({
          date,
          slot,
          slotLabel: slot,
          createdAt: entry.createdAt,
          status: 'canceled',
          priorityLevel: entry.priorityLevel,
          id: entry.id,
        })
      })
    }

    const grouped = new Map<string, PersonBookingRow[]>()
    for (const row of rows.sort((left, right) => {
      const nameLeft = left.id.localeCompare(right.id)
      if (nameLeft !== 0) return nameLeft
      const dateCompare = left.date.localeCompare(right.date)
      if (dateCompare !== 0) return dateCompare
      return compareSlots(left.slot, right.slot)
    })) {
      const list = grouped.get(row.id) || []
      list.push(row)
      grouped.set(row.id, list)
    }

    // regroup by name while preserving slot order within each person
    const byName = new Map<string, PersonBookingRow[]>()
    for (const [bucketKey, entries] of slotBuckets.entries()) {
      void bucketKey
      void entries
    }

    // Build rows by person name with stable order across dates and slots
    const nameMap = new Map<string, PersonBookingRow[]>()
    for (const row of rows) {
      const rawEntry = findRawEntry(payload, row.date, row.slot, row.id)
      const name = rawEntry?.name || ''
      if (!name) continue
      const list = nameMap.get(name) || []
      list.push(row)
      nameMap.set(name, list)
    }

    return [...nameMap.entries()].map(([name, list]) => ({
      name,
      rows: list.sort((left, right) => {
        const dateCompare = left.date.localeCompare(right.date)
        if (dateCompare !== 0) return dateCompare
        return compareSlots(left.slot, right.slot)
      }),
    })).sort((left, right) => left.name.localeCompare(right.name))
  })

  return { personSchedules }
}

function findRawEntry(payload: Record<string, BookingEntry[]>, date: string, slot: string, id: string) {
  const items = payload[`bookings:${date}:${slot}`] || []
  return items.find((item) => item.id === id)
}

function compareSlots(left: string, right: string) {
  const leftIndex = slotIndex.get(left) ?? Number.MAX_SAFE_INTEGER
  const rightIndex = slotIndex.get(right) ?? Number.MAX_SAFE_INTEGER
  return leftIndex - rightIndex
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
