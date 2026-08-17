<template>
  <v-divider class="my-2" />
  <v-list-subheader>{{ t('app.navLanguage') }}</v-list-subheader>
  <v-list-item
    v-for="item in locales"
    :key="item.code"
    :to="switchLocalePath(item.code)"
    :title="localeLabel(item.code)"
    :prepend-icon="localeIcon(item.code)"
    :active="item.code === locale"
    @click="emit('select')"
  />
</template>

<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const emit = defineEmits<{ select: [] }>()

function localeIcon(code: string) {
  const map: Record<string, string> = {
    'zh-CN': 'mdi-alpha-c-box-outline',
    en: 'mdi-alpha-e-box-outline',
    ja: 'mdi-alpha-j-box-outline',
    ko: 'mdi-alpha-k-box-outline',
    fr: 'mdi-alpha-f-box-outline',
  }
  return map[code] || 'mdi-web'
}

function localeLabel(code: string) {
  const map: Record<string, string> = {
    'zh-CN': '中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
  }
  return map[code] || code
}
</script>
