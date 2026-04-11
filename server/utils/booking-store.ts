import { promises as fs } from 'node:fs'
import path from 'node:path'
import { buildSlots } from '~/utils/slots'
import type { BookingEntry, BookingPriority } from '~/types/booking'
import { getSupabaseServerClient } from '~/server/utils/supabase'

type BookingMap = Record<string, BookingEntry[]>

type BookingRow = BookingEntry & { date: string; slot: string }

function storageKey(date: string, slot: string) {
  return `bookings:${date}:${slot}`
}

function getSupabaseConfig() {
  if (import.meta.dev) return null
  const client = getSupabaseServerClient()
  if (!client) return null
  return {
    client,
    table: process.env.SUPABASE_BOOKINGS_TABLE || 'bookings',
  }
}

function sortEntries(entries: BookingEntry[]) {
  const priorityOrder: Record<BookingPriority, number> = {
    specified: 0,
    student: 1,
    normal: 2,
  }

  return [...entries].sort((a, b) => {
    const leftPriority = normalizePriorityLevel(a.priorityLevel, a.isStudent ? 'student' : 'normal')
    const rightPriority = normalizePriorityLevel(b.priorityLevel, b.isStudent ? 'student' : 'normal')

    if (priorityOrder[leftPriority] !== priorityOrder[rightPriority]) {
      return priorityOrder[leftPriority] - priorityOrder[rightPriority]
    }
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function normalizePriorityLevel(
  value: unknown,
  fallback: BookingPriority = 'normal',
): BookingPriority {
  if (value === 'specified' || value === 'student' || value === 'normal') {
    return value
  }
  return fallback
}

function normalizeBookingName(name: string) {
  return name.trim()
}

function hasDuplicateBooking(entries: BookingEntry[], name: string) {
  const normalizedName = normalizeBookingName(name)
  return entries.some((entry) => normalizeBookingName(entry.name) === normalizedName)
}

function getPriorityFromRow(row: {
  priority_level?: unknown
  is_student?: unknown
}) {
  const priority = normalizePriorityLevel(row.priority_level, row.is_student ? 'student' : 'normal')
  return priority
}

async function readLocalStorage(filePath: string): Promise<BookingMap> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as BookingMap
  } catch {
    return {}
  }
}

async function writeLocalStorage(filePath: string, data: BookingMap) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

async function readSupabaseBookings(event: any): Promise<BookingMap | null> {
  const supabase = getSupabaseConfig()
  if (!supabase) return null

  const { client, table } = supabase
  const { data, error } = await client
    .from(table)
    .select('date,slot,id,name,is_student,created_at,status')
    .order('date', { ascending: true })
    .order('slot', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const grouped: BookingMap = {}
  for (const row of (data || []) as Array<{
    date: string
    slot: string
    id: string
    name: string
    is_student: boolean
    priority_level?: BookingPriority
    created_at: string
    status: BookingEntry['status']
  }>) {
    const key = storageKey(row.date, row.slot)
    grouped[key] = grouped[key] || []
    grouped[key].push({
      id: row.id,
      date: row.date,
      slot: row.slot,
      name: row.name,
      isStudent: row.is_student,
      priorityLevel: getPriorityFromRow(row),
      createdAt: row.created_at,
      status: row.status,
    })
  }

  for (const key of Object.keys(grouped)) {
    grouped[key] = sortEntries(grouped[key] ?? [])
  }

  return grouped
}

async function writeSupabaseBookings(event: any, data: BookingMap) {
  const supabase = getSupabaseConfig()
  if (!supabase) return false

  const { client, table } = supabase
  const rows = Object.entries(data).flatMap(([key, entries]) => {
    const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
    if (!match) return []
    const [, date, slot] = match as [string, string, string]
    return entries.map((entry) => ({
      id: entry.id,
      date,
      slot,
      name: entry.name,
      is_student: entry.isStudent,
      priority_level: entry.priorityLevel,
      created_at: entry.createdAt,
      status: entry.status,
    }))
  })

  const { error } = await client.from(table).upsert(rows, { onConflict: 'id' })
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return true
}

async function deleteSupabaseBookingRow(id: string) {
  const supabase = getSupabaseConfig()
  if (!supabase) return false
  const { client, table } = supabase
  const { error } = await client.from(table).delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return true
}

async function deleteSupabaseBookingsBefore(cutoffDate: string) {
  const supabase = getSupabaseConfig()
  if (!supabase) {
    return { removedKeys: [], remainingKeys: [] }
  }
  const { client, table } = supabase
  const { data, error } = await client.from(table).select('id,date,slot').lte('date', cutoffDate)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  const ids = (data || []).map((item: any) => item.id)
  if (ids.length === 0) {
    return { removedKeys: [], remainingKeys: [] }
  }
  const { error: deleteError } = await client.from(table).delete().in('id', ids)
  if (deleteError) {
    throw createError({ statusCode: 500, statusMessage: deleteError.message })
  }
  return { removedKeys: ids, remainingKeys: [] }
}

export async function readAllBookings(event: any) {
  const supabase = await readSupabaseBookings(event)
  if (supabase) return supabase

  if (!import.meta.dev) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured for production',
    })
  }

  const config = useRuntimeConfig()
  return readLocalStorage(config.localJsonStorageFile)
}

export async function writeAllBookings(event: any, data: BookingMap) {
  if (await writeSupabaseBookings(event, data)) return

  if (!import.meta.dev) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured for production',
    })
  }

  const config = useRuntimeConfig()
  await writeLocalStorage(config.localJsonStorageFile, data)
}

export async function listDayBookings(event: any, date: string) {
  const all = await readAllBookings(event)
  const slots = buildSlots()
  const results: BookingMap = {}

  for (const slot of slots) {
    results[slot] = sortEntries(all[storageKey(date, slot)] || [])
  }
  return results
}

export async function createBooking(event: any, input: { date: string; slot: string; name: string; isStudent: boolean }) {
  const now = new Date().toISOString()
  const key = storageKey(input.date, input.slot)
  const normalizedName = normalizeBookingName(input.name)
  const baseEntry: BookingEntry = {
    id: crypto.randomUUID(),
    date: input.date,
    slot: input.slot,
    name: normalizedName,
    isStudent: input.isStudent,
    priorityLevel: input.isStudent ? 'student' : 'normal',
    createdAt: now,
    status: 'active',
  }

  const store = await readAllBookings(event)
  const current = store[key] || []
  if (hasDuplicateBooking(current, normalizedName)) {
    throw createError({
      statusCode: 409,
      statusMessage: '该时段已存在同名预约',
      data: {
        duplicateSlots: [input.slot],
        date: input.date,
        name: normalizedName,
      },
    })
  }

  const nextEntries = [...(store[key] || []), baseEntry]
  store[key] = sortEntries(nextEntries)
  await writeAllBookings(event, store)
  return store[key]
}

export async function cancelBooking(event: any, input: { date: string; slot: string; id: string }) {
  const key = storageKey(input.date, input.slot)
  const store = await readAllBookings(event)
  const current = store[key] || []
  const target = current.find((entry) => entry.id === input.id)
  if (!target) {
    return current
  }

  const nextEntries = current.map((entry) =>
    entry.id === input.id
      ? {
          ...entry,
          status: 'canceled' as const,
        }
      : entry,
  )

  store[key] = sortEntries(nextEntries)
  await writeAllBookings(event, store)
  return store[key]
}

export async function restoreBooking(event: any, input: { date: string; slot: string; id: string }) {
  const key = storageKey(input.date, input.slot)
  const store = await readAllBookings(event)
  const current = store[key] || []
  const target = current.find((entry) => entry.id === input.id)
  if (!target) {
    return current
  }

  const nextEntries = current.map((entry) =>
    entry.id === input.id
      ? {
          ...entry,
          status: 'active' as const,
        }
      : entry,
  )

  store[key] = sortEntries(nextEntries)
  await writeAllBookings(event, store)
  return store[key]
}

export async function deleteBooking(event: any, input: { date: string; slot: string; id: string }) {
  const supabase = getSupabaseConfig()
  const key = storageKey(input.date, input.slot)
  const store = await readAllBookings(event)
  const current = store[key] || []
  const nextEntries = current.filter((entry) => entry.id !== input.id)

  if (nextEntries.length === current.length) {
    return current
  }

  if (supabase) {
    await deleteSupabaseBookingRow(input.id)
    if (nextEntries.length === 0) {
      delete store[key]
    } else {
      store[key] = sortEntries(nextEntries)
    }
    return store[key] || []
  }

  const ranked = sortEntries(nextEntries)
  if (ranked.length === 0) {
    delete store[key]
  } else {
    store[key] = ranked
  }
  await writeAllBookings(event, store)
  return ranked
}

export async function deleteBookingsBefore(event: any, cutoffDate: string) {
  const supabase = getSupabaseConfig()
  if (supabase) {
    return deleteSupabaseBookingsBefore(cutoffDate)
  }

  const store = await readAllBookings(event)
  const nextStore: BookingMap = {}

  for (const [key, value] of Object.entries(store)) {
    const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
    if (!match) {
      nextStore[key] = value
      continue
    }

    const [, date] = match as [string, string, string]
    if (date > cutoffDate) {
      nextStore[key] = value
    }
  }

  await writeAllBookings(event, nextStore)
  return {
    removedKeys: Object.keys(store).filter((key) => {
      const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
      if (!match) return false
      const [, date] = match as [string, string, string]
      return date <= cutoffDate
    }),
    remainingKeys: Object.keys(nextStore),
  }
}

export async function setBookingPriority(
  event: any,
  input: { date: string; slot: string; id: string; priorityLevel: BookingPriority },
) {
  const key = storageKey(input.date, input.slot)
  const store = await readAllBookings(event)
  const current = store[key] || []
  const target = current.find((entry) => entry.id === input.id)
  if (!target) {
    return current
  }

  const nextEntries = current.map((entry) =>
    entry.id === input.id
      ? {
          ...entry,
          priorityLevel: input.priorityLevel,
          isStudent: input.priorityLevel === 'student',
        }
      : entry,
  )

  store[key] = sortEntries(nextEntries)
  await writeAllBookings(event, store)
  return store[key]
}
