<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
const themeModeCookie = useCookie<'system' | 'light' | 'dark'>('booking-theme-mode', {
  default: () => 'system',
  sameSite: 'lax',
})

useHead({
  htmlAttrs: {
    'data-theme': themeModeCookie.value || 'system',
  },
})
</script>
