<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="8" xl="7">
        <v-card class="pa-6 rules-card">
          <p class="eyebrow">{{ t('rules.eyebrow') }}</p>
          <h1 class="text-h4 mb-2">{{ t('rules.title') }}</h1>
          <p class="subcopy mb-6">{{ t('rules.summary') }}</p>

          <v-list density="comfortable" lines="two">
            <v-list-item :title="t('rules.slotRuleTitle')" :subtitle="t('rules.slotRuleDesc')" />
            <v-list-item :title="t('rules.priorityRuleTitle')" :subtitle="t('rules.priorityRuleDesc')" />
            <v-list-item :title="t('rules.bookingRuleTitle')" :subtitle="t('rules.bookingRuleDesc')" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.rules-card {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.06));
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
}
</style>
