<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="9" xl="8">
        <v-card class="pa-5 mb-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <p class="eyebrow">预约日历</p>
              <h1 class="text-h5 mb-1">查看某天各时段状态</h1>
            </div>
          </div>

          <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field
                :model-value="displayDate"
                label="选择日期"
                readonly
                append-inner-icon="mdi-calendar"
                v-bind="props"
              />
            </template>
            <v-date-picker
              :model-value="selectedDate"
              color="primary"
              @update:model-value="onDateSelected"
            />
          </v-menu>
        </v-card>

        <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

        <v-card v-else class="pa-5">
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-chip color="primary" variant="tonal">已确认 {{ confirmedTotal }}</v-chip>
            <v-chip color="secondary" variant="tonal">候补 {{ waitlistTotal }}</v-chip>
          </div>

          <v-expansion-panels>
            <v-expansion-panel v-for="item in summaries" :key="item.slot">
              <v-expansion-panel-title>
                <div class="d-flex align-center justify-space-between w-100">
                  <span>{{ item.slot }}</span>
                  <v-chip size="small" color="primary" variant="tonal">确认 {{ item.confirmed.length }}/2</v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="mb-3">
                  <div class="section-title">确认名单</div>
                  <div class="compact-list">
                    <div v-for="entry in item.confirmed" :key="entry.id" class="compact-row">
                      <span>{{ entry.name }}</span>
                      <v-chip v-if="entry.isStudent" size="x-small" color="secondary" variant="tonal">同学</v-chip>
                    </div>
                    <div v-if="item.confirmed.length === 0" class="text-medium-emphasis">暂无确认预约</div>
                  </div>
                </div>

                <div>
                  <div class="section-title">候补名单</div>
                  <div class="compact-list">
                    <div v-for="entry in item.waitlist" :key="entry.id" class="compact-row">
                      <span>{{ entry.name }}</span>
                      <v-chip v-if="entry.isStudent" size="x-small" color="secondary" variant="tonal">同学</v-chip>
                    </div>
                    <div v-if="item.waitlist.length === 0" class="text-medium-emphasis">暂无候补</div>
                  </div>
                </div>
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

const slots = buildSlots()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const dateMenu = ref(false)

const { data, pending, refresh } = await useFetch('/api/bookings', {
  query: computed(() => ({ date: selectedDate.value })),
})

watch(selectedDate, async () => {
  await refresh()
})

const summaries = computed<SlotSummary[]>(() => {
  const payload = data.value
  if (!payload) return []
  return slots.map((slot) => {
    const entries = (payload.bookings[slot] || []) as BookingEntry[]
    return {
      slot,
      confirmed: entries.filter((entry) => entry.status === 'confirmed'),
      waitlist: entries.filter((entry) => entry.status === 'waitlist'),
    }
  })
})

const confirmedTotal = computed(() => summaries.value.reduce((sum, item) => sum + item.confirmed.length, 0))
const waitlistTotal = computed(() => summaries.value.reduce((sum, item) => sum + item.waitlist.length, 0))

const displayDate = computed(() => formatDateLabel(selectedDate.value))

function onDateSelected(value: unknown) {
  selectedDate.value = normalizeDate(value) || selectedDate.value
  dateMenu.value = false
}

function normalizeDate(value: unknown) {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? '' : toDateInputValue(parsed)
  }
  if (value instanceof Date) {
    return toDateInputValue(value)
  }
  return ''
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateLabel(value: string) {
  const parts = value.split('-')
  if (parts.length !== 3) return value
  return `${parts[0]}年${parts[1]}月${parts[2]}日`
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
</style>
