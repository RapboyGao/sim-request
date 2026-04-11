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
              <p class="subcopy">使用管理员账号登录后查看和导出数据。</p>
            </div>
            <v-btn v-if="authenticated" variant="tonal" color="primary" prepend-icon="mdi-logout" @click="logout">
              退出登录
            </v-btn>
          </div>
        </v-card>

        <v-card v-if="!authenticated" class="pa-5 mb-6">
          <v-form @submit.prevent="login">
            <v-row>
              <v-col cols="12" md="5">
                <v-text-field v-model="loginForm.username" label="用户名" prepend-inner-icon="mdi-account-outline"
                  autocomplete="username" />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field v-model="loginForm.password" type="password" label="密码"
                  prepend-inner-icon="mdi-key-outline" autocomplete="current-password" />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-end">
                <v-btn block color="primary" type="submit" :loading="loginLoading" prepend-icon="mdi-login">登录</v-btn>
              </v-col>
            </v-row>
          </v-form>
          <v-alert v-if="authError" class="mt-4" type="error" variant="tonal" density="compact">
            {{ authError }}
          </v-alert>
        </v-card>

        <template v-else>
          <v-card class="pa-6 mb-6 admin-hero">
            <div class="d-flex flex-wrap align-center justify-space-between gap-4">
              <div>
                <p class="eyebrow">导出数据</p>
              </div>
              <v-row class="export-actions" dense>
                <v-col cols="12" sm="4">
                  <v-btn block :href="csvExportUrl" color="primary" tag="a" prepend-icon="mdi-download">
                    导出 CSV
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn block :href="jsonExportUrl" variant="tonal" color="primary" tag="a" prepend-icon="mdi-code-json">
                    导出 JSON
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn block color="error" variant="tonal" prepend-icon="mdi-delete" @click="cleanupDialog = true">
                    清理旧记录
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card>

          <v-card class="pa-5">
            <v-skeleton-loader v-if="pending" type="table-heading, table-row@6" />
            <v-table v-else>
              <thead>
                <tr>
                  <th>日期</th>
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
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.slot }}</td>
                  <td>{{ entry.name }}</td>
                  <td>{{ entry.isStudent ? '是' : '否' }}</td>
                  <td>
                    <v-chip size="small" :color="entry.status === 'confirmed' ? 'primary' : 'secondary'" variant="tonal"
                      :prepend-icon="entry.status === 'confirmed' ? 'mdi-check' : 'mdi-timer-sand'">
                      {{ entry.status === 'confirmed' ? '已确认' : '候补' }}
                    </v-chip>
                  </td>
                  <td>{{ entry.rank }}</td>
                  <td>{{ formatTime(entry.createdAt) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-dialog v-model="cleanupDialog" max-width="520">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-alert-octagon-outline" class="mr-2" color="error" />
                确认清理旧记录
              </v-card-title>
              <v-card-text>
                这会删除“昨天及以前”的所有预约记录，且无法恢复。当前操作不会影响今天及以后的记录。
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cleanupDialog = false">取消</v-btn>
                <v-btn color="error" :loading="cleanupLoading" @click="cleanupOldBookings">确认删除</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const loginForm = reactive({
  username: '',
  password: '',
})
const authError = ref('')
const loginLoading = ref(false)
const authenticated = ref(false)
const cleanupDialog = ref(false)
const cleanupLoading = ref(false)

const { data, pending, refresh } = await useFetch('/api/admin/bookings', {
  immediate: false,
})

const csvExportUrl = computed(() => '/api/admin/export?format=csv')
const jsonExportUrl = computed(() => '/api/admin/export?format=json')

async function checkAuth() {
  const result = await $fetch<{ authenticated: boolean }>('/api/auth/me')
  authenticated.value = result.authenticated
  if (authenticated.value) {
    await refresh()
  }
}

async function login() {
  authError.value = ''
  loginLoading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: loginForm.username,
        password: loginForm.password,
      },
    })
    authenticated.value = true
    await refresh()
  } catch (error: any) {
    authError.value = error?.data?.statusMessage || '登录失败'
  } finally {
    loginLoading.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  authenticated.value = false
}

async function cleanupOldBookings() {
  cleanupLoading.value = true
  try {
    await $fetch('/api/admin/cleanup-old', {
      method: 'POST',
      body: { confirm: true },
    })
    cleanupDialog.value = false
    await refresh()
  } finally {
    cleanupLoading.value = false
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

await checkAuth()
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

.export-actions {
  width: min(100%, 520px);
}
</style>
