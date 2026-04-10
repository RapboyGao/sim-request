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

        <v-row>
          <v-col cols="12" md="5">
            <v-card class="pa-5 sticky-card">
              <v-form @submit.prevent="submitBooking">
                <v-text-field v-model="form.date" label="预约日期" type="date" required />
                <v-select v-model="form.slot" :items="slots" label="预约时段" required />
                <v-text-field v-model="form.name" label="姓名" placeholder="请输入姓名" required />
                <v-switch v-model="form.isStudent" label="是否为同学" inset />
                <v-btn type="submit" color="primary" block class="mt-2">提交预约</v-btn>
              </v-form>

              <v-alert v-if="message.text" class="mt-4" :type="message.type" variant="tonal">
                {{ message.text }}
              </v-alert>
            </v-card>
          </v-col>

          <v-col cols="12" md="7">
            <v-card class="pa-5">
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <h2 class="text-h5 mb-1">当日预约情况</h2>
                  <p class="text-medium-emphasis mb-0">日期：{{ form.date }}</p>
                </div>
                <v-btn variant="tonal" color="primary" @click="refreshSchedule">刷新</v-btn>
              </div>

              <v-skeleton-loader v-if="pending" type="article, list-item-two-line, list-item-two-line" />

              <div v-else class="slot-list">
                <v-card v-for="slotSummary in schedule" :key="slotSummary.slot" variant="outlined" class="mb-3 pa-4">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <strong>{{ slotSummary.slot }}</strong>
                    <v-chip size="small" color="primary" variant="tonal">
                      确认 {{ slotSummary.confirmed.length }}/2
                    </v-chip>
                  </div>

                  <div>
                    <div class="mb-3">
                      <div class="section-title">确认名单</div>
                      <v-list density="compact">
                        <v-list-item v-for="entry in slotSummary.confirmed" :key="entry.id">
                          <v-list-item-title>
                            {{ entry.name }}
                            <v-chip v-if="entry.isStudent" size="x-small" class="ml-2" color="secondary" variant="tonal">
                              同学
                            </v-chip>
                          </v-list-item-title>
                          <v-list-item-subtitle>第 {{ entry.rank }} 位 · {{ formatTime(entry.createdAt) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="slotSummary.confirmed.length === 0">
                          <v-list-item-title class="text-medium-emphasis">暂无确认预约</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>

                    <div>
                      <div class="section-title">候补名单</div>
                      <v-list density="compact">
                        <v-list-item v-for="entry in slotSummary.waitlist" :key="entry.id">
                          <v-list-item-title>
                            {{ entry.name }}
                            <v-chip v-if="entry.isStudent" size="x-small" class="ml-2" color="secondary" variant="tonal">
                              同学
                            </v-chip>
                          </v-list-item-title>
                          <v-list-item-subtitle>候补第 {{ entry.rank - 2 }} 位 · {{ formatTime(entry.createdAt) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="slotSummary.waitlist.length === 0">
                          <v-list-item-title class="text-medium-emphasis">暂无候补</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { BookingEntry, SlotSummary } from '~/types/booking'
import { buildSlots } from '~/utils/slots'

const slots = buildSlots()

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  date: today,
  slot: slots[0],
  name: '',
  isStudent: false,
})

const message = reactive<{ text: string; type: 'success' | 'error' | 'info' }>({
  text: '',
  type: 'info',
})

const { data, pending, refresh } = await useFetch('/api/bookings', {
  query: computed(() => ({ date: form.date })),
})

watch(
  () => form.date,
  async () => {
    await refresh()
  },
)

const schedule = computed<SlotSummary[]>(() => {
  const payload = data.value
  if (!payload) return []
  return payload.slots.map((slot) => {
    const entries = (payload.bookings[slot] || []) as BookingEntry[]
    return {
      slot,
      confirmed: entries.filter((entry) => entry.status === 'confirmed'),
      waitlist: entries.filter((entry) => entry.status === 'waitlist'),
    }
  })
})

async function submitBooking() {
  message.text = ''
  try {
    await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        date: form.date,
        slot: form.slot,
        name: form.name,
        isStudent: form.isStudent,
      },
    })
    message.type = 'success'
    message.text = '预约提交成功'
    form.name = ''
    form.isStudent = false
    await refresh()
  } catch (error: any) {
    message.type = 'error'
    message.text = error?.data?.statusMessage || '提交失败'
  }
}

async function refreshSchedule() {
  await refresh()
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
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
  position: sticky;
  top: 24px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-strong);
  margin-bottom: 0.25rem;
}
</style>
