<template>
  <v-container class="py-8 admin-page">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-card class="pa-6 mb-6 admin-hero">
          <div class="d-flex flex-wrap align-center justify-space-between gap-4">
            <div>
              <p class="eyebrow">管理员面板</p>
              <h1 class="d-flex align-center">
                <v-icon icon="mdi-shield-account-outline" class="mr-2" />
                预约总览与导出
              </h1>
              <p class="subcopy">查看某天所有时段的预约结果，并导出 CSV 或 JSON。</p>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <v-btn :href="csvExportUrl" color="primary" tag="a" prepend-icon="mdi-download">导出 CSV</v-btn>
              <v-btn :href="jsonExportUrl" variant="tonal" color="primary" tag="a" prepend-icon="mdi-code-json">导出 JSON</v-btn>
            </div>
          </div>
        </v-card>

        <v-card class="pa-5 mb-6">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="selectedDate" type="date" label="查看日期" prepend-inner-icon="mdi-calendar-month-outline" />
            </v-col>
            <v-col cols="12" md="8" class="d-flex align-end">
              <v-btn color="primary" class="mr-3" @click="refresh" prepend-icon="mdi-magnify">查询</v-btn>
              <v-chip color="primary" variant="tonal" class="mr-2" prepend-icon="mdi-check-circle-outline">已确认 {{ data?.totals.confirmed || 0 }}</v-chip>
              <v-chip color="secondary" variant="tonal" prepend-icon="mdi-timer-sand">候补 {{ data?.totals.waitlist || 0 }}</v-chip>
            </v-col>
          </v-row>
        </v-card>

        <v-card class="pa-5">
          <v-skeleton-loader v-if="pending" type="table-heading, table-row@6" />
          <v-table v-else>
            <thead>
              <tr>
                <th>时段</th>
                <th>姓名</th>
                <th>同学</th>
                <th>状态</th>
                <th>序号</th>
                <th>提交时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in data?.entries || []" :key="entry.id">
                <td>{{ entry.slot }}</td>
                <td>{{ entry.name }}</td>
                <td>{{ entry.isStudent ? '是' : '否' }}</td>
                <td>
                  <v-chip
                    size="small"
                    :color="entry.status === 'confirmed' ? 'primary' : 'secondary'"
                    variant="tonal"
                    :prepend-icon="entry.status === 'confirmed' ? 'mdi-check' : 'mdi-timer-sand'"
                  >
                    {{ entry.status === 'confirmed' ? '已确认' : '候补' }}
                  </v-chip>
                </td>
                <td>{{ entry.rank }}</td>
                <td>{{ formatTime(entry.createdAt) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const { data, pending, refresh } = await useFetch('/api/admin/bookings', {
  query: computed(() => ({ date: selectedDate.value })),
})

watch(selectedDate, async () => {
  await refresh()
})

const csvExportUrl = computed(() => `/api/admin/export?format=csv&date=${selectedDate.value}`)
const jsonExportUrl = computed(() => `/api/admin/export?format=json&date=${selectedDate.value}`)

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
}

.admin-hero {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(249, 115, 22, 0.08));
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
  color: var(--muted);
  margin-bottom: 0;
}
</style>
