import { promises as fs } from 'node:fs'
import path from 'node:path'
import { buildSlots } from '~/utils/slots'
import type { BookingEntry } from '~/types/booking'

type BookingMap = Record<string, BookingEntry[]>

function storageKey(date: string, slot: string) {
  return `bookings:${date}:${slot}`
}

function getRuntimeKv(event: any) {
  if (import.meta.dev) return null
  const config = useRuntimeConfig()
  const env = event?.context?.env || event?.context?.cloudflare?.env || null
  if (!env) return null
  return env[config.bookingKvBinding] || env
}

function sortEntries(entries: BookingEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.isStudent !== b.isStudent) return a.isStudent ? -1 : 1
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function computeRankedEntries(entries: BookingEntry[]): BookingEntry[] {
  return sortEntries(entries).map((entry, index) => ({
    ...entry,
    rank: index + 1,
    status: index < 2 ? 'confirmed' : 'waitlist',
  }))
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

export async function readAllBookings(event: any) {
  const kv = getRuntimeKv(event)
  const config = useRuntimeConfig()

  if (kv?.get) {
    const keys = await listKnownKeys(event)
    const entries = await Promise.all(
      keys.map(async (key: string) => {
        const value = await kv.get(key, 'json')
        return [key, (value || []) as BookingEntry[]]
      }),
    )
    return Object.fromEntries(entries) as BookingMap
  }

  return readLocalStorage(config.localJsonStorageFile)
}

export async function writeAllBookings(event: any, data: BookingMap) {
  const kv = getRuntimeKv(event)
  const config = useRuntimeConfig()

  if (kv?.set) {
    await Promise.all(
      Object.entries(data).map(([key, value]) => kv.set(key, value)),
    )
    return
  }

  await writeLocalStorage(config.localJsonStorageFile, data)
}

async function listKnownKeys(event: any) {
  const config = useRuntimeConfig()
  const kv = getRuntimeKv(event)
  if (kv?.list) {
    const result = await kv.list({ prefix: 'bookings:' })
    return (result?.keys || []).map((item: any) => item.name)
  }
  const local = await readLocalStorage(config.localJsonStorageFile)
  return Object.keys(local)
}

export async function listDayBookings(event: any, date: string) {
  const all = await readAllBookings(event)
  const slots = buildSlots()
  const results: BookingMap = {}

  for (const slot of slots) {
    results[slot] = computeRankedEntries(all[storageKey(date, slot)] || [])
  }
  return results
}

export async function createBooking(event: any, input: { date: string; slot: string; name: string; isStudent: boolean }) {
  const now = new Date().toISOString()
  const key = storageKey(input.date, input.slot)
  const baseEntry: BookingEntry = {
    id: crypto.randomUUID(),
    date: input.date,
    slot: input.slot,
    name: input.name.trim(),
    isStudent: input.isStudent,
    createdAt: now,
    status: 'waitlist',
    rank: 0,
  }

  const store = await readAllBookings(event)
  const ranked = computeRankedEntries([...(store[key] || []), baseEntry])
  store[key] = ranked
  await writeAllBookings(event, store)
  return ranked
}
