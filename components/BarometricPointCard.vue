<template>
  <v-card class="barometric-point-card" variant="flat">
    <div class="barometric-point-card__header">
      <div>
        <h2 class="text-h6 font-weight-bold">{{ title }}</h2>
      </div>
      <v-avatar color="primary" variant="tonal" size="42">
        <v-icon icon="mdi-map-marker-radius-outline" />
      </v-avatar>
    </div>

    <v-divider class="my-5" />

    <div class="barometric-field-row">
      <v-text-field
        :model-value="pointState.heightExpression"
        class="barometric-expression-input"
        :label="t('barometric.height')"
        :placeholder="t('barometric.expressionPlaceholder')"
        :error-messages="resolved.heightError ? t('barometric.invalidHeight') : undefined"
        prepend-inner-icon="mdi-arrow-up-down"
        clearable
        clear-icon="mdi-close-circle-outline"
        :inputmode="props.inputMode"
        :lang="props.inputMode === 'text' ? 'en' : undefined"
        enterkeyhint="done"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @update:model-value="emit('update-input', 'height', $event)"
        @click:clear="emit('update-input', 'height', '')"
        @keydown.enter.prevent="emit('commit-input', 'height')"
      />
      <v-select
        :model-value="pointState.heightUnit"
        class="barometric-unit-select"
        :items="heightUnitItems"
        :label="t('barometric.unit')"
        item-title="title"
        item-value="value"
        @update:model-value="emit('update-unit', 'height', $event)"
      />
    </div>

    <div class="barometric-field-row">
      <v-text-field
        :model-value="pointState.pressureExpression"
        class="barometric-expression-input"
        :label="t('barometric.pressure')"
        :placeholder="t('barometric.expressionPlaceholder')"
        :error-messages="resolved.pressureError ? t('barometric.invalidPressure') : undefined"
        prepend-inner-icon="mdi-gauge"
        clearable
        clear-icon="mdi-close-circle-outline"
        :inputmode="props.inputMode"
        :lang="props.inputMode === 'text' ? 'en' : undefined"
        enterkeyhint="done"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @update:model-value="emit('update-input', 'pressure', $event)"
        @click:clear="emit('update-input', 'pressure', '')"
        @keydown.enter.prevent="emit('commit-input', 'pressure')"
      />
      <v-select
        :model-value="pointState.pressureUnit"
        class="barometric-unit-select"
        :items="pressureUnitItems"
        :label="t('barometric.unit')"
        item-title="title"
        item-value="value"
        @update:model-value="emit('update-unit', 'pressure', $event)"
      />
    </div>

    <div class="text-caption text-medium-emphasis mt-1">
      {{ t('barometric.expressionHint') }}
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  HEIGHT_UNITS,
  PRESSURE_UNITS,
  type HeightUnit,
  type PressureUnit,
} from '~/utils/barometric'
import type { BarometricPointState } from '~/composables/useBarometricConverter'

type ResolvedPoint = {
  heightError: boolean
  pressureError: boolean
  heightMeters: number | null
  pressurePa: number | null
}

const props = defineProps<{
  title: string
  pointState: BarometricPointState
  resolved: ResolvedPoint
  inputMode: 'decimal' | 'text'
}>()

const emit = defineEmits<{
  (event: 'update-input', kind: 'height' | 'pressure', expression: string): void
  (event: 'update-unit', kind: 'height' | 'pressure', unit: HeightUnit | PressureUnit): void
  (event: 'commit-input', kind: 'height' | 'pressure'): void
}>()

const { t } = useI18n()
const heightUnitItems = computed(() => HEIGHT_UNITS.map(value => ({
  value,
  title: t(`barometric.units.height.${value}`),
})))

const pressureUnitItems = computed(() => PRESSURE_UNITS.map(value => ({
  value,
  title: t(`barometric.units.pressure.${value}`),
})))
</script>

<style scoped>
.barometric-point-card {
  height: 100%;
  padding: 1.25rem;
  border: 1px solid var(--border);
  background: var(--surface-elevated);
}

.barometric-point-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.barometric-field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 0.75rem;
  align-items: start;
  margin-bottom: 0.75rem;
}

.barometric-unit-select :deep(.v-field__input) {
  padding-inline: 0.75rem;
}

@media (max-width: 420px) {
  .barometric-field-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
