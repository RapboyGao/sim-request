<template>
  <Teleport to="body">
    <Transition name="booking-success">
      <div v-if="notice.open" class="booking-success" aria-live="polite" aria-modal="true" role="dialog">
        <div class="booking-success__backdrop" @click="goToPeople" />
        <div class="booking-success__panel">
          <div class="booking-success__header">
            <div class="booking-success__icon">
              <v-icon icon="mdi-check-circle-outline" size="34" color="primary" />
            </div>
            <div>
              <h2 class="booking-success__title">{{ t('home.success') }}</h2>
              <p class="booking-success__subtitle">{{ t('home.cancelRestoreHint') }}</p>
            </div>
          </div>

          <div class="booking-success__actions">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-account-group-outline" @click="goToPeople">
              {{ t('home.goToPeople') }}
            </v-btn>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { notice, hideBookingSuccessNotice } = useBookingSuccessNotice()

async function goToPeople() {
  const targetPath = notice.value.bookingId
    ? `${localePath('/people')}?focus=${encodeURIComponent(notice.value.bookingId)}`
    : localePath('/people')
  hideBookingSuccessNotice()
  await navigateTo(targetPath)
}
</script>

<style scoped>
.booking-success {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: grid;
  place-items: center;
  padding: 20px;
}

.booking-success__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 45%),
    linear-gradient(135deg, color-mix(in srgb, var(--bg) 88%, transparent), color-mix(in srgb, var(--surface) 96%, transparent));
  backdrop-filter: blur(10px) saturate(1.1);
}

.booking-success__panel {
  position: relative;
  width: min(92vw, 640px);
  padding: 26px 22px 20px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-variant) 84%, transparent));
  border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
  box-shadow: 0 24px 70px var(--shadow);
}

.booking-success__header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.booking-success__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  flex: 0 0 auto;
}

.booking-success__title {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--text);
}

.booking-success__subtitle {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.booking-success__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.booking-success-enter-active,
.booking-success-leave-active {
  transition: opacity 0.2s ease;
}

.booking-success-enter-from,
.booking-success-leave-to {
  opacity: 0;
}
</style>
