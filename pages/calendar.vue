<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="9" xl="8">

        <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

        <div v-else>
          <div v-if="groupedSchedules.length === 0" class="empty-state">
            <v-icon icon="mdi-calendar-remove-outline" size="28" class="mb-2" />
            <div>{{ t('calendar.empty') }}</div>
          </div>

          <div v-else class="schedule-grid">
            <v-card
              v-for="item in flatSchedules"
              :key="`${item.date}-${item.slot}`"
              class="schedule-card pa-4"
            >
              <div class="schedule-title">
                <span>{{ item.date }} {{ item.slot }}</span>
                <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-check">
                  {{ splitActiveEntries(item.active).confirmed.length }}/2
                </v-chip>
              </div>
              <div class="schedule-subtitle">
                <span>{{ t('calendar.confirmed') }} {{ splitActiveEntries(item.active).confirmed.length }}</span>
                <span>{{ t('calendar.waitlist') }} {{ splitActiveEntries(item.active).waitlist.length }}</span>
                <span>{{ t('calendar.canceled') }} {{ item.canceled.length }}</span>
                <span>{{ item.active.length + item.canceled.length }} {{ t('calendar.bookingCount') }}</span>
              </div>

              <div class="schedule-detail">
                <div class="mb-3">
                  <div class="section-title">
                    <v-icon icon="mdi-check-decagram-outline" size="16" class="mr-1" />
                    {{ t('calendar.confirmedList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="entry in splitActiveEntries(item.active).confirmed" :key="entry.id" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                          <v-icon v-if="entry.isStudent" icon="mdi-school-outline" size="14" color="success" />
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-btn size="x-small" variant="text" color="secondary" prepend-icon="mdi-close" @click="cancelEntry(item.date, item.slot, entry.id)">
                          {{ t('calendar.cancel') }}
                        </v-btn>
                      </div>
                    </div>
                    <div v-if="splitActiveEntries(item.active).confirmed.length === 0" class="text-medium-emphasis">{{ t('calendar.noneConfirmed') }}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="section-title">
                    <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                    {{ t('calendar.waitlistList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="entry in splitActiveEntries(item.active).waitlist" :key="entry.id" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                          <v-icon v-if="entry.isStudent" icon="mdi-school-outline" size="14" color="success" />
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-btn size="x-small" variant="text" color="secondary" prepend-icon="mdi-close" @click="cancelEntry(item.date, item.slot, entry.id)">
                          {{ t('calendar.cancel') }}
                        </v-btn>
                      </div>
                    </div>
                    <div v-if="splitActiveEntries(item.active).waitlist.length === 0" class="text-medium-emphasis">{{ t('calendar.noneWaitlist') }}</div>
                  </div>
                </div>

                <div>
                  <div class="section-title">
                    <v-icon icon="mdi-cancel" size="16" class="mr-1" />
                    {{ t('calendar.canceledList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="entry in item.canceled" :key="entry.id" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-restore" @click="restoreEntry(item.date, item.slot, entry.id)">
                          {{ t('calendar.restore') }}
                        </v-btn>
                      </div>
                    </div>
                    <div v-if="item.canceled.length === 0" class="text-medium-emphasis">{{ t('calendar.noneCanceled') }}</div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { BookingEntry, SlotSummary } from '~/types/booking'

const { t } = useI18n()

const cutoff = computed(() => new Date(Date.now() - 4 * 60 * 60 * 1000))
const { data, pending, refresh } = await useFetch('/api/bookings')

type DaySummary = {
  date: string
  slots: SlotSummary[]
  total: number
}

type FlatSchedule = {
  date: string
  slot: string
  active: BookingEntry[]
  canceled: BookingEntry[]
}

type RawSchedule = {
  date: string
  slot: string
  entries: BookingEntry[]
}

const groupedSchedules = computed<DaySummary[]>(() => {
  const payload = data.value
  if (!payload) return []

  const entries = Object.entries(payload.bookings || {})
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
  return groupedSchedules.value.flatMap((day) =>
    day.slots.map((slot) => ({
      date: day.date,
      slot: slot.slot,
      active: slot.active,
      canceled: slot.canceled || [],
    })),
  )
})

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

function formatTimeLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function sortActiveEntries(entries: BookingEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.isStudent !== right.isStudent) return left.isStudent ? -1 : 1
    return left.createdAt.localeCompare(right.createdAt)
  })
}

function splitActiveEntries(entries: BookingEntry[]) {
  const sorted = sortActiveEntries(entries)
  return {
    confirmed: sorted.slice(0, 2),
    waitlist: sorted.slice(2),
  }
}

async function cancelEntry(date: string, slot: string, id: string) {
  await $fetch('/api/bookings/cancel', {
    method: 'POST',
    body: { date, slot, id },
  })
  await refresh()
}

async function restoreEntry(date: string, slot: string, id: string) {
  await $fetch('/api/bookings/restore', {
    method: 'POST',
    body: { date, slot, id },
  })
  await refresh()
}

</script>

<style scoped>
.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-strong);
  margin-bottom: 0.4rem;
}

.compact-list {
  display: grid;
  gap: 0.5rem;
}

.compact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  background: var(--surface-elevated);
}

.entry-main {
  display: grid;
  gap: 0.15rem;
}

.entry-name-line {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.entry-time {
  font-size: 0.78rem;
  color: var(--muted);
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-self: center;
}

.schedule-grid {
  display: grid;
  gap: 0.75rem;
}

.schedule-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-elevated);
}

.schedule-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.schedule-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.schedule-detail {
  margin-top: 0.75rem;
}

.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: var(--muted);
  text-align: center;
}
</style>
