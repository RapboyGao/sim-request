<template>
  <v-container class="py-8 booking-page">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card class="hero-card mb-6 pa-6">
          <div class="hero-copy">
            <p class="eyebrow">{{ t('home.eyebrow') }}</p>
            <h1>{{ t('home.title') }}</h1>
            <p class="subcopy">{{ t('home.summary') }}</p>
          </div>
        </v-card>

        <v-card class="pa-5 sticky-card">
          <v-form @submit.prevent="submitBooking">
            <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
              <template #activator="{ props }">
                  <v-text-field
                  :model-value="displayDate"
                  :label="t('home.date')"
                  readonly
                  required
                  append-inner-icon="mdi-calendar"
                  v-bind="props"
                />
              </template>
              <v-date-picker
                :model-value="form.date"
                color="primary"
                @update:model-value="onDateSelected"
              />
            </v-menu>
              <v-select
                  v-model="form.slots"
                  :items="slots"
                  :label="t('home.slots')"
                  multiple
                  chips
                  closable-chips
                  required
                />
            <v-text-field v-model="form.name" :label="t('home.name')" :placeholder="t('home.namePlaceholder')" required />
            <v-switch v-model="form.isStudent" :label="t('home.student')" inset />
            <v-btn type="submit" color="primary" block class="mt-2">{{ t('home.submit') }}</v-btn>
          </v-form>

          <v-alert v-if="message.text" class="mt-4" :type="message.type" variant="tonal">
            {{ message.text }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { buildSlots } from '~/utils/slots'
const { t } = useI18n()

const slots = buildSlots()

const today = new Date().toISOString().slice(0, 10)
const dateMenu = ref(false)
const defaultSlot = slots[0] || ''
const form = reactive({
  date: today,
  slots: defaultSlot ? [defaultSlot] : [],
  name: '',
  isStudent: false,
})

const message = reactive<{ text: string; type: 'success' | 'error' | 'info' }>({
  text: '',
  type: 'info',
})

const displayDate = computed(() => formatDateLabel(form.date))

async function submitBooking() {
  message.text = ''
  try {
    await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        date: form.date,
        slots: form.slots,
        name: form.name,
        isStudent: form.isStudent,
      },
    })
    message.type = 'success'
    message.text = t('home.success')
    form.name = ''
    form.isStudent = false
    form.slots = defaultSlot ? [defaultSlot] : []
  } catch (error: any) {
    message.type = 'error'
    message.text = error?.data?.statusMessage || t('home.error')
  }
}

function onDateSelected(value: unknown) {
  form.date = normalizeDate(value) || form.date
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
.booking-page {
  min-height: 100vh;
}

.hero-card {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(249, 115, 22, 0.08));
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.15;
  margin: 0;
}

.eyebrow {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.subcopy {
  max-width: 58ch;
  color: var(--muted);
}

.sticky-card {
  max-width: 720px;
  margin: 0 auto;
}
</style>
