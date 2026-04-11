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
                <span>{{ item.date }} {{ item.slotLabel }}</span>
                <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-check">
                  {{ item.confirmed.length }}/2
                </v-chip>
              </div>
              <div class="schedule-subtitle">
                <span>{{ t('calendar.confirmed') }} {{ item.confirmed.length }}</span>
                <span>{{ t('calendar.waitlist') }} {{ item.waitlist.length }}</span>
                <span>{{ t('calendar.canceled') }} {{ item.canceledRows.length }}</span>
                <span>{{ totalEntries(item) }} {{ t('calendar.bookingCount') }}</span>
              </div>

              <div class="schedule-detail">
                <div class="mb-3">
                  <div class="section-title">
                    <v-icon icon="mdi-check-decagram-outline" size="16" class="mr-1" />
                    {{ t('calendar.confirmedList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="entry in item.confirmed" :key="entry.key" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                          <v-icon v-if="entry.isStudent" icon="mdi-school-outline" size="14" color="success" />
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-menu location="end">
                          <template #activator="{ props }">
                            <v-btn
                              icon="mdi-delete-outline"
                              size="x-small"
                              variant="text"
                              color="error"
                              :aria-label="t('calendar.cancel')"
                              v-bind="props"
                            />
                          </template>
                          <v-list density="compact" min-width="220">
                            <v-list-item
                              v-for="slot in rowCancelSlots(item)"
                              :key="slot"
                              :title="`${t('calendar.cancelBooking')} ${slot}`"
                              prepend-icon="mdi-clock-outline"
                              @click="openCancelDialogForEntry(item, entry, [slot])"
                            />
                            <v-divider v-if="rowCancelSlots(item).length > 1" />
                            <v-list-item
                              v-if="rowCancelSlots(item).length > 1"
                              :title="t('calendar.cancelAllBookings')"
                              prepend-icon="mdi-delete-sweep-outline"
                              @click="openCancelDialogForEntry(item, entry)"
                            />
                          </v-list>
                        </v-menu>
                      </div>
                    </div>
                    <div v-if="item.confirmed.length === 0" class="text-medium-emphasis">{{ t('calendar.noneConfirmed') }}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="section-title">
                    <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                    {{ t('calendar.waitlistList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="entry in item.waitlist" :key="entry.key" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                          <v-icon v-if="entry.isStudent" icon="mdi-school-outline" size="14" color="success" />
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-menu location="end">
                          <template #activator="{ props }">
                            <v-btn
                              icon="mdi-delete-outline"
                              size="x-small"
                              variant="text"
                              color="error"
                              :aria-label="t('calendar.cancel')"
                              v-bind="props"
                            />
                          </template>
                          <v-list density="compact" min-width="220">
                            <v-list-item
                              v-for="slot in rowCancelSlots(item)"
                              :key="slot"
                              :title="`${t('calendar.cancelBooking')} ${slot}`"
                              prepend-icon="mdi-clock-outline"
                              @click="openCancelDialogForEntry(item, entry, [slot])"
                            />
                            <v-divider v-if="rowCancelSlots(item).length > 1" />
                            <v-list-item
                              v-if="rowCancelSlots(item).length > 1"
                              :title="t('calendar.cancelAllBookings')"
                              prepend-icon="mdi-delete-sweep-outline"
                              @click="openCancelDialogForEntry(item, entry)"
                            />
                          </v-list>
                        </v-menu>
                      </div>
                    </div>
                    <div v-if="item.waitlist.length === 0" class="text-medium-emphasis">{{ t('calendar.noneWaitlist') }}</div>
                  </div>
                </div>

                <div>
                  <div class="section-title">
                    <v-icon icon="mdi-cancel" size="16" class="mr-1" />
                    {{ t('calendar.canceledList') }}
                  </div>
                  <div class="compact-list">
                    <div v-for="(entry, index) in item.canceledRows" :key="entry.key" class="compact-row">
                      <div class="entry-main">
                        <div class="entry-name-line">
                          <span>{{ entry.name }}</span>
                        </div>
                        <span class="entry-time">{{ formatTimeLabel(entry.createdAt) }}</span>
                      </div>
                      <div class="row-actions">
                        <v-menu location="end">
                          <template #activator="{ props }">
                            <v-btn
                              icon="mdi-backup-restore"
                              size="x-small"
                              variant="text"
                              color="primary"
                              :aria-label="t('calendar.restore')"
                              v-bind="props"
                            />
                          </template>
                          <v-list density="compact" min-width="220">
                            <v-list-item
                              v-for="slot in rowRestoreSlots(item)"
                              :key="slot"
                              :title="`${t('calendar.restoreBooking')} ${slot}`"
                              @click="openRestoreDialog(item, entry, [slot])"
                            >
                              <template #prepend>
                                <v-icon icon="mdi-clock-outline" />
                              </template>
                            </v-list-item>
                            <v-divider v-if="rowRestoreSlots(item).length > 1" />
                            <v-list-item
                              v-if="rowRestoreSlots(item).length > 1"
                              :title="t('calendar.restoreAllBookings')"
                              @click="openRestoreDialog(item, entry)"
                            >
                              <template #prepend>
                                <v-icon icon="mdi-backup-restore" />
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                    </div>
                    <div v-if="item.canceledRows.length === 0" class="text-medium-emphasis">{{ t('calendar.noneCanceled') }}</div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="cancelDialog.open" max-width="520">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          :icon="cancelDialog.mode === 'restore' ? 'mdi-restore-alert-outline' : 'mdi-delete-alert-outline'"
          class="mr-2"
          :color="cancelDialog.mode === 'restore' ? 'primary' : 'error'"
        />
        {{ cancelDialog.mode === 'restore' ? t('calendar.confirmRestoreTitle') : t('calendar.confirmCancelTitle') }}
      </v-card-title>
      <v-card-text>
        {{ cancelDialog.message }}
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="cancelDialog.open = false">{{ t('calendar.cancel') }}</v-btn>
        <v-btn
          :color="cancelDialog.mode === 'restore' ? 'primary' : 'error'"
          :loading="cancelDialog.loading"
          @click="confirmCancel"
        >
          {{ cancelDialog.mode === 'restore' ? t('calendar.confirmRestore') : t('calendar.confirmCancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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

type DisplayEntry = {
  key: string
  name: string
  isStudent: boolean
  createdAt: string
  targets: Array<{ date: string; slot: string; id: string; label: string }>
}

type FlatSchedule = {
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
  return groupedSchedules.value.flatMap((day) => {
    const merged: FlatSchedule[] = []

    for (const slot of day.slots) {
      const last = merged.at(-1)
      if (
        last
        && last.date === day.date
        && canMergeSlots(last, slot)
      ) {
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
      const key = `${entry.name}|${entry.isStudent ? '1' : '0'}|${entry.status}`
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
          isStudent: entry.isStudent,
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
    if (left.isStudent !== right.isStudent) return left.isStudent ? -1 : 1
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
    .map((entry) => `${entry.name}|${entry.isStudent ? '1' : '0'}|${entry.status}`)
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

function totalEntries(item: FlatSchedule) {
  return item.segments.reduce((sum, segment) => sum + segment.active.length + segment.canceled.length, 0)
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

type CancelDialogTarget = {
  date: string
  slot: string
  label: string
  ids: string[]
}

const cancelDialog = reactive({
  open: false,
  loading: false,
  message: '',
  mode: 'cancel' as 'cancel' | 'restore',
  targets: [] as CancelDialogTarget[],
})

function openCancelDialog(payload: { item: FlatSchedule; targets: CancelDialogTarget[]; mode?: 'cancel' | 'restore' }) {
  cancelDialog.targets = payload.targets
  cancelDialog.mode = payload.mode || 'cancel'
  const labels = payload.targets.map((target) => target.label)
  const scope = labels.length > 1
    ? `${payload.item.date} ${payload.item.slotLabel}：${labels.join('，')}`
    : `${payload.item.date} ${labels[0] || payload.item.slotLabel}`
  cancelDialog.message = cancelDialog.mode === 'restore'
    ? `确认恢复这些预约记录：${scope}`
    : `确认取消这些预约记录：${scope}`
  cancelDialog.open = true
}

function openCancelDialogForEntry(
  item: FlatSchedule,
  rowEntry: DisplayEntry,
  targetSlots?: string[],
) {
  const slots = targetSlots && targetSlots.length > 0 ? targetSlots : item.sourceSlots
  const targets = slots.flatMap((slot) => {
    const matched = rowEntry.targets.filter((target) => target.slot === slot)
    if (matched.length === 0) return []
    return [{
      date: item.date,
      slot,
      label: slot,
      ids: matched.map((target) => target.id),
    }]
  })

  if (targets.length === 0) return

  openCancelDialog({ item, targets, mode: 'cancel' })
}

function rowCancelSlots(item: FlatSchedule) {
  return [...new Set(item.sourceSlots)]
}

function rowRestoreSlots(item: FlatSchedule) {
  return [...new Set(item.sourceSlots)]
}

async function confirmCancel() {
  cancelDialog.loading = true
  try {
    const endpoint = cancelDialog.mode === 'restore' ? '/api/bookings/restore' : '/api/bookings/cancel'
    for (const target of cancelDialog.targets) {
      for (const id of target.ids) {
        await $fetch(endpoint, {
          method: 'POST',
          body: {
            date: target.date,
            slot: target.slot,
            id,
          },
        })
      }
    }
    cancelDialog.open = false
    cancelDialog.targets = []
    await refresh()
  } finally {
    cancelDialog.loading = false
  }
}

function openRestoreDialog(item: FlatSchedule, rowEntry: DisplayEntry, targetSlots?: string[]) {
  const slots = targetSlots && targetSlots.length > 0 ? targetSlots : item.sourceSlots
  const targets = slots.flatMap((slot) => {
    const matched = rowEntry.targets.filter((target) => target.slot === slot)
    if (matched.length === 0) return []
    return [{
      date: item.date,
      slot,
      label: slot,
      ids: matched.map((target) => target.id),
    }]
  })

  if (targets.length === 0) return

  openCancelDialog({
    item,
    mode: 'restore',
    targets,
  })
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
