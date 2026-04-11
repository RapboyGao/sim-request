<template>
  <v-app>
    <v-app-bar color="surface" elevation="1" density="comfortable">
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">模拟机观摩预约</v-app-bar-title>
      <v-spacer />
      <div class="d-none d-md-flex app-links">
        <v-btn variant="text" to="/" exact>预约提交</v-btn>
        <v-btn variant="text" to="/rules">预约规则</v-btn>
        <v-btn variant="text" to="/calendar">预约日历</v-btn>
        <v-btn variant="text" to="/admin">管理页</v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="start" class="d-md-none">
      <v-list nav density="comfortable">
        <v-list-item to="/" title="预约提交" />
        <v-list-item to="/rules" title="预约规则" />
        <v-list-item to="/calendar" title="预约日历" />
        <v-list-item to="/admin" title="管理页" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false)
</script>

<style scoped>
.app-links {
  gap: 4px;
}
</style>
