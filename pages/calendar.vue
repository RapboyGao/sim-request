<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="9" xl="8">
        <v-card class="pa-5 mb-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <p class="eyebrow">{{ t('calendar.eyebrow') }}</p>
              <h1 class="text-h5 mb-1">{{ t('calendar.title') }}</h1>
            </div>
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-clock-outline">
              {{ cutoffLabel }}
            </v-chip>
          </div>
        </v-card>

        <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

        <v-card v-else class="pa-5">
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip color="primary" variant="tonal" prepend-icon="mdi-check-circle-outline">
              {{ t('calendar.confirmed') }} {{ confirmedTotal }}
            </v-chip>
            <v-chip color="secondary" variant="tonal" prepend-icon="mdi-timer-sand">
              {{ t('calendar.waitlist') }} {{ waitlistTotal }}
            </v-chip>
          </div>

          <div v-if="groupedSchedules.length === 0" class="empty-state">
            <v-icon icon="mdi-calendar-remove-outline" size="28" class="mb-2" />
            <div>{{ t('calendar.empty') }}</div>
          </div>

          <v-expansion-panels v-else>
            <v-expansion-panel v-for="day in groupedSchedules" :key="day.date">
              <v-expansion-panel-title>
                <div class="d-flex align-center justify-space-between w-100">
                  <span>{{ formatDateLabel(day.date) }}</span>
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ day.total }} {{ t('calendar.bookingCount') }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel v-for="item in day.slots" :key="item.slot">
                    <v-expansion-panel-title>
                      <div class="d-flex align-center justify-space-between w-100">
                        <span>{{ item.slot }}</span>
                        <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-check">
                          {{ item.confirmed.length }}/2
                        </v-chip>
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="mb-3">
                        <div class="section-title">
                          <v-icon icon="mdi-check-decagram-outline" size="16" class="mr-1" />
                          {{ t('calendar.confirmedList') }}
                        </div>
                        <div class="compact-list">
                          <div v-for="entry in item.confirmed" :key="entry.id" class="compact-row">
                            <span>{{ entry.name }}</span>
                            <v-chip v-if="entry.isStudent" size="x-small" color="secondary" variant="tonal" prepend-icon="mdi-school-outline">同学</v-chip>
                          </div>
                          <div v-if="item.confirmed.length === 0" class="text-medium-emphasis">{{ t('calendar.noneConfirmed') }}</div>
                        </div>
                      </div>

                      <div>
                        <div class="section-title">
                          <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                          {{ t('calendar.waitlistList') }}
                        </div>
                        <div class="compact-list">
                          <div v-for="entry in item.waitlist" :key="entry.id" class="compact-row">
                            <span>{{ entry.name }}</span>
                            <v-chip v-if="entry.isStudent" size="x-small" color="secondary" variant="tonal" prepend-icon="mdi-school-outline">同学</v-chip>
                          </div>
                          <div v-if="item.waitlist.length === 0" class="text-medium-emphasis">{{ t('calendar.noneWaitlist') }}</div>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { BookingEntry, SlotSummary } from '~/types/booking'
import { buildSlots } from '~/utils/slots'

const { t } = useI18n()
const slots = buildSlots()

const cutoff = computed(() => new Date(Date.now() - 4 * 60 * 60 * 1000))
const cutoffLabel = computed(() => formatDateTimeLabel(cutoff.value))

const { data, pending } = await useFetch('/api/bookings')

type DaySummary = {
  date: string
  slots: SlotSummary[]
  total: number
}

const groupedSchedules = computed<DaySummary[]>(() => {
  const payload = data.value
  if (!payload) return []

  const entries = Object.entries(payload.bookings || {})
    .flatMap(([key, value]) => {
      const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
      if (!match) return []
      const [, date, slot] = match
      const booked = (value as BookingEntry[]) || []
      const slotEnd = toSlotEnd(date, slot)
      if (booked.length === 0 || slotEnd < cutoff.value) return []
      return [{ date, slot, entries: booked }]
    })
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date)
      return byDate !== 0 ? byDate : a.slot.localeCompare(b.slot)
    })

  const grouped = new Map<string, DaySummary>()
  for (const item of entries) {
    const confirmed = item.entries.filter((entry) => entry.status === 'confirmed')
    const waitlist = item.entries.filter((entry) => entry.status === 'waitlist')
    if (!grouped.has(item.date)) {
      grouped.set(item.date, { date: item.date, slots: [], total: 0 })
    }
    const day = grouped.get(item.date)!
    day.slots.push({ slot: item.slot, confirmed, waitlist })
    day.total += item.entries.length
  }

  return [...grouped.values()]
})

const confirmedTotal = computed(() => groupedSchedules.value.reduce((sum, day) => sum + day.slots.reduce((slotSum, item) => slotSum + item.confirmed.length, 0), 0))
const waitlistTotal = computed(() => groupedSchedules.value.reduce((sum, day) => sum + day.slots.reduce((slotSum, item) => slotSum + item.waitlist.length, 0), 0))

function toSlotEnd(date: string, slot: string) {
  const [start] = slot.split('-')
  const [hours, minutes] = start.split(':').map(Number)
  const [year, month, day] = date.split('-').map(Number)
  const startDate = new Date(year, month - 1, day, hours, minutes || 0, 0, 0)
  return new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
}

function formatDateLabel(value: string) {
  const parts = value.split('-')
  if (parts.length !== 3) return value
  return `${parts[0]}年${parts[1]}月${parts[2]}日`
}

function formatDateTimeLabel(value: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`
}
</script>

<style scoped>
.eyebrow {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

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
  background: rgba(255, 255, 255, 0.65);
}

.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: rgba(0, 0, 0, 0.55);
  text-align: center;
}
</style>
