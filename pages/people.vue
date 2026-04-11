<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

        <div v-else>
          <div v-if="personSchedules.length === 0" class="empty-state">
            <v-icon icon="mdi-account-group-outline" size="28" class="mb-2" />
            <div>{{ t('people.empty') }}</div>
          </div>

          <div v-else class="person-grid">
            <v-card
              v-for="person in personSchedules"
              :key="person.name"
              :id="personCardId(person.rows)"
              class="person-card pa-4"
              :class="{
                'person-card--focus-pulse': pulsingCardId === personCardId(person.rows),
              }"
            >
              <div class="person-header">
                <div>
                  <div class="person-name">{{ person.name }}</div>
                  <div class="person-subtitle">
                    {{ person.rows.length }} {{ t('people.bookingCount') }}
                  </div>
                </div>
              </div>

              <div class="person-list mt-4">
                <div
                  v-for="row in person.rows"
                  :key="`${row.date}-${row.slot}-${row.id}`"
                  :id="row.id"
                  class="person-row"
                  :class="{ 'person-row--focus': focusId === row.id }"
                >
                  <div class="person-row-main">
                    <div class="person-row-title">
                      <span>{{ row.date }} {{ row.slot }}</span>
                      <v-icon :icon="statusMeta(row.status).icon" size="16" :color="statusMeta(row.status).color" class="person-status-icon" />
                    </div>
                    <div class="person-row-subtitle">
                      <v-icon :icon="priorityMeta(row.priorityLevel).icon" size="14" :color="priorityMeta(row.priorityLevel).color" class="mr-1" />
                      <span>{{ priorityMeta(row.priorityLevel).label }}</span>
                      <span class="mx-2">·</span>
                      <span>{{ formatTime(row.createdAt) }}</span>
                    </div>
                  </div>

                  <div class="person-row-action">
                    <v-menu location="end">
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          color="primary"
                          density="comfortable"
                          :aria-label="t('people.actions')"
                          v-bind="props"
                        />
                      </template>
                      <v-list density="compact" min-width="220">
                        <v-list-item
                          v-if="row.status !== 'canceled'"
                          :title="t('people.cancelBooking')"
                          prepend-icon="mdi-delete-outline"
                          @click="openActionDialog('cancel', row)"
                        />
                        <v-list-item
                          v-else
                          :title="t('people.restoreBooking')"
                          prepend-icon="mdi-backup-restore"
                          @click="openActionDialog('restore', row)"
                        />
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="actionDialog.open" max-width="520">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon
          :icon="actionDialog.mode === 'restore' ? 'mdi-backup-restore' : 'mdi-delete-alert-outline'"
          class="mr-2"
          :color="actionDialog.mode === 'restore' ? 'primary' : 'error'"
        />
        {{ actionDialog.mode === 'restore' ? t('people.confirmRestoreTitle') : t('people.confirmCancelTitle') }}
      </v-card-title>
      <v-card-text>
        {{ actionDialog.message }}
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="actionDialog.open = false">{{ t('people.cancel') }}</v-btn>
        <v-btn
          :color="actionDialog.mode === 'restore' ? 'primary' : 'error'"
          :loading="actionDialog.loading"
          @click="confirmAction"
        >
          {{ actionDialog.mode === 'restore' ? t('people.confirmRestore') : t('people.confirmCancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { PersonBookingRow } from '~/composables/usePersonSchedules'

const { t } = useI18n()
const route = useRoute()
const cutoff = computed(() => new Date(Date.now() - 4 * 60 * 60 * 1000))
const { data, pending, refresh } = await useFetch('/api/bookings')
const { personSchedules } = usePersonSchedules(computed(() => data.value?.bookings || null), cutoff)
const focusId = computed(() => typeof route.query.focus === 'string' ? route.query.focus : '')
const focusedCardId = computed(() => {
  if (!focusId.value) return ''
  return personSchedules.value.find((person) => person.rows.some((row) => row.id === focusId.value))?.rows[0]?.id || ''
})
const pulsingCardId = ref('')
let pulseTimer: ReturnType<typeof setTimeout> | undefined

type ActionMode = 'cancel' | 'restore'

const actionDialog = reactive({
  open: false,
  loading: false,
  message: '',
  mode: 'cancel' as ActionMode,
  row: null as PersonBookingRow | null,
})

function statusMeta(status: PersonBookingRow['status']) {
  if (status === 'confirmed') return { label: t('people.statusConfirmed'), color: 'primary', icon: 'mdi-check' }
  if (status === 'waitlist') return { label: t('people.statusWaitlist'), color: 'warning', icon: 'mdi-clock-outline' }
  return { label: t('people.statusCanceled'), color: 'secondary', icon: 'mdi-cancel' }
}

function priorityMeta(level: PersonBookingRow['priorityLevel']) {
  if (level === 'specified') return { label: t('admin.prioritySpecified'), color: 'primary', icon: 'mdi-arrow-collapse-up' }
  if (level === 'classmate') return { label: t('admin.priorityClassmate'), color: 'success', icon: 'mdi-school-outline' }
  return { label: t('admin.priorityNormal'), color: 'secondary', icon: 'mdi-account-outline' }
}

function openActionDialog(mode: ActionMode, row: PersonBookingRow) {
  actionDialog.mode = mode
  actionDialog.row = row
  actionDialog.message = mode === 'restore'
    ? `${t('people.confirmRestorePrefix')} ${row.date} ${row.slot}`
    : `${t('people.confirmCancelPrefix')} ${row.date} ${row.slot}`
  actionDialog.open = true
}

async function confirmAction() {
  if (!actionDialog.row) return
  actionDialog.loading = true
  try {
    const route = actionDialog.mode === 'restore' ? '/api/bookings/restore' : '/api/bookings/cancel'
    await $fetch(route, {
      method: 'POST',
      body: {
        date: actionDialog.row.date,
        slot: actionDialog.row.slot,
        id: actionDialog.row.id,
      },
    })
    actionDialog.open = false
    await refresh()
  } finally {
    actionDialog.loading = false
  }
}

watch([focusedCardId, pending], async ([id, isPending]) => {
  if (!id || isPending) return
  if (pulseTimer) clearTimeout(pulseTimer)
  pulsingCardId.value = id
  await nextTick()
  const target = document.getElementById(id)
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  pulseTimer = setTimeout(() => {
    pulsingCardId.value = ''
  }, 2600)
}, { immediate: true })

onBeforeUnmount(() => {
  if (pulseTimer) clearTimeout(pulseTimer)
})

function personCardId(rows: PersonBookingRow[]) {
  return rows[0]?.id || ''
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<style scoped>
.person-grid {
  display: grid;
  gap: 16px;
}

.person-card {
  border-radius: 24px;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04), 0 2px 10px rgba(15, 23, 42, 0.08);
}

.person-card--focus {
  outline: none;
}

.person-card--focus-pulse {
  animation: focusPulse 1.2s ease-out 0s 2;
  outline: 3px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 60%, transparent);
  outline-offset: 3px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, rgb(var(--v-theme-primary)) 22%, transparent),
    0 8px 24px color-mix(in srgb, rgb(var(--v-theme-primary)) 16%, transparent);
}

.person-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.person-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.person-subtitle {
  margin-top: 4px;
  font-size: 0.88rem;
  color: var(--muted);
}

.person-list {
  display: grid;
  gap: 10px;
}

.person-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 88%, var(--border));
  border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
}

.person-row-main {
  min-width: 0;
  flex: 1;
}

.person-row-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-weight: 600;
  color: var(--text);
}

.person-status-icon {
  margin-left: 8px;
  flex: 0 0 auto;
}

.person-row-subtitle {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--muted);
}

.person-row-action {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  align-self: center;
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

@keyframes focusPulse {
  0% {
    transform: scale(1);
    box-shadow:
      0 0 0 0 color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, transparent),
      0 8px 24px color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
  }
  50% {
    transform: scale(1.01);
    box-shadow:
      0 0 0 8px color-mix(in srgb, rgb(var(--v-theme-primary)) 8%, transparent),
      0 12px 30px color-mix(in srgb, rgb(var(--v-theme-primary)) 18%, transparent);
  }
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 0 color-mix(in srgb, rgb(var(--v-theme-primary)) 0%, transparent),
      0 8px 24px color-mix(in srgb, rgb(var(--v-theme-primary)) 12%, transparent);
  }
}
</style>
