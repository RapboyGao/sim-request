<template>
  <div class="booking-name-display" :class="`booking-name-display--${variant}`">
    <div class="booking-name-display__name">{{ parsed.name }}</div>
    <div v-if="parsed.phone" class="booking-name-display__phone">{{ parsed.phone }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseStoredBookingName } from '~/utils/booking-name'

const props = withDefaults(defineProps<{
  value: string
  variant?: 'default' | 'table' | 'compact'
}>(), {
  variant: 'default',
})

const parsed = computed(() => parseStoredBookingName(props.value))
</script>

<style scoped>
.booking-name-display {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  min-width: 0;
}

.booking-name-display__name {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  word-break: break-word;
}

.booking-name-display__phone {
  color: var(--muted);
  font-size: 0.86rem;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.02em;
  word-break: break-all;
}

.booking-name-display--table .booking-name-display__name {
  font-weight: 650;
  font-size: 0.95rem;
}

.booking-name-display--compact .booking-name-display__name {
  font-size: 0.94rem;
}

.booking-name-display--compact .booking-name-display__phone {
  font-size: 0.74rem;
}

.booking-name-display--table .booking-name-display__phone {
  font-size: 0.78rem;
}
</style>
