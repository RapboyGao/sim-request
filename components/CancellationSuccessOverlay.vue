<template>
  <Teleport to="body">
    <Transition name="cancel-notice">
      <div v-if="notice.open" class="cancel-notice" aria-live="polite" aria-modal="true" role="dialog">
        <div class="cancel-notice__backdrop" @click="hideCancellationNotice" />
        <div class="cancel-notice__panel">
          <div class="cancel-notice__header">
            <div class="cancel-notice__icon">
              <v-icon icon="mdi-check-circle-outline" size="34" color="primary" />
            </div>
            <div>
              <h2 class="cancel-notice__title">{{ t('calendar.cancelSuccessTitle') }}</h2>
              <p class="cancel-notice__subtitle">{{ t('calendar.cancelSuccessSubtitle') }}</p>
            </div>
          </div>

          <div class="cancel-notice__list">
            <div v-for="item in notice.items" :key="item.id" class="cancel-notice__item">
              <div class="cancel-notice__item-head">
                <div class="cancel-notice__name">{{ displayBookingName(item.name) }}</div>
                <v-icon
                  :icon="priorityMeta(item.priorityLevel).icon"
                  :color="priorityMeta(item.priorityLevel).color"
                  size="16"
                />
              </div>
              <div class="cancel-notice__slots">
                <v-chip
                  v-for="label in slotLabels(item)"
                  :key="label"
                  size="small"
                  variant="tonal"
                  color="primary"
                >
                  {{ label }}
                </v-chip>
              </div>
            </div>
          </div>

          <div class="cancel-notice__actions">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-check" @click="hideCancellationNotice">
              {{ t('calendar.cancelSuccessDismiss') }}
            </v-btn>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { BookingPriority } from '~/types/booking'
import { formatMergedSlotLabels } from '~/utils/slots'
import { displayStoredBookingName as displayBookingName } from '~/utils/booking-name'

const { t } = useI18n()
const { notice, hideCancellationNotice } = useCancellationNotice()

function slotLabels(item: { date: string; slots: string[] }) {
  return formatMergedSlotLabels(item.date, item.slots)
}

function priorityMeta(level: BookingPriority) {
  if (level === 'specified') return { color: 'primary', icon: 'mdi-arrow-collapse-up' }
  if (level === 'classmate') return { color: 'success', icon: 'mdi-school-outline' }
  return { color: 'secondary', icon: 'mdi-account-outline' }
}
</script>

<style scoped>
.cancel-notice {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: grid;
  place-items: center;
  padding: 20px;
}

.cancel-notice__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 45%),
    linear-gradient(135deg, color-mix(in srgb, var(--bg) 88%, transparent), color-mix(in srgb, var(--surface) 96%, transparent));
  backdrop-filter: blur(10px) saturate(1.1);
}

.cancel-notice__panel {
  position: relative;
  width: min(92vw, 720px);
  max-height: min(88vh, 760px);
  overflow: auto;
  padding: 26px 22px 20px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-variant) 84%, transparent));
  border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
  box-shadow: 0 24px 70px var(--shadow);
}

.cancel-notice__header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cancel-notice__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  flex: 0 0 auto;
}

.cancel-notice__title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--text);
}

.cancel-notice__subtitle {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.cancel-notice__list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.cancel-notice__item {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  background: color-mix(in srgb, var(--surface) 90%, var(--border));
}

.cancel-notice__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cancel-notice__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.cancel-notice__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.cancel-notice__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.cancel-notice-enter-active,
.cancel-notice-leave-active {
  transition: opacity 0.2s ease;
}

.cancel-notice-enter-from,
.cancel-notice-leave-to {
  opacity: 0;
}

</style>
