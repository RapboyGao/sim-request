<template>
  <v-container class="py-8 barometric-page">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card class="pa-5 pa-sm-7 barometric-hero mb-6" variant="flat">
          <div class="barometric-hero__content">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-weather-windy" size="18" class="mr-1" />
                {{ t('barometric.eyebrow') }}
              </div>
              <h1 class="text-h4 text-sm-h3 font-weight-bold mt-2 mb-3">
                {{ t('barometric.title') }}
              </h1>
            </div>
            <div class="barometric-hero__actions">
              <v-btn
                class="keyboard-toggle"
                color="primary"
                variant="outlined"
                :prepend-icon="keyboardMode === 'numeric' ? 'mdi-numeric' : 'mdi-function-variant'"
                @click="toggleKeyboardMode"
              >
                {{ keyboardMode === 'numeric' ? t('barometric.numericKeyboard') : t('barometric.formulaKeyboard') }}
              </v-btn>
            </div>
          </div>
        </v-card>

        <v-row>
          <v-col cols="12" md="6">
            <BarometricPointCard
              :title="t('barometric.pointA')"
              :point-state="state.pointA"
              :resolved="points.A"
              :input-mode="inputMode"
              @update-input="(kind, expression) => updateInput('A', kind, expression)"
              @update-unit="(kind, unit) => updateUnit('A', kind, unit)"
              @commit-input="kind => commitPointInput('A', kind)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <BarometricPointCard
              :title="t('barometric.pointB')"
              :point-state="state.pointB"
              :resolved="points.B"
              :input-mode="inputMode"
              @update-input="(kind, expression) => updateInput('B', kind, expression)"
              @update-unit="(kind, unit) => updateUnit('B', kind, unit)"
              @commit-input="kind => commitPointInput('B', kind)"
            />
          </v-col>
        </v-row>

        <v-card class="pa-5 pa-sm-6 mt-6 difference-card" variant="flat">
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-5">
            <div>
              <h2 class="text-h6 font-weight-bold mt-1">{{ t('barometric.differenceTitle') }}</h2>
            </div>
            <v-chip size="small" variant="outlined">{{ t('barometric.differenceFormula') }}</v-chip>
          </div>

          <v-row dense>
            <v-col cols="12" md="6">
              <div class="difference-item">
                <div class="difference-item__label">{{ t('barometric.heightDifference') }}</div>
                <div class="difference-item__value">
                  <span>{{ heightDifference === null ? '—' : formatDifference(heightDifference) }}</span>
                  <v-select
                    :model-value="state.heightDifferenceUnit"
                    :items="heightUnitItems"
                    density="compact"
                    hide-details
                    item-title="title"
                    item-value="value"
                    class="difference-item__select"
                    @update:model-value="updateDifferenceUnit('height', $event)"
                  />
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="difference-item">
                <div class="difference-item__label">{{ t('barometric.pressureDifference') }}</div>
                <div class="difference-item__value">
                  <span>{{ pressureDifference === null ? '—' : formatDifference(pressureDifference) }}</span>
                  <v-select
                    :model-value="state.pressureDifferenceUnit"
                    :items="pressureUnitItems"
                    density="compact"
                    hide-details
                    item-title="title"
                    item-value="value"
                    class="difference-item__select"
                    @update:model-value="updateDifferenceUnit('pressure', $event)"
                  />
                </div>
              </div>
            </v-col>
          </v-row>

        </v-card>

        <v-card class="pa-5 pa-sm-6 mt-6 qr-card" variant="flat">
          <div class="qr-card__content">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-qrcode" size="18" class="mr-1" />
                {{ t('barometric.qrEyebrow') }}
              </div>
              <h2 class="text-h6 font-weight-bold mt-1 mb-2">{{ t('barometric.qrTitle') }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ t('barometric.qrHint') }}</p>
            </div>
            <div class="qr-frame">
              <v-progress-circular v-if="!qrCodeDataUrl" indeterminate color="primary" size="32" />
              <img v-else :src="qrCodeDataUrl" :alt="t('barometric.qrAlt')" width="220" height="220" />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import {
  HEIGHT_UNITS,
  PRESSURE_UNITS,
  formatDisplayValue,
  type HeightUnit,
  type PressureUnit,
} from '~/utils/barometric'

const { t } = useI18n()
const route = useRoute()
const keyboardMode = ref<'numeric' | 'formula'>('formula')
const qrCodeDataUrl = ref('')
const {
  state,
  points,
  heightDifference,
  pressureDifference,
  updateInput,
  updateUnit,
  commitInput,
  updateDifferenceUnit: setDifferenceUnit,
} = useBarometricConverter()

useHead({
  title: t('app.navBarometric'),
})

async function generateQRCode() {
  if (!import.meta.client) return

  try {
    const pageUrl = new URL(route.fullPath, window.location.origin).toString()
    qrCodeDataUrl.value = await QRCode.toDataURL(pageUrl, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
  } catch {
    qrCodeDataUrl.value = ''
  }
}

onMounted(generateQRCode)
watch(() => route.fullPath, generateQRCode)

const heightUnitItems = computed(() => HEIGHT_UNITS.map(value => ({
  value,
  title: t(`barometric.units.height.${value}`),
})))

const pressureUnitItems = computed(() => PRESSURE_UNITS.map(value => ({
  value,
  title: t(`barometric.units.pressure.${value}`),
})))

const inputMode = computed(() => keyboardMode.value === 'formula' ? 'text' : 'decimal')

function toggleKeyboardMode() {
  keyboardMode.value = keyboardMode.value === 'numeric' ? 'formula' : 'numeric'
}

function commitPointInput(pointId: 'A' | 'B', kind: 'height' | 'pressure') {
  if (!commitInput(pointId, kind)) return

  nextTick(() => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('.barometric-expression-input input'))
    const currentIndex = inputs.indexOf(document.activeElement as HTMLInputElement)
    inputs[currentIndex + 1]?.focus()
  })
}

function formatDifference(value: number) {
  return formatDisplayValue(value)
}

function updateDifferenceUnitForPage(kind: 'height' | 'pressure', unit: HeightUnit | PressureUnit) {
  setDifferenceUnit(kind, unit)
}

// Keep the template handler name explicit so unit values remain strongly typed.
const updateDifferenceUnit = updateDifferenceUnitForPage
</script>

<style scoped>
.barometric-page {
  min-height: 100vh;
}

.barometric-hero,
.difference-card,
.qr-card {
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--bg-accent-start), var(--bg-accent-soft-2));
  box-shadow: 0 10px 30px var(--shadow);
}

.qr-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.qr-frame {
  display: grid;
  flex: 0 0 auto;
  width: 236px;
  height: 236px;
  place-items: center;
  padding: 8px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 18px rgb(15 23 42 / 10%);
}

.qr-frame img {
  display: block;
}

.barometric-hero__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.barometric-hero__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.keyboard-toggle {
  min-width: 150px;
}

.barometric-summary {
  max-width: 760px;
  line-height: 1.7;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.difference-item {
  height: 100%;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-elevated);
}

.difference-item__label {
  margin-bottom: 0.6rem;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 600;
}

.difference-item__value {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 0.75rem;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 800;
}

.difference-item__select {
  font-size: 0.9rem;
  font-weight: 400;
}

@media (max-width: 600px) {
  .barometric-hero__content {
    flex-direction: column;
  }

  .qr-card__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .barometric-hero__actions {
    width: 100%;
    align-items: stretch;
  }

  .keyboard-toggle {
    width: 100%;
  }

}

@media (max-width: 420px) {
  .difference-item__value {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
