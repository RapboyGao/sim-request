<template>
  <v-app>
    <v-app-bar color="surface" elevation="1" density="comfortable">
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">{{ t('app.title') }}</v-app-bar-title>
      <v-spacer />
      <div class="d-none d-md-flex app-links">
        <v-btn variant="text" :to="localePath('/')">{{ t('app.navBooking') }}</v-btn>
        <v-btn variant="text" :to="localePath('/rules')">{{ t('app.navRules') }}</v-btn>
        <v-btn variant="text" :to="localePath('/calendar')">{{ t('app.navCalendar') }}</v-btn>
        <v-btn variant="text" :to="localePath('/admin')">{{ t('app.navAdmin') }}</v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn variant="text" v-bind="props">{{ t('app.navLanguage') }}</v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="locale in locales"
              :key="locale.code"
              :to="switchLocalePath(locale.code)"
              :title="locale.name"
            />
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" class="d-md-none">
      <v-list nav density="comfortable">
        <v-list-item :to="localePath('/')" :title="t('app.navBooking')" />
        <v-list-item :to="localePath('/rules')" :title="t('app.navRules')" />
        <v-list-item :to="localePath('/calendar')" :title="t('app.navCalendar')" />
        <v-list-item :to="localePath('/admin')" :title="t('app.navAdmin')" />
        <v-divider class="my-2" />
        <v-list-item v-for="locale in locales" :key="locale.code" :to="switchLocalePath(locale.code)" :title="locale.name" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const { t, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const drawer = ref(false)
</script>

<style scoped>
.app-links {
  gap: 4px;
}
</style>
