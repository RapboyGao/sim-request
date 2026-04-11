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
  titleTemplate: (titleChunk) => {
    const baseTitle = 'Observation 预约'
    return titleChunk ? `${titleChunk} · ${baseTitle}` : baseTitle
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
  ],
  meta: [
    {
      name: 'description',
      content: 'Observation 预约系统，用于模拟机观摩预约、日历查看与管理。'
    },
  ],
})
</script>
