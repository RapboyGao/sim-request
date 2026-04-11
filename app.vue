<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
const themeModeCookie = useCookie<'system' | 'light' | 'dark'>('booking-theme-mode', {
  default: () => 'system',
  sameSite: 'lax',
})

useHead({
  script: [
    {
      innerHTML: `
        (function () {
          try {
            var mode = ${JSON.stringify(themeModeCookie.value || 'system')};
            var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
            document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
          } catch (e) {}
        })();
      `,
      tagPosition: 'head',
    },
  ],
})
</script>
