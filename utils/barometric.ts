import { evaluate } from 'mathjs'

export const HEIGHT_UNITS = ['ft', 'm', 'km', 'in', 'mi', 'nmi'] as const
export type HeightUnit = (typeof HEIGHT_UNITS)[number]

export const PRESSURE_UNITS = ['psi', 'inHg', 'Pa', 'hPa', 'kPa', 'bar', 'atm', 'mmHg'] as const
export type PressureUnit = (typeof PRESSURE_UNITS)[number]

const HEIGHT_TO_METERS: Record<HeightUnit, number> = {
  ft: 0.3048,
  m: 1,
  km: 1000,
  in: 0.0254,
  mi: 1609.344,
  nmi: 1852,
}

const PRESSURE_TO_PASCALS: Record<PressureUnit, number> = {
  psi: 6894.757293168,
  inHg: 3386.389,
  Pa: 1,
  hPa: 100,
  kPa: 1000,
  bar: 100000,
  atm: 101325,
  mmHg: 133.322387415,
}

const G0 = 9.80665
const MOLAR_MASS = 28.9644
const GAS_CONSTANT = 8.31432e3
const MAX_ALTITUDE_METERS = 86000

type AtmosphereLayer = {
  baseAltitudeM: number
  basePressurePa: number
  baseTemperatureK: number
  lapseRateKPerM: number
}

// U.S. Standard Atmosphere 1976 layer bases from the referenced formula.
const ATMOSPHERE_LAYERS: AtmosphereLayer[] = [
  { baseAltitudeM: 0, basePressurePa: 101325, baseTemperatureK: 288.15, lapseRateKPerM: -0.0065 },
  { baseAltitudeM: 11000, basePressurePa: 22632.1, baseTemperatureK: 216.65, lapseRateKPerM: 0 },
  { baseAltitudeM: 20000, basePressurePa: 5474.89, baseTemperatureK: 216.65, lapseRateKPerM: 0.001 },
  { baseAltitudeM: 32000, basePressurePa: 868.019, baseTemperatureK: 228.65, lapseRateKPerM: 0.0028 },
  { baseAltitudeM: 47000, basePressurePa: 110.9063, baseTemperatureK: 270.65, lapseRateKPerM: 0 },
  { baseAltitudeM: 51000, basePressurePa: 66.9389, baseTemperatureK: 270.65, lapseRateKPerM: -0.0028 },
  { baseAltitudeM: 71000, basePressurePa: 3.95642, baseTemperatureK: 214.65, lapseRateKPerM: -0.002 },
]

const EXPONENT_BASE = G0 * MOLAR_MASS / GAS_CONSTANT

export function convertHeightToMeters(value: number, unit: HeightUnit) {
  return value * HEIGHT_TO_METERS[unit]
}

export function convertMetersToHeight(value: number, unit: HeightUnit) {
  return value / HEIGHT_TO_METERS[unit]
}

export function convertPressureToPascals(value: number, unit: PressureUnit) {
  return value * PRESSURE_TO_PASCALS[unit]
}

export function convertPascalsToPressure(value: number, unit: PressureUnit) {
  return value / PRESSURE_TO_PASCALS[unit]
}

export function evaluateNumericExpression(expression: string) {
  if (!expression.trim()) return null

  try {
    const normalizedExpression = expression
      .replace(/[×✕＊]/g, '*')
      .replace(/[÷／]/g, '/')
    const value = evaluate(normalizedExpression)
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function pressureInLayer(altitudeM: number, layer: AtmosphereLayer) {
  const deltaAltitude = altitudeM - layer.baseAltitudeM

  if (layer.lapseRateKPerM === 0) {
    return layer.basePressurePa * Math.exp(-EXPONENT_BASE * deltaAltitude / layer.baseTemperatureK)
  }

  const temperature = layer.baseTemperatureK + layer.lapseRateKPerM * deltaAltitude
  return layer.basePressurePa * Math.pow(
    layer.baseTemperatureK / temperature,
    EXPONENT_BASE / layer.lapseRateKPerM,
  )
}

function layerForAltitude(altitudeM: number) {
  return [...ATMOSPHERE_LAYERS].reverse().find(layer => altitudeM >= layer.baseAltitudeM) || ATMOSPHERE_LAYERS[0]!
}

function layerForPressure(pressurePa: number) {
  if (pressurePa >= ATMOSPHERE_LAYERS[0]!.basePressurePa) {
    return ATMOSPHERE_LAYERS[0]!
  }

  return ATMOSPHERE_LAYERS.find((layer, index) => {
    const nextLayer = ATMOSPHERE_LAYERS[index + 1]
    const nextPressure = nextLayer ? pressureInLayer(nextLayer.baseAltitudeM, layer) : pressureInLayer(MAX_ALTITUDE_METERS, layer)
    return pressurePa <= layer.basePressurePa && pressurePa >= nextPressure
  })
}

export function pressureFromAltitude(altitudeM: number) {
  if (!Number.isFinite(altitudeM) || altitudeM > MAX_ALTITUDE_METERS) {
    throw new RangeError('Altitude must be below 86 km.')
  }

  const pressure = pressureInLayer(altitudeM, layerForAltitude(altitudeM))
  if (!Number.isFinite(pressure)) {
    throw new RangeError('Altitude is outside the supported numeric range.')
  }
  return pressure
}

export function altitudeFromPressure(pressurePa: number) {
  const minimumPressure = pressureInLayer(MAX_ALTITUDE_METERS, ATMOSPHERE_LAYERS[ATMOSPHERE_LAYERS.length - 1]!)

  if (!Number.isFinite(pressurePa) || pressurePa < minimumPressure) {
    throw new RangeError(`Pressure must be at least ${minimumPressure} Pa.`)
  }

  const layer = layerForPressure(pressurePa) || ATMOSPHERE_LAYERS[ATMOSPHERE_LAYERS.length - 1]!
  if (layer.lapseRateKPerM === 0) {
    return layer.baseAltitudeM - layer.baseTemperatureK / EXPONENT_BASE * Math.log(pressurePa / layer.basePressurePa)
  }

  return layer.baseAltitudeM + layer.baseTemperatureK * (
    Math.pow(layer.basePressurePa / pressurePa, layer.lapseRateKPerM / EXPONENT_BASE) - 1
  ) / layer.lapseRateKPerM
}

export function formatInputValue(value: number) {
  if (Object.is(value, -0) || value === 0) return '0'
  return Number(value.toPrecision(12)).toString()
}

export function formatDisplayValue(value: number) {
  if (Object.is(value, -0) || value === 0) return '0'
  return Number(value.toPrecision(8)).toLocaleString('en-US', { maximumFractionDigits: 8 })
}

export function getMinimumModelPressure() {
  return pressureInLayer(MAX_ALTITUDE_METERS, ATMOSPHERE_LAYERS[ATMOSPHERE_LAYERS.length - 1]!)
}
