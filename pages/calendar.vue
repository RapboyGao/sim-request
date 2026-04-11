<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="9" xl="8">
        <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

        <div v-else>
          <div v-if="flatSchedules.length === 0" class="empty-state">
            <v-icon icon="mdi-calendar-remove-outline" size="28" class="mb-2" />
            <div>{{ t('calendar.empty') }}</div>
          </div>

          <div v-else class="schedule-grid">
            <CalendarScheduleCard
              v-for="item in flatSchedules"
              :key="`${item.date}-${item.slot}`"
              :item="item"
              @cancel="openCancelDialogForEntry(item, $event.entry, $event.slots)"
              @restore="openRestoreDialog(item, $event.entry, $event.slots)"
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="cancelDialog.open" max-width="520">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          :icon="cancelDialog.mode === 'restore' ? 'mdi-backup-restore' : 'mdi-delete-alert-outline'"
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
import type { FlatSchedule } from '~/composables/useCalendarSchedules'

const { t } = useI18n()
const cutoff = computed(() => new Date(Date.now() - 4 * 60 * 60 * 1000))
const { data, pending, refresh } = await useFetch('/api/bookings')
const { flatSchedules } = useCalendarSchedules(computed(() => data.value?.bookings || null), cutoff)

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
  rowEntry: { key: string; targets: FlatSchedule['confirmed'][number]['targets'] },
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

function openRestoreDialog(
  item: FlatSchedule,
  rowEntry: { key: string; targets: FlatSchedule['canceledRows'][number]['targets'] },
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

  openCancelDialog({ item, targets, mode: 'restore' })
}

async function confirmCancel() {
  cancelDialog.loading = true
  try {
    const route = cancelDialog.mode === 'restore'
      ? '/api/bookings/restore'
      : '/api/bookings/cancel'
    for (const target of cancelDialog.targets) {
      await Promise.all(target.ids.map((id) => $fetch(route, {
        method: 'POST',
        body: {
          date: target.date,
          slot: target.slot,
          id,
        },
      })))
    }
    cancelDialog.open = false
    await refresh()
  } finally {
    cancelDialog.loading = false
  }
}
</script>

<style scoped>
.schedule-grid {
  display: grid;
  gap: 16px;
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
