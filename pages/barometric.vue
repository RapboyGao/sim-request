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

        <v-card class="mt-6 chart-card" variant="flat">
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-chart-bell-curve-cumulative" size="18" class="mr-1" />
                {{ t('barometric.chartEyebrow') }}
              </div>
              <h2 class="text-h6 font-weight-bold mt-1">{{ t('barometric.chartTitle') }}</h2>
            </div>
            <div class="chart-controls">
              <v-select
                v-model="chartHeightUnit"
                :items="heightUnitItems"
                :label="t('barometric.height')"
                density="compact"
                hide-details
                item-title="title"
                item-value="value"
                class="chart-control-select"
              />
              <v-select
                v-model="chartPressureUnit"
                :items="pressureUnitItems"
                :label="t('barometric.pressure')"
                density="compact"
                hide-details
                item-title="title"
                item-value="value"
                class="chart-control-select"
              />
            </div>
          </div>
          <div ref="chartContainer" class="barometric-chart" />
          <v-divider class="my-5" />
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
            <h2 class="text-h6 font-weight-bold">{{ t('barometric.differenceTitle') }}</h2>
            <v-chip size="small" variant="outlined">{{ t('barometric.differenceFormula') }}</v-chip>
          </div>
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="chart-difference-item">
                <div class="difference-item__label">{{ t('barometric.heightDifference') }}</div>
                <div class="chart-difference-value">
                  {{ chartHeightDifference === null ? '—' : formatDifference(chartHeightDifference, chartHeightUnit) }}
                  <span>{{ chartHeightUnit }}</span>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="chart-difference-item">
                <div class="difference-item__label">{{ t('barometric.pressureDifference') }}</div>
                <div class="chart-difference-value">
                  {{ chartPressureDifference === null ? '—' : formatDifference(chartPressureDifference, chartPressureUnit) }}
                  <span>{{ chartPressureUnit }}</span>
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
import type { ECharts, EChartsOption } from 'echarts'
import {
  HEIGHT_UNITS,
  MAX_MODEL_ALTITUDE_METERS,
  PRESSURE_UNITS,
  convertHeightToMeters,
  convertMetersToHeight,
  convertPascalsToPressure,
  formatValueForUnit,
  pressureFromAltitude,
  type HeightUnit,
  type PressureUnit,
} from '~/utils/barometric'

const { t, locale } = useI18n()
const route = useRoute()
const keyboardMode = ref<'numeric' | 'formula'>('formula')
const qrCodeDataUrl = ref('')
const chartHeightUnit = ref<HeightUnit>('ft')
const chartPressureUnit = ref<PressureUnit>('psi')
const compactChart = ref(false)
const chartContainer = ref<HTMLDivElement | null>(null)
const chart = shallowRef<ECharts | null>(null)
let chartResizeObserver: ResizeObserver | null = null
const {
  state,
  points,
  updateInput,
  updateUnit,
  commitInput,
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

function buildChartOption(): EChartsOption {
  const pointHeights = [points.value.A.heightMeters, points.value.B.heightMeters]
    .filter((value): value is number => value !== null && Number.isFinite(value))
  const rangePaddingMeters = convertHeightToMeters(1000, 'ft')
  const defaultMinimumAltitude = convertHeightToMeters(-1000, 'ft')
  const defaultMaximumAltitude = convertHeightToMeters(41000, 'ft')
  const minimumPointAltitude = pointHeights.length > 0 ? Math.min(...pointHeights) : defaultMinimumAltitude
  const maximumPointAltitude = pointHeights.length > 0 ? Math.max(...pointHeights) : defaultMaximumAltitude
  const minimumAltitude = Math.min(
    defaultMinimumAltitude,
    minimumPointAltitude < defaultMinimumAltitude ? minimumPointAltitude - rangePaddingMeters : defaultMinimumAltitude,
  )
  const maximumAltitude = Math.max(
    defaultMaximumAltitude,
    maximumPointAltitude > defaultMaximumAltitude ? maximumPointAltitude + rangePaddingMeters : defaultMaximumAltitude,
  )
  const chartMaximumAltitude = Math.min(MAX_MODEL_ALTITUDE_METERS, maximumAltitude)
  const curveData = Array.from({ length: 181 }, (_, index) => {
    const altitudeM = minimumAltitude + (chartMaximumAltitude - minimumAltitude) * index / 180
    return [convertMetersToHeight(altitudeM, chartHeightUnit.value), convertPascalsToPressure(pressureFromAltitude(altitudeM), chartPressureUnit.value)]
  })
  const formatHeight = (value: number) => formatValueForUnit(value, chartHeightUnit.value)
  const formatPressure = (value: number) => formatValueForUnit(value, chartPressureUnit.value)
  const chartGrid = compactChart.value
    ? { left: 8, right: 4, top: 16, bottom: 44, containLabel: true }
    : { left: 36, right: 8, top: 20, bottom: 48, containLabel: true }

  const pointSeries = [
    {
      name: 'A',
      value: points.value.A.heightMeters !== null && points.value.A.pressurePa !== null
        ? [convertMetersToHeight(points.value.A.heightMeters, chartHeightUnit.value), convertPascalsToPressure(points.value.A.pressurePa, chartPressureUnit.value)]
        : null,
      color: '#0f766e',
    },
    {
      name: 'B',
      value: points.value.B.heightMeters !== null && points.value.B.pressurePa !== null
        ? [convertMetersToHeight(points.value.B.heightMeters, chartHeightUnit.value), convertPascalsToPressure(points.value.B.pressurePa, chartPressureUnit.value)]
        : null,
      color: '#f97316',
    },
  ]

  return {
    animation: false,
    grid: chartGrid,
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: unknown) => formatPressure(Number(value)),
    },
    xAxis: {
      type: 'value',
      min: convertMetersToHeight(minimumAltitude, chartHeightUnit.value),
      max: convertMetersToHeight(chartMaximumAltitude, chartHeightUnit.value),
      boundaryGap: [0, 0],
      name: `${t('barometric.altitudeAxis')} (${chartHeightUnit.value})`,
      nameLocation: 'middle',
      nameGap: -30,
      axisLabel: {
        formatter: (value: number) => formatHeight(value),
        inside: true,
      },
    },
    yAxis: {
      type: 'value',
      name: `${t('barometric.pressureAxis')} (${chartPressureUnit.value})`,
      nameLocation: 'middle',
      nameGap: -32,
      axisLabel: {
        formatter: (value: number) => formatPressure(value),
        margin: compactChart.value ? 3 : 8,
        inside: true,
      },
      min: Math.min(...curveData.map(point => point[1]!)),
      max: Math.max(...curveData.map(point => point[1]!)),
    },
    series: [
      {
        name: t('barometric.standardCurve'),
        type: 'line',
        data: curveData,
        showSymbol: false,
        smooth: true,
        lineStyle: { color: '#64748b', width: 2 },
      },
      ...pointSeries
        .filter(point => point.value !== null)
        .map(point => ({
          name: point.name,
          type: 'scatter' as const,
          data: [point.value],
          symbolSize: 16,
          itemStyle: { color: point.color, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: point.name, position: 'top' as const, fontWeight: 'bold' as const },
        })),
    ],
  }
}

function updateChart() {
  chart.value?.setOption(buildChartOption(), true)
}

function updateChartViewport() {
  const nextCompactChart = window.innerWidth <= 600
  if (compactChart.value !== nextCompactChart) {
    compactChart.value = nextCompactChart
    updateChart()
  }
  chart.value?.resize()
}

onMounted(generateQRCode)
onMounted(async () => {
  const { init } = await import('echarts')
  if (!chartContainer.value) return
  chart.value = init(chartContainer.value)
  compactChart.value = window.innerWidth <= 600
  updateChart()
  chartResizeObserver = new ResizeObserver(() => chart.value?.resize())
  chartResizeObserver.observe(chartContainer.value)
  window.addEventListener('resize', updateChartViewport)
})
onBeforeUnmount(() => {
  chartResizeObserver?.disconnect()
  window.removeEventListener('resize', updateChartViewport)
  chart.value?.dispose()
  chart.value = null
})
watch(
  () => [
    points.value.A.heightMeters,
    points.value.A.pressurePa,
    points.value.B.heightMeters,
    points.value.B.pressurePa,
    chartHeightUnit.value,
    chartPressureUnit.value,
    locale.value,
  ],
  updateChart,
)
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

const chartHeightDifference = computed(() => {
  if (points.value.A.heightMeters === null || points.value.B.heightMeters === null) return null
  return convertMetersToHeight(points.value.A.heightMeters - points.value.B.heightMeters, chartHeightUnit.value)
})

const chartPressureDifference = computed(() => {
  if (points.value.A.pressurePa === null || points.value.B.pressurePa === null) return null
  return convertPascalsToPressure(points.value.A.pressurePa - points.value.B.pressurePa, chartPressureUnit.value)
})

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

function formatDifference(value: number, unit: HeightUnit | PressureUnit) {
  return formatValueForUnit(value, unit)
}

</script>

<style scoped>
.barometric-page {
  min-height: 100vh;
}

.barometric-hero,
.qr-card {
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--bg-accent-start), var(--bg-accent-soft-2));
  box-shadow: 0 10px 30px var(--shadow);
}

.chart-card {
  border: 0;
  overflow: visible;
  background: transparent;
  box-shadow: none;
}

.barometric-chart {
  width: 100%;
  height: 380px;
}

.chart-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.chart-control-select {
  width: 150px;
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

.chart-difference-item {
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

.chart-difference-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  color: rgb(var(--v-theme-primary));
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 800;
}

.chart-difference-value span {
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .barometric-chart {
    width: calc(100% + 1.5rem);
    height: 320px;
    margin-inline: -0.75rem;
  }

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

  .chart-controls {
    width: 100%;
    justify-content: flex-start;
  }

}

</style>
