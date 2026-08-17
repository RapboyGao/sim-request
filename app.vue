<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
const route = useRoute()
const themeModeCookie = useCookie<'system' | 'light' | 'dark'>('booking-theme-mode', {
  default: () => 'system',
  sameSite: 'lax',
})

useHead(() => ({
  htmlAttrs: {
    'data-theme': themeModeCookie.value || 'system',
  },
  titleTemplate: (titleChunk) => {
    const baseTitle = 'Observation 预约'
    return titleChunk ? `${titleChunk} · ${baseTitle}` : baseTitle
  },
  link: [
    { rel: 'manifest', href: `/api/pwa-manifest?start_url=${encodeURIComponent(route.fullPath || '/')}` },
    { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  ],
  meta: [
    {
      name: 'description',
      content: 'Observation 预约系统，用于模拟机观摩预约、日历查看与管理。'
    },
    { name: 'theme-color', content: '#000000' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
  ],
}))
</script>
