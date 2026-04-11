<template>
  <v-card class="schedule-card pa-4">
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
      <span>{{ totalEntries }} {{ t('calendar.bookingCount') }}</span>
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
                <v-icon v-if="entry.priorityLevel === 'specified'" icon="mdi-arrow-collapse-up" size="14" color="primary" />
                <v-icon v-if="entry.priorityLevel === 'classmate'" icon="mdi-school-outline" size="14" color="success" />
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
                    v-for="slot in cancelSlots"
                    :key="slot"
                    :title="`${t('calendar.cancelBooking')} ${slot}`"
                    prepend-icon="mdi-clock-outline"
                    @click="openCancel(entry, [slot])"
                  />
                  <v-divider v-if="cancelSlots.length > 1" />
                  <v-list-item
                    v-if="cancelSlots.length > 1"
                    :title="t('calendar.cancelAllBookings')"
                    prepend-icon="mdi-delete-sweep-outline"
                    @click="openCancel(entry)"
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
                <v-icon v-if="entry.priorityLevel === 'specified'" icon="mdi-arrow-collapse-up" size="14" color="primary" />
                <v-icon v-if="entry.priorityLevel === 'classmate'" icon="mdi-school-outline" size="14" color="success" />
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
                    v-for="slot in cancelSlots"
                    :key="slot"
                    :title="`${t('calendar.cancelBooking')} ${slot}`"
                    prepend-icon="mdi-clock-outline"
                    @click="openCancel(entry, [slot])"
                  />
                  <v-divider v-if="cancelSlots.length > 1" />
                  <v-list-item
                    v-if="cancelSlots.length > 1"
                    :title="t('calendar.cancelAllBookings')"
                    prepend-icon="mdi-delete-sweep-outline"
                    @click="openCancel(entry)"
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
          <div v-for="entry in item.canceledRows" :key="entry.key" class="compact-row">
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
                    v-for="slot in restoreSlots"
                    :key="slot"
                    :title="`${t('calendar.restoreBooking')} ${slot}`"
                    @click="openRestore(entry, [slot])"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-clock-outline" />
                    </template>
                  </v-list-item>
                  <v-divider v-if="restoreSlots.length > 1" />
                  <v-list-item
                    v-if="restoreSlots.length > 1"
                    :title="t('calendar.restoreAllBookings')"
                    @click="openRestore(entry)"
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
        <div class="hint-row text-caption text-medium-emphasis mt-1 mb-2">
          <span class="hint-bullet">•</span>
          <span>{{ t('calendar.canceledHint') }}</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { FlatSchedule } from '~/composables/useCalendarSchedules'

const { t } = useI18n()

const props = defineProps<{
  item: FlatSchedule
}>()

const emit = defineEmits<{
  cancel: [payload: { entry: { key: string; targets: FlatSchedule['confirmed'][number]['targets'] }; slots?: string[] }]
  restore: [payload: { entry: { key: string; targets: FlatSchedule['canceledRows'][number]['targets'] }; slots?: string[] }]
}>()

const cancelSlots = computed(() => [...new Set(props.item.sourceSlots)])
const restoreSlots = computed(() => [...new Set(props.item.sourceSlots)])
const totalEntries = computed(() => props.item.segments.reduce((sum, segment) => sum + segment.active.length + segment.canceled.length, 0))

function openCancel(entry: FlatSchedule['confirmed'][number] | FlatSchedule['waitlist'][number], slots?: string[]) {
  emit('cancel', { entry, slots })
}

function openRestore(entry: FlatSchedule['canceledRows'][number], slots?: string[]) {
  emit('restore', { entry, slots })
}

function formatTimeLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<style scoped>
.schedule-card {
  border-radius: 24px;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 2px 10px rgba(15, 23, 42, 0.08);
}

.schedule-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.schedule-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
  font-size: 0.88rem;
  color: var(--muted);
}

.schedule-detail {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--primary-strong);
  margin-bottom: 8px;
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
}

.entry-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.entry-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.98rem;
}

.entry-time {
  font-size: 0.78rem;
  color: var(--muted);
}

.row-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}
</style>
