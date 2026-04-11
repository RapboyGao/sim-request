<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8" xl="7">
        <v-card class="pa-5 pa-sm-6 rules-card" rounded="xl">
          <div class="page-head mb-6">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-book-open-variant-outline" size="18" class="mr-1" />
                {{ t('rules.eyebrow') }}
              </div>
              <h1 class="text-h5 text-sm-h4 font-weight-bold mt-2 mb-2">
                {{ t('rules.title') }}
              </h1>
              <p class="text-body-2 text-sm-body-1 text-medium-emphasis mb-0">
                {{ t('rules.summary') }}
              </p>
            </div>
          </div>

          <v-row dense>
            <v-col v-for="item in ruleItems" :key="item.key" cols="12" md="4">
              <v-card class="rule-item" variant="flat" rounded="lg">
                <div class="rule-item-head">
                  <v-avatar color="primary" variant="tonal" size="36">
                    <v-icon :icon="item.icon" size="18" />
                  </v-avatar>
                  <div class="rule-item-title">
                    {{ item.title }}
                  </div>
                </div>
                <div class="rule-item-desc">
                  {{ item.description }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <div class="process-title mb-4">
            <v-icon icon="mdi-format-list-checks" size="18" class="mr-1" />
            {{ t('rules.processTitle') }}
          </div>

          <v-timeline density="compact" align="start" side="end" truncate-line="both" class="rules-timeline">
            <v-timeline-item
              v-for="step in processSteps"
              :key="step.key"
              dot-color="primary"
              size="small"
            >
              <template #icon>
                <v-icon :icon="step.icon" size="16" />
              </template>

              <div class="timeline-step">
                <div class="timeline-step-title">
                  {{ step.title }}
                </div>
                <div class="timeline-step-desc">
                  {{ step.description }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

const ruleItems = [
  {
    key: 'slot',
    icon: 'mdi-clock-outline',
    title: t('rules.slotRuleTitle'),
    description: t('rules.slotRuleDesc'),
  },
  {
    key: 'priority',
    icon: 'mdi-school-outline',
    title: t('rules.priorityRuleTitle'),
    description: t('rules.priorityRuleDesc'),
  },
  {
    key: 'booking',
    icon: 'mdi-form-select',
    title: t('rules.bookingRuleTitle'),
    description: t('rules.bookingRuleDesc'),
  },
]

const processSteps = [
  {
    key: 'date',
    icon: 'mdi-calendar-month-outline',
    title: t('rules.stepOneTitle'),
    description: t('rules.stepOneDesc'),
  },
  {
    key: 'submit',
    icon: 'mdi-send-outline',
    title: t('rules.stepTwoTitle'),
    description: t('rules.stepTwoDesc'),
  },
  {
    key: 'result',
    icon: 'mdi-account-multiple-check-outline',
    title: t('rules.stepThreeTitle'),
    description: t('rules.stepThreeDesc'),
  },
]
</script>

<style scoped>
.rules-card {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.06));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.rule-item {
  height: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.rule-item-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.rule-item-title {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.rule-item-desc,
.timeline-step-desc {
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.92rem;
}

.process-title {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.timeline-step {
  padding-bottom: 0.5rem;
}

.timeline-step-title {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

:deep(.rules-timeline .v-timeline-item__body) {
  padding-inline-start: 0.75rem;
}

@media (max-width: 600px) {
  .page-head {
    flex-direction: column;
  }
}
</style>
