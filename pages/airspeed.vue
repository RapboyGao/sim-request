<template>
  <v-container class="py-8 airspeed-page">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card class="pa-5 pa-sm-7 airspeed-hero mb-6" variant="flat">
          <div class="airspeed-hero__content">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-airplane-takeoff" size="18" class="mr-1" />
                {{ t("airspeed.eyebrow") }}
              </div>
              <h1 class="text-h4 text-sm-h3 font-weight-bold mt-2 mb-3">
                {{ t("airspeed.title") }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ t("airspeed.summary") }}</p>
            </div>
          </div>
        </v-card>

        <v-card class="pa-5 pa-sm-6 airspeed-card" variant="flat">
          <div class="eyebrow">
            <v-icon icon="mdi-tune-variant" size="18" class="mr-1" />
            {{ t("airspeed.inputEyebrow") }}
          </div>
          <h2 class="text-h6 font-weight-bold mt-1 mb-4">{{ t("airspeed.inputTitle") }}</h2>

          <v-row>
            <v-col cols="12" md="6">
              <div class="field-with-unit">
                <v-text-field
                  :model-value="state.expressions.altitude"
                  :label="t('airspeed.fields.altitude')"
                  type="text"
                  inputmode="text"
                  step="any"
                  prepend-inner-icon="mdi-arrow-up-down"
                  @update:model-value="updateAltitudeValue"
                />
                <v-select
                  :model-value="state.altitudeUnit"
                  :items="heightUnitItems"
                  :label="t('airspeed.unit')"
                  item-title="title"
                  item-value="value"
                  class="unit-select"
                  @update:model-value="updateAltitudeUnit"
                >
                  <template #selection="{ item }">
                    <span class="unit-selection-title" :title="item.title">{{ item.value }}</span>
                  </template>
                </v-select>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="state.expressions.sat"
                :label="t('airspeed.fields.sat')"
                suffix="°C"
                type="text"
                inputmode="text"
                step="any"
                prepend-inner-icon="mdi-thermometer"
                @update:model-value="updateSatValue"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                :model-value="state.expressions.isaDeviation"
                :label="t('airspeed.fields.isaDeviation')"
                suffix="°C"
                type="text"
                inputmode="text"
                step="any"
                prepend-inner-icon="mdi-thermometer-plus"
                @update:model-value="updateIsaValue"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="state.expressions.windFrom"
                :label="t('airspeed.fields.windFrom')"
                suffix="°"
                type="text"
                inputmode="text"
                min="0"
                max="360"
                step="1"
                prepend-inner-icon="mdi-weather-windy"
                @update:model-value="updateWindFromValue"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="state.expressions.windSpeed"
                :label="t('airspeed.fields.windSpeed')"
                :suffix="state.speedUnit"
                type="text"
                inputmode="text"
                min="0"
                step="any"
                prepend-inner-icon="mdi-weather-windy-variant"
                @update:model-value="updateWindSpeedValue"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                :model-value="state.expressions.track"
                :label="t('airspeed.fields.track')"
                suffix="°"
                type="text"
                inputmode="text"
                min="0"
                max="360"
                step="1"
                prepend-inner-icon="mdi-compass-outline"
                @update:model-value="updateTrackValue"
              />
            </v-col>
          </v-row>

          <div class="text-caption text-medium-emphasis mt-1">
            {{ t("airspeed.temperatureHint", { temperature: standardTemperature === null ? "—" : formatTemperature(standardTemperature) }) }}
          </div>
        </v-card>

        <v-card class="pa-5 pa-sm-6 mt-6 airspeed-card" variant="flat">
          <div class="eyebrow">
            <v-icon icon="mdi-speedometer" size="18" class="mr-1" />
            {{ t("airspeed.speedEyebrow") }}
          </div>
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
            <h2 class="text-h6 font-weight-bold mt-1 mb-0">{{ t("airspeed.speedTitle") }}</h2>
            <v-select
              :model-value="state.speedUnit"
              :items="speedUnitItems"
              :label="t('airspeed.unit')"
              item-title="title"
              item-value="value"
              class="speed-unit-select"
              hide-details
              @update:model-value="updateSpeedUnit"
            >
              <template #selection="{ item }">
                <span class="unit-selection-title" :title="item.title">{{ item.value }}</span>
              </template>
            </v-select>
          </div>
          <v-row>
            <v-col v-for="item in speedInputItems" :key="item.value" cols="12" sm="6" md="3">
              <div class="speed-input" :class="{ 'speed-input--active': state.mode === item.value }">
                <v-text-field
                  :model-value="speedInputValue(item.value)"
                  :label="item.title"
                  :suffix="item.value === 'mach' ? undefined : state.speedUnit"
                  type="text"
                  inputmode="text"
                  min="0"
                  step="any"
                  prepend-inner-icon="mdi-speedometer"
                  :error="Boolean(error && (error.code === 'unsupported-supersonic' || error.code === 'track-unachievable'))"
                  @update:model-value="updateSpeedValue(item.value, $event)"
                />
              </div>
            </v-col>
          </v-row>
          <v-alert v-if="error" class="mt-2" type="warning" variant="tonal" density="comfortable">
            {{ errorMessage }}
          </v-alert>
        </v-card>

        <v-card class="pa-5 pa-sm-6 mt-6 airspeed-card" variant="flat">
          <div class="eyebrow">
            <v-icon icon="mdi-chart-box-outline" size="18" class="mr-1" />
            {{ t("airspeed.resultEyebrow") }}
          </div>
          <h2 class="text-h6 font-weight-bold mt-1 mb-4">{{ t("airspeed.resultTitle") }}</h2>
          <div class="result-tile result-tile--tat">
            <div class="result-tile__label">{{ t("airspeed.results.tat") }}</div>
            <div class="result-tile__value">{{ result ? formatTemperature(result.tatCelsius) : "—" }} <span class="result-tile__unit">°C</span></div>
          </div>
          <v-divider class="my-5" />
          <v-row dense>
            <v-col cols="12" sm="4">
              <div class="secondary-result">
                <span>{{ t("airspeed.results.heading") }}</span>
                <strong>{{ result ? formatDirection(result.headingDegrees) : "—" }}°</strong>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="secondary-result">
                <span>{{ t("airspeed.results.headwind") }}</span>
                <strong>{{ result ? formatSignedSpeed(result.headwindComponentKnots) : "—" }} {{ state.speedUnit }}</strong>
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="secondary-result">
                <span>{{ t("airspeed.results.crosswind") }}</span>
                <strong>{{ result ? formatSignedSpeed(result.crosswindComponentKnots) : "—" }} {{ state.speedUnit }}</strong>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card class="pa-5 pa-sm-6 mt-6 airspeed-card" variant="flat">
          <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-3">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-vector-triangle" size="18" class="mr-1" />
                {{ t("airspeed.chartEyebrow") }}
              </div>
              <h2 class="text-h6 font-weight-bold mt-1 mb-0">{{ t("airspeed.chartTitle") }}</h2>
            </div>
            <div class="vector-legend">
              <span v-for="item in vectorLegend" :key="item.key" class="vector-legend__item">
                <i class="vector-legend__swatch" :style="{ backgroundColor: item.color }" />
                {{ item.label }}
              </span>
            </div>
          </div>
          <p class="text-caption text-medium-emphasis mb-3">{{ t("airspeed.chartHint") }}</p>
          <div ref="chartContainer" class="airspeed-chart" :class="{ 'airspeed-chart--hidden': !result }" />
          <div v-if="!result" class="chart-empty">
            <v-icon icon="mdi-chart-bell-curve-cumulative" size="34" />
            <span>{{ t("airspeed.chartUnavailable") }}</span>
          </div>
        </v-card>

        <v-card class="pa-5 pa-sm-6 mt-6 qr-card" variant="flat">
          <div class="qr-card__content">
            <div>
              <div class="eyebrow">
                <v-icon icon="mdi-qrcode" size="18" class="mr-1" />
                {{ t("airspeed.qrEyebrow") }}
              </div>
              <h2 class="text-h6 font-weight-bold mt-1 mb-2">{{ t("airspeed.qrTitle") }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ t("airspeed.qrHint") }}</p>
            </div>
            <div class="qr-frame">
              <v-progress-circular v-if="!qrCodeDataUrl" indeterminate color="primary" size="32" />
              <img v-else :src="qrCodeDataUrl" :alt="t('airspeed.qrAlt')" width="220" height="220" />
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
  AIRSPEED_UNITS,
  type AirspeedMode,
  type AirspeedUnit,
} from '~/utils/airspeed'
import { convertMetersToHeight, type HeightUnit } from '~/utils/barometric'

const { t, locale } = useI18n()
const route = useRoute()
const qrCodeDataUrl = ref('')
const chartContainer = ref<HTMLDivElement | null>(null)
const chart = shallowRef<ECharts | null>(null)
let chartResizeObserver: ResizeObserver | null = null

const {
  state,
  standardTemperature,
  speedValues,
  result,
  error,
  updateSpeed,
  updateAltitude,
  updateAltitudeUnit,
  updateSpeedUnit,
  updateSat,
  updateIsaDeviation,
  updateWindFrom,
  updateWindSpeed,
  updateTrack,
} = useAirspeedConverter()

useHead({ title: t('app.navAirspeed') })

const speedInputItems = computed(() => (['gs', 'tas', 'mach', 'cas'] as AirspeedMode[]).map(value => ({
  value,
  title: t(`airspeed.modes.${value}`),
})))
const speedUnitItems = computed(() => AIRSPEED_UNITS.map(value => ({
  value,
  title: t(`airspeed.units.${value}`),
})))
const heightUnitItems = computed(() => (['ft', 'm'] as HeightUnit[]).map(value => ({
  value,
  title: t(`barometric.units.height.${value}`),
})))
const errorMessage = computed(() => error.value ? t(`airspeed.errors.${error.value.code}`) : '')
const vectorLegend = computed(() => [
  { key: 'tas', label: t('airspeed.vectors.tas'), color: '#0f766e' },
  { key: 'wind', label: t('airspeed.vectors.wind'), color: '#f97316' },
  { key: 'gs', label: t('airspeed.vectors.gs'), color: '#2563eb' },
])
function expressionValue(value: unknown) {
  return value === null || value === undefined ? '' : String(value)
}

function speedInputValue(mode: AirspeedMode) {
  if (state.value.mode === mode) return state.value.expressions.speed
  const value = speedValues.value[mode]
  if (value === null || !Number.isFinite(value)) return null
  return mode === 'mach'
    ? Number(value.toPrecision(8))
    : Number(convertKnotsToDisplay(value).toPrecision(8))
}

function updateSpeedValue(mode: AirspeedMode, value: unknown) {
  updateSpeed(mode, expressionValue(value))
}

function updateAltitudeValue(value: unknown) {
  updateAltitude(expressionValue(value))
}

function updateSatValue(value: unknown) {
  updateSat(expressionValue(value))
}

function updateIsaValue(value: unknown) {
  updateIsaDeviation(expressionValue(value))
}

function updateWindFromValue(value: unknown) {
  updateWindFrom(expressionValue(value))
}

function updateWindSpeedValue(value: unknown) {
  updateWindSpeed(expressionValue(value))
}

function updateTrackValue(value: unknown) {
  updateTrack(expressionValue(value))
}

function convertKnotsToDisplay(value: number) {
  if (state.value.speedUnit === 'kt') return value
  if (state.value.speedUnit === 'km/h') return value * 1.852
  if (state.value.speedUnit === 'mph') return value * 1.150779448
  return value * 0.5144444444444444
}

function formatSpeed(value: number) {
  return convertKnotsToDisplay(value).toFixed(state.value.speedUnit === 'm/s' ? 1 : 0)
}

function formatSignedSpeed(value: number) {
  const formatted = formatSpeed(Math.abs(value))
  return value > 0 ? `+${formatted}` : value < 0 ? `−${formatted}` : '0'
}

function formatDirection(value: number) {
  return Math.round(value).toString().padStart(3, '0')
}

function formatTemperature(value: number | null) {
  return value === null || !Number.isFinite(value) ? '—' : value.toFixed(1)
}

async function generateQRCode() {
  if (!import.meta.client) return
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(new URL(route.fullPath, window.location.origin).toString(), {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
  } catch {
    qrCodeDataUrl.value = ''
  }
}

function buildChartOption(): EChartsOption {
  if (!result.value) return { series: [] }

  const air = result.value.airVector
  const wind = result.value.windVector
  const ground = result.value.groundVector
  const vectors = [
    { name: t('airspeed.vectors.tas'), color: '#0f766e', from: { east: 0, north: 0 }, to: air, label: `${t('airspeed.vectors.tas')} ${formatSpeed(result.value.tasKnots)} ${state.value.speedUnit}` },
    { name: t('airspeed.vectors.wind'), color: '#f97316', from: air, to: ground, label: `${t('airspeed.vectors.wind')} ${formatSpeed(vectorMagnitude(wind))} ${state.value.speedUnit}` },
    { name: t('airspeed.vectors.gs'), color: '#2563eb', from: { east: 0, north: 0 }, to: ground, label: `${t('airspeed.vectors.gs')} ${formatSpeed(result.value.gsKnots)} ${state.value.speedUnit}` },
  ]
  const coordinates = vectors.flatMap(vector => [vector.from, vector.to])
  const range = Math.max(1, ...coordinates.flatMap(point => [Math.abs(point.east), Math.abs(point.north)])) * 1.2
  const width = chartContainer.value?.clientWidth || 520
  const chartSize = Math.max(220, Math.min(width, 420))
  const chartLeft = Math.max(0, (width - chartSize) / 2)

  return {
    animation: false,
    grid: { left: chartLeft, top: 8, width: chartSize, height: chartSize, containLabel: false },
    xAxis: { type: 'value', min: -range, max: range, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: true, lineStyle: { color: 'rgba(100, 116, 139, 0.18)' } } },
    yAxis: { type: 'value', min: -range, max: range, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: true, lineStyle: { color: 'rgba(100, 116, 139, 0.18)' } } },
    series: [{
      type: 'custom',
      coordinateSystem: 'cartesian2d',
      silent: true,
      data: vectors,
      renderItem: (params: any, api: any) => {
        // ECharts custom series does not guarantee that `params.data` contains
        // the original object. Use the data index to retrieve the vector from
        // the closure so chart refreshes cannot abort the Vue update cycle.
        const vector = vectors[params.dataIndex]
        if (!vector) return { type: 'group', children: [] }
        const from = api.coord([vector.from.east, vector.from.north]) as [number, number]
        const to = api.coord([vector.to.east, vector.to.north]) as [number, number]
        const angle = Math.atan2(to[1] - from[1], to[0] - from[0])
        const arrowLength = 11
        const left: [number, number] = [to[0] - arrowLength * Math.cos(angle - Math.PI / 6), to[1] - arrowLength * Math.sin(angle - Math.PI / 6)]
        const right: [number, number] = [to[0] - arrowLength * Math.cos(angle + Math.PI / 6), to[1] - arrowLength * Math.sin(angle + Math.PI / 6)]
        const midpoint: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
        const normal: [number, number] = [-Math.sin(angle) * 14, Math.cos(angle) * 14]
        return {
          type: 'group',
          children: [
            { type: 'line', shape: { x1: from[0], y1: from[1], x2: to[0], y2: to[1] }, style: { stroke: vector.color, lineWidth: 3 } },
            { type: 'polygon', shape: { points: [[to[0], to[1]], left, right] }, style: { fill: vector.color } },
            { type: 'text', style: { x: midpoint[0] + normal[0], y: midpoint[1] + normal[1], text: vector.label, fill: vector.color, font: '600 12px sans-serif', textAlign: 'center', textVerticalAlign: 'middle', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: [3, 5], borderRadius: 3 } },
          ],
        }
      },
    } as any],
  }
}

function vectorMagnitude(vector: { east: number; north: number }) {
  return Math.hypot(vector.east, vector.north)
}

function updateChart() {
  chart.value?.setOption(buildChartOption(), true)
}

function updateChartViewport() {
  updateChart()
  chart.value?.resize()
}

onMounted(generateQRCode)
onMounted(async () => {
  const { init } = await import('echarts')
  if (!chartContainer.value) return
  chart.value = init(chartContainer.value)
  updateChart()
  chartResizeObserver = new ResizeObserver(updateChartViewport)
  chartResizeObserver.observe(chartContainer.value)
  window.addEventListener('resize', updateChartViewport)
})
onBeforeUnmount(() => {
  chartResizeObserver?.disconnect()
  window.removeEventListener('resize', updateChartViewport)
  chart.value?.dispose()
  chart.value = null
})
watch(() => [result.value, state.value.speedUnit, locale.value] as const, updateChart, { deep: true })
watch(() => route.fullPath, generateQRCode)
</script>

<style scoped>
.airspeed-page { min-height: 100vh; }

.airspeed-hero,
.qr-card {
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--bg-accent-start), var(--bg-accent-soft-2));
  box-shadow: 0 10px 30px var(--shadow);
}

.airspeed-hero__content { display: flex; justify-content: space-between; gap: 1.5rem; }
.airspeed-card { border: 1px solid var(--border); background: var(--surface-elevated); }
.field-with-unit { display: grid; grid-template-columns: minmax(0, 1fr) 126px; gap: 0.75rem; }
.unit-select :deep(.v-field__input) { padding-inline: 0.75rem; }
.speed-unit-select { width: 150px; }
.speed-input { padding: 0.55rem 0.55rem 0; border: 1px solid transparent; border-radius: 14px; transition: border-color 0.2s, background-color 0.2s; }
.speed-input--active { border-color: rgb(var(--v-theme-primary)); background: var(--bg-accent-soft); }
.unit-selection-title { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-tile { height: 100%; padding: 1rem; border: 1px solid var(--border); border-radius: 14px; background: var(--surface-elevated); }
.result-tile__label { color: var(--muted); font-size: 0.85rem; }
.result-tile__value { margin-top: 0.35rem; color: var(--text); font-size: clamp(1.25rem, 3vw, 1.8rem); font-weight: 700; }
.result-tile__unit { color: var(--muted); font-size: 0.8rem; font-weight: 500; }
.secondary-result { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem 0.9rem; border-radius: 10px; background: var(--bg-accent-soft); }
.secondary-result span { color: var(--muted); }
.vector-legend { display: flex; flex-wrap: wrap; gap: 0.8rem; color: var(--muted); font-size: 0.8rem; }
.vector-legend__item { display: inline-flex; align-items: center; gap: 0.35rem; }
.vector-legend__swatch { width: 0.7rem; height: 0.7rem; border-radius: 50%; }
.airspeed-chart { width: 100%; height: 420px; }
.airspeed-chart--hidden { display: none; }
.chart-empty { display: grid; min-height: 260px; place-items: center; align-content: center; gap: 0.75rem; color: var(--muted); }
.qr-card__content { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.qr-frame { display: grid; flex: 0 0 auto; width: 236px; height: 236px; place-items: center; border-radius: 18px; background: white; }

@media (max-width: 600px) {
  .field-with-unit { grid-template-columns: 1fr; gap: 0; }
  .speed-unit-select { width: 100%; }
  .airspeed-chart { height: 330px; }
  .qr-card__content { align-items: flex-start; flex-direction: column; }
}
</style>
