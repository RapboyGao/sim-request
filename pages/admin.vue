<template>
  <v-container class="py-8 admin-page">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-card class="pa-6 mb-6 admin-hero">
          <div class="d-flex flex-wrap align-center justify-space-between gap-4">
            <div>
              <p class="eyebrow">{{ t('admin.eyebrow') }}</p>
              <h1 class="d-flex align-center">
                <v-icon icon="mdi-shield-account-outline" class="mr-2" />
                {{ t('admin.title') }}
              </h1>
              <p class="subcopy">{{ t('admin.subcopy') }}</p>
            </div>
            <v-btn v-if="authenticated" variant="tonal" color="primary" prepend-icon="mdi-logout" @click="logout">
              {{ t('admin.logout') }}
            </v-btn>
          </div>
        </v-card>

        <v-card v-if="!authenticated" class="pa-5 mb-6">
          <v-form @submit.prevent="login">
            <v-row>
              <v-col cols="12" md="5">
                <v-text-field v-model="loginForm.username" :label="t('admin.username')" prepend-inner-icon="mdi-account-outline"
                  autocomplete="username" />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field v-model="loginForm.password" type="password" :label="t('admin.password')"
                  prepend-inner-icon="mdi-key-outline" autocomplete="current-password" />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-end">
                <v-btn block color="primary" type="submit" :loading="loginLoading" prepend-icon="mdi-login">{{ t('admin.login') }}</v-btn>
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
                <p class="eyebrow">{{ t('admin.exportEyebrow') }}</p>
              </div>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-menu-down"
                    v-bind="props"
                  >
                    {{ t('admin.exportMenu') }}
                  </v-btn>
                </template>
                <v-list min-width="220" density="comfortable">
                  <v-list-item :href="csvExportUrl" tag="a" :title="t('admin.exportCsv')" prepend-icon="mdi-download" />
                  <v-list-item :href="jsonSupabaseExportUrl" tag="a" :title="t('admin.exportJsonSupabase')" prepend-icon="mdi-code-json" />
                  <v-list-item :href="jsonDebugExportUrl" tag="a" :title="t('admin.exportJsonDebug')" prepend-icon="mdi-code-json" />
                  <v-divider />
                  <v-list-item :title="t('admin.cleanupButton')" prepend-icon="mdi-delete" @click="cleanupDialog = true" />
                </v-list>
              </v-menu>
            </div>
          </v-card>

          <v-card class="pa-5">
            <v-text-field
              v-model="searchTerm"
              :label="t('admin.searchLabel')"
              prepend-inner-icon="mdi-magnify"
              clearable
              density="comfortable"
              hide-details
              class="mb-4"
              :loading="searchLoading"
            />
            <v-progress-linear v-if="searchLoading" color="primary" indeterminate class="mb-4" rounded />
            <v-skeleton-loader v-if="pending" type="table-heading, table-row@6" />
            <template v-else>
              <div class="admin-bulkbar mb-4">
                <v-checkbox
                  v-model="selectAll"
                  :indeterminate="selectedIds.length > 0 && selectedIds.length < sortedEntries.length"
                  :label="t('admin.bulkSelectAll')"
                  hide-details
                  density="compact"
                />
                <div class="admin-bulkbar-meta">
                  {{ t('admin.bulkSelectedCount', { count: selectedIds.length }) }}
                </div>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      :disabled="selectedIds.length === 0"
                      prepend-icon="mdi-tune"
                      v-bind="props"
                    >
                      {{ t('admin.bulkPriority') }}
                    </v-btn>
                  </template>
                  <v-list min-width="200" density="comfortable">
                    <v-list-item
                      v-for="option in priorityOptions"
                      :key="option.value"
                      :title="option.title"
                      :prepend-icon="priorityMeta(option.value).icon"
                      @click="applyPriorityToSelected(option.value)"
                    />
                  </v-list>
                </v-menu>
                <v-btn
                  color="error"
                  variant="tonal"
                  :disabled="selectedIds.length === 0"
                  prepend-icon="mdi-delete-outline"
                  @click="promptBulkDelete"
                >
                  {{ t('admin.bulkDelete') }}
                </v-btn>
              </div>
              <div v-if="filteredEntries.length === 0" class="empty-state empty-state--compact">
                <v-icon icon="mdi-magnify" size="28" class="mb-2" />
                <div>{{ searchActive ? t('admin.emptySearch') : t('admin.empty') }}</div>
              </div>
              <v-table v-else class="admin-table">
              <colgroup>
                <col class="col-select" />
                <col class="col-date" />
                <col class="col-slot" />
                <col class="col-name" />
                <col class="col-classmate" />
                <col class="col-status" />
                <col class="col-priority" />
                <col class="col-created" />
                <col class="col-action" />
              </colgroup>
              <thead>
                <tr>
                  <th class="text-center">
                    <v-checkbox
                      v-model="selectAll"
                      :indeterminate="selectedIds.length > 0 && selectedIds.length < sortedEntries.length"
                      hide-details
                      density="compact"
                    />
                  </th>
                  <th>{{ t('admin.columns.date') }}</th>
                  <th>{{ t('admin.columns.slot') }}</th>
                  <th>{{ t('admin.columns.name') }}</th>
                  <th>{{ t('admin.columns.classmate') }}</th>
                  <th>{{ t('admin.columns.status') }}</th>
                  <th>{{ t('admin.columns.priority') }}</th>
                  <th>{{ t('admin.columns.createdAt') }}</th>
                  <th>{{ t('admin.columns.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td class="text-center">
                    <v-checkbox v-model="selectedIds" :value="entry.id" hide-details density="compact" />
                  </td>
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.slot }}</td>
                  <td>{{ entry.name }}</td>
                  <td>{{ entry.priorityLevel === 'classmate' ? t('admin.yes') : t('admin.no') }}</td>
                  <td>
                    <v-chip size="small" :color="entry.status === 'canceled' ? 'secondary' : 'primary'" variant="tonal"
                      :prepend-icon="entry.status === 'canceled' ? 'mdi-cancel' : 'mdi-check'">
                      {{ entry.status === 'canceled' ? t('admin.canceled') : t('admin.active') }}
                    </v-chip>
                  </td>
                  <td>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="priorityMeta(entry.priorityLevel).color"
                          :prepend-icon="priorityMeta(entry.priorityLevel).icon"
                          v-bind="props"
                        >
                          {{ priorityMeta(entry.priorityLevel).label }}
                        </v-chip>
                      </template>
                      <v-list min-width="180" density="comfortable">
                        <v-list-item
                          v-for="option in priorityOptions"
                          :key="option.value"
                          :title="option.title"
                          :prepend-icon="priorityMeta(option.value).icon"
                          @click="applyPriority(entry, option.value)"
                        />
                      </v-list>
                    </v-menu>
                  </td>
                  <td>{{ formatTime(entry.createdAt) }}</td>
                  <td>
                    <v-btn
                      icon="mdi-trash-can-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      :aria-label="t('admin.delete')"
                      @click="promptDelete(entry)"
                    />
                  </td>
                </tr>
              </tbody>
              </v-table>
            </template>
          </v-card>

          <v-dialog v-model="cleanupDialog" max-width="520">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-alert-octagon-outline" class="mr-2" color="error" />
                {{ t('admin.cleanupTitle') }}
              </v-card-title>
              <v-card-text>
                {{ t('admin.cleanupBody') }}
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cleanupDialog = false">{{ t('admin.cancel') }}</v-btn>
                <v-btn color="error" :loading="cleanupLoading" @click="cleanupOldBookings">{{ t('admin.confirmDelete') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="deleteDialog" max-width="520">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-delete-alert-outline" class="mr-2" color="error" />
                {{ t('admin.deleteTitle') }}
              </v-card-title>
              <v-card-text>
                {{ deletePrompt }}
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="text" @click="deleteDialog = false">{{ t('admin.cancel') }}</v-btn>
                <v-btn color="error" :loading="deleteLoading" @click="confirmDelete">{{ t('admin.confirmDelete') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="bulkDeleteDialog" max-width="520">
            <v-card>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-delete-alert-outline" class="mr-2" color="error" />
                {{ t('admin.bulkDeleteTitle') }}
              </v-card-title>
              <v-card-text>
                {{ t('admin.bulkDeleteBody', { count: selectedIds.length }) }}
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn variant="text" @click="bulkDeleteDialog = false">{{ t('admin.cancel') }}</v-btn>
                <v-btn color="error" :loading="bulkDeleteLoading" @click="confirmBulkDelete">
                  {{ t('admin.confirmDelete') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

useHead({
  title: t('app.navAdmin'),
})

const loginForm = reactive({
  username: '',
  password: '',
})
const authError = ref('')
const loginLoading = ref(false)
const authenticated = ref(false)
const cleanupDialog = ref(false)
const cleanupLoading = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)
const bulkDeleteDialog = ref(false)
const bulkDeleteLoading = ref(false)
const deleteTarget = ref<{ date: string; slot: string; id: string; name: string } | null>(null)
const priorityLoading = ref(false)
const selectedIds = ref<string[]>([])
const searchTerm = ref('')
const debouncedSearchTerm = ref('')
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
type PriorityLevel = 'specified' | 'classmate' | 'normal'

const priorityOptions = computed<Array<{ title: string; value: PriorityLevel }>>(() => [
  { title: t('admin.prioritySpecified'), value: 'specified' },
  { title: t('admin.priorityClassmate'), value: 'classmate' },
  { title: t('admin.priorityNormal'), value: 'normal' },
])

const { data, pending, refresh } = await useFetch('/api/admin/bookings', {
  immediate: false,
})

const csvExportUrl = computed(() => '/api/admin/export?format=csv')
const jsonSupabaseExportUrl = computed(() => '/api/admin/export?format=json&variant=supabase')
const jsonDebugExportUrl = computed(() => '/api/admin/export?format=json&variant=debug')
const deletePrompt = computed(() =>
  deleteTarget.value
    ? `${deleteTarget.value.date} ${deleteTarget.value.slot} · ${deleteTarget.value.name}`
    : '',
)
const sortedEntries = computed(() => {
  const entries = data.value?.entries || []
  return [...entries].sort((left, right) => {
    const dateCompare = left.date.localeCompare(right.date)
    if (dateCompare !== 0) return dateCompare

    const slotCompare = left.slot.localeCompare(right.slot)
    if (slotCompare !== 0) return slotCompare

    if (left.priorityLevel !== right.priorityLevel) {
      const order: Record<string, number> = {
        specified: 0,
        classmate: 1,
        normal: 2,
      }
      return (order[left.priorityLevel] ?? 2) - (order[right.priorityLevel] ?? 2)
    }

    if (left.status !== right.status) {
      if (left.status === 'canceled') return 1
      if (right.status === 'canceled') return -1
    }
    return left.createdAt.localeCompare(right.createdAt)
  })
})

const searchActive = computed(() => debouncedSearchTerm.value.trim().length > 0)
const filteredEntries = computed(() => {
  const term = debouncedSearchTerm.value.trim().toLowerCase()
  if (!term) return sortedEntries.value
  return sortedEntries.value.filter((entry) => entry.name.toLowerCase().includes(term))
})

const selectAll = computed({
  get: () => filteredEntries.value.length > 0 && selectedIds.value.length === filteredEntries.value.length,
  set: (checked: boolean) => {
    selectedIds.value = checked ? filteredEntries.value.map((entry) => entry.id) : []
  },
})

async function checkAuth() {
  const result = await $fetch<{ authenticated: boolean }>('/api/auth/me')
  authenticated.value = result.authenticated
  if (authenticated.value) {
    await refresh()
  }
}

watch(searchTerm, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchLoading.value = true
  searchTimer = setTimeout(() => {
    debouncedSearchTerm.value = String(value || '').trim()
    selectedIds.value = []
    searchLoading.value = false
  }, 280)
}, { immediate: true })

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

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
    authError.value = error?.data?.statusMessage || t('admin.loginFailed')
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

function promptDelete(entry: { date: string; slot: string; id: string; name: string }) {
  deleteTarget.value = entry
  deleteDialog.value = true
}

function promptBulkDelete() {
  if (selectedIds.value.length === 0) return
  bulkDeleteDialog.value = true
}

function priorityMeta(level?: string) {
  if (level === 'specified') {
    return { label: t('admin.prioritySpecified'), color: 'primary', icon: 'mdi-arrow-collapse-up' }
  }
  if (level === 'classmate') {
    return { label: t('admin.priorityClassmate'), color: 'success', icon: 'mdi-school-outline' }
  }
  return { label: t('admin.priorityNormal'), color: 'secondary', icon: 'mdi-account-outline' }
}

async function applyPriority(entry: { date: string; slot: string; id: string; name: string; priorityLevel: string }, priorityLevel: PriorityLevel) {
  priorityLoading.value = true
  try {
    await $fetch('/api/admin/set-priority', {
      method: 'POST',
      body: {
        date: entry.date,
        slot: entry.slot,
        id: entry.id,
        priorityLevel,
      },
    })
    await refresh()
  } finally {
    priorityLoading.value = false
  }
}

async function applyPriorityToSelected(priorityLevel: PriorityLevel) {
  if (selectedIds.value.length === 0) return
  priorityLoading.value = true
  try {
    const targets = sortedEntries.value.filter((entry) => selectedIds.value.includes(entry.id))
    for (const entry of targets) {
      await $fetch('/api/admin/set-priority', {
        method: 'POST',
        body: {
          date: entry.date,
          slot: entry.slot,
          id: entry.id,
          priorityLevel,
        },
      })
    }
    selectedIds.value = []
    await refresh()
  } finally {
    priorityLoading.value = false
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await $fetch('/api/admin/delete-booking', {
      method: 'POST',
      body: {
        date: deleteTarget.value.date,
        slot: deleteTarget.value.slot,
        id: deleteTarget.value.id,
      },
    })
    deleteDialog.value = false
    deleteTarget.value = null
    await refresh()
  } finally {
    deleteLoading.value = false
  }
}

async function confirmBulkDelete() {
  if (selectedIds.value.length === 0) return
  bulkDeleteLoading.value = true
  try {
    const targets = sortedEntries.value.filter((entry) => selectedIds.value.includes(entry.id))
    for (const entry of targets) {
      await $fetch('/api/admin/delete-booking', {
        method: 'POST',
        body: {
          date: entry.date,
          slot: entry.slot,
          id: entry.id,
        },
      })
    }
    bulkDeleteDialog.value = false
    selectedIds.value = []
    await refresh()
  } finally {
    bulkDeleteLoading.value = false
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
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

.admin-table {
  width: 100%;
}

.admin-table :deep(table) {
  table-layout: fixed;
}

.admin-table :deep(th),
.admin-table :deep(td) {
  vertical-align: middle;
  word-break: break-word;
}

.admin-table :deep(.col-date) {
  width: 96px;
}

.admin-table :deep(.col-select) {
  width: 48px;
}

.admin-table :deep(.col-slot) {
  width: 96px;
}

.admin-table :deep(.col-name) {
  min-width: 120px;
  width: 20%;
}

.admin-table :deep(.col-classmate) {
  width: 72px;
}

.admin-table :deep(.col-status) {
  width: 96px;
}

.admin-table :deep(.col-priority) {
  width: 140px;
}

.admin-table :deep(.col-created) {
  min-width: 132px;
  width: 22%;
}

.admin-table :deep(.col-action) {
  width: 56px;
}

.admin-bulkbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.admin-bulkbar-meta {
  color: var(--muted);
  font-size: 0.9rem;
  margin-right: auto;
}

.admin-hero {
  background: linear-gradient(135deg, var(--bg-accent-start), var(--bg-accent-soft-2));
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
