<template>
  <v-container class="py-8 booking-page">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card class="hero-card mb-6 pa-6">
          <div class="hero-copy">
            <p class="eyebrow">模拟机观摩预约</p>
            <h1>按日期和 2 小时时段预约观摩名额</h1>
            <p class="subcopy">
              每个时段最多 2 人确认，超出自动进入候补。填写姓名并标记是否为同学，同学优先确认。
            </p>
          </div>
        </v-card>

        <v-card class="pa-5 sticky-card">
          <v-form @submit.prevent="submitBooking">
            <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
              <template #activator="{ props }">
                <v-text-field
                  :model-value="displayDate"
                  label="预约日期"
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
              label="预约时段"
              multiple
              chips
              closable-chips
              required
            />
            <v-text-field v-model="form.name" label="姓名" placeholder="请输入姓名" required />
            <v-switch v-model="form.isStudent" label="是否为同学" inset />
            <v-btn type="submit" color="primary" block class="mt-2">提交预约</v-btn>
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
    message.text = '预约提交成功'
    form.name = ''
    form.isStudent = false
    form.slots = defaultSlot ? [defaultSlot] : []
  } catch (error: any) {
    message.type = 'error'
    message.text = error?.data?.statusMessage || '提交失败'
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
