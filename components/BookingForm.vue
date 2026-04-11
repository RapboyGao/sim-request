<template>
  <v-form @submit.prevent="submitBooking">
    <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
      <template #activator="{ props }">
        <v-text-field :model-value="displayDate" :label="t('home.date')" readonly required
          prepend-inner-icon="mdi-calendar-month-outline" v-bind="props" />
      </template>
      <v-date-picker :model-value="form.date" color="primary" @update:model-value="onDateSelected" />
    </v-menu>
    <v-select v-model="form.slots" :items="slots" :label="t('home.slots')" multiple chips closable-chips
      prepend-inner-icon="mdi-clock-outline" required />
    <div class="text-caption text-medium-emphasis mt-n2 mb-4">
      {{ t('home.slotHint') }}
    </div>
    <v-text-field v-model="form.name" :label="t('home.name')" :placeholder="t('home.namePlaceholder')"
      prepend-inner-icon="mdi-account-outline" required />
    <v-select
      v-model="form.priorityLevel"
      :items="priorityItems"
      :label="t('home.priorityLabel')"
      prepend-inner-icon="mdi-badge-account-outline"
      item-title="title"
      item-value="value"
      required
    >
      <template #item="{ props, item }">
        <v-list-item v-bind="props">
          <template #prepend>
            <v-icon :icon="item.raw.icon" />
          </template>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-icon :icon="item.raw.icon" size="16" class="me-2" />
        <span>{{ item.title }}</span>
      </template>
    </v-select>
    <div class="text-caption text-medium-emphasis mt-n2 mb-4">
      {{ t('home.priorityHint') }}
    </div>
    <div class="text-caption text-medium-emphasis mt-n2 mb-4">
      {{ t('home.calendarHint') }}
    </div>
    <div class="text-caption text-medium-emphasis mt-n2 mb-4">
      {{ t('home.cancelRestoreHint') }}
    </div>
    <v-alert
      v-if="duplicateSlots.length > 0"
      class="mb-4"
      type="warning"
      variant="tonal"
      density="comfortable"
    >
      <div class="d-flex flex-wrap align-center gap-2">
        <span>{{ duplicateMessage }}</span>
        <v-chip
          v-for="slot in duplicateSlots"
          :key="slot"
          size="small"
          variant="tonal"
          color="warning"
          label
        >
          {{ slot }}
        </v-chip>
        <v-spacer />
        <v-btn
          size="small"
          color="warning"
          variant="tonal"
          prepend-icon="mdi-close-circle-outline"
          @click="removeDuplicateSlots"
        >
          {{ t('home.removeDuplicateSlots') }}
        </v-btn>
      </div>
    </v-alert>
    <v-btn type="submit" color="primary" block class="mt-2" prepend-icon="mdi-send">{{ t('home.submit') }}</v-btn>
  </v-form>

  <v-alert v-if="message.text" class="mt-4" :type="message.type" variant="tonal">
    {{ message.text }}
  </v-alert>
</template>

<script setup lang="ts">
import { buildSlots } from '~/utils/slots'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const slots = buildSlots()

const today = new Date().toISOString().slice(0, 10)
const dateMenu = ref(false)
const defaultSlot = slots[0] || ''
const form = reactive({
  date: today,
  slots: defaultSlot ? [defaultSlot] : [],
  name: '',
  priorityLevel: 'normal' as 'normal' | 'classmate',
})

const message = reactive<{ text: string; type: 'success' | 'error' | 'info' }>({
  text: '',
  type: 'info',
})
const duplicateSlots = ref<string[]>([])

const displayDate = computed(() => formatDateLabel(form.date))
const priorityItems = computed(() => [
  {
    title: translateWithFallback('home.priorityNormal', '普通'),
    value: 'normal',
    icon: 'mdi-account-outline',
  },
  {
    title: translateWithFallback('home.priorityClassmate', '同学'),
    value: 'classmate',
    icon: 'mdi-badge-account-outline',
  },
])
const duplicateMessage = computed(() => {
  if (duplicateSlots.value.length === 1) {
    return t('home.duplicateSlotSingle')
  }
  return t('home.duplicateSlotMultiple')
})

async function submitBooking() {
  message.text = ''
  duplicateSlots.value = []
  try {
    const response = await $fetch<{ bookings?: Array<{ id: string }> }>('/api/bookings', {
      method: 'POST',
      body: {
        date: form.date,
        slots: form.slots,
        name: form.name,
        isClassmate: form.priorityLevel === 'classmate',
      },
    })
    message.type = 'success'
    message.text = t('home.success')
    const bookingId = response.bookings?.[0]?.id || ''
    form.name = ''
    form.priorityLevel = 'normal'
    form.slots = defaultSlot ? [defaultSlot] : []
    const targetPath = localePath('/people')
    await navigateTo(bookingId ? `${targetPath}?focus=${encodeURIComponent(bookingId)}` : targetPath)
  } catch (error: any) {
    message.type = 'error'
    message.text = error?.data?.statusMessage || t('home.error')
    const slots = error?.data?.data?.duplicateSlots
    if (Array.isArray(slots)) {
      duplicateSlots.value = slots.filter((slot): slot is string => typeof slot === 'string')
    }
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
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date)
}

function translateWithFallback(key: string, fallback: string) {
  const value = t(key)
  return value === key ? fallback : value
}

function removeDuplicateSlots() {
  form.slots = form.slots.filter((slot) => !duplicateSlots.value.includes(slot))
  duplicateSlots.value = []
}
</script>
