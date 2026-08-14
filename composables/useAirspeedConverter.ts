import { useStorage } from '@vueuse/core'
import {
  AIRSPEED_MODES,
  AIRSPEED_UNITS,
  AirspeedCalculationError,
  AirspeedCalculator,
  convertKnotsToUnit,
  convertUnitToKnots,
  type AirspeedMode,
  type AirspeedSnapshot,
  type AirspeedUnit,
} from '~/utils/airspeed'
import {
  convertHeightToMeters,
  convertMetersToHeight,
  evaluateNumericExpression,
  standardAtmosphereFromAltitude,
  type HeightUnit,
} from '~/utils/barometric'

export type AirspeedTemperatureSource = 'sat' | 'isaDeviation'

export type AirspeedExpressions = {
  speed: string
  altitude: string
  sat: string
  isaDeviation: string
  windFrom: string
  windSpeed: string
  track: string
}

export type AirspeedStoredState = {
  version: 1
  mode: AirspeedMode
  groundspeedKnots: number
  altitudeMeters: number
  altitudeUnit: HeightUnit
  speedUnit: AirspeedUnit
  satCelsius: number
  isaDeviationCelsius: number
  temperatureSource: AirspeedTemperatureSource
  windFromDegrees: number
  windSpeedKnots: number
  trackDegrees: number
  expressions: AirspeedExpressions
}

const DEFAULT_STATE: AirspeedStoredState = {
  version: 1,
  mode: 'cas',
  groundspeedKnots: 0,
  altitudeMeters: 0,
  altitudeUnit: 'ft',
  speedUnit: 'kt',
  satCelsius: 15,
  isaDeviationCelsius: 0,
  // SAT is the initial known temperature. Changing altitude therefore
  // recalculates ISA deviation, while editing ISA deviation switches the
  // linked altitude behavior to preserve that deviation.
  temperatureSource: 'sat',
  windFromDegrees: 0,
  windSpeedKnots: 0,
  trackDegrees: 0,
  expressions: {
    speed: '0',
    altitude: '0',
    sat: '15',
    isaDeviation: '0',
    windFrom: '0',
    windSpeed: '0',
    track: '0',
  },
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE)) as AirspeedStoredState
}

function isMode(value: unknown): value is AirspeedMode {
  return typeof value === 'string' && AIRSPEED_MODES.includes(value as AirspeedMode)
}

function isSpeedUnit(value: unknown): value is AirspeedUnit {
  return typeof value === 'string' && AIRSPEED_UNITS.includes(value as AirspeedUnit)
}

function isHeightUnit(value: unknown): value is HeightUnit {
  return value === 'ft' || value === 'm'
}

function isExpressions(value: unknown): value is AirspeedExpressions {
  if (!value || typeof value !== 'object') return false
  const expressions = value as Partial<AirspeedExpressions>
  return ['speed', 'altitude', 'sat', 'isaDeviation', 'windFrom', 'windSpeed', 'track']
    .every(key => typeof expressions[key as keyof AirspeedExpressions] === 'string')
}

function isStoredState(value: unknown): value is AirspeedStoredState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<AirspeedStoredState>
  return state.version === 1
    && isMode(state.mode)
    && Number.isFinite(state.groundspeedKnots)
    && Number.isFinite(state.altitudeMeters)
    && isHeightUnit(state.altitudeUnit)
    && isSpeedUnit(state.speedUnit)
    && Number.isFinite(state.satCelsius)
    && Number.isFinite(state.isaDeviationCelsius)
    && (state.temperatureSource === 'sat' || state.temperatureSource === 'isaDeviation')
    && Number.isFinite(state.windFromDegrees)
    && Number.isFinite(state.windSpeedKnots)
    && Number.isFinite(state.trackDegrees)
    && isExpressions(state.expressions)
}

function expressionText(value: string | number | null) {
  return value === null ? '' : String(value)
}

function parseExpression(value: string | number | null) {
  return evaluateNumericExpression(expressionText(value))
}

function formatNumericExpression(value: number) {
  return Number.isFinite(value) ? Number(value.toPrecision(12)).toString() : ''
}

function createCalculator(state: AirspeedStoredState) {
  return new AirspeedCalculator({
    altitudeMeters: state.altitudeMeters,
    satCelsius: state.satCelsius,
    windFromDegrees: state.windFromDegrees,
    windSpeedKnots: state.windSpeedKnots,
    trackDegrees: state.trackDegrees,
    speedUnit: state.speedUnit,
  }, state.groundspeedKnots)
}

export function useAirspeedConverter() {
  const storedState = useStorage<AirspeedStoredState>('airspeed-converter-state-v2', cloneDefaultState(), undefined, {
    mergeDefaults: true,
  })

  if (!isStoredState(storedState.value)) {
    storedState.value = cloneDefaultState()
  }

  const calculator = shallowRef(createCalculator(storedState.value))
  const activeMode = ref<AirspeedMode>(storedState.value.mode)
  const inputError = shallowRef<AirspeedCalculationError | null>(null)

  const state = computed(() => ({
    mode: activeMode.value,
    altitudeUnit: storedState.value.altitudeUnit,
    speedUnit: calculator.value.speedUnit,
    satCelsius: calculator.value.satCelsius,
    isaDeviationCelsius: calculator.value.isaDeviationCelsius,
    windFromDegrees: calculator.value.windFromDegrees,
    windSpeedKnots: calculator.value.windSpeedKnots,
    trackDegrees: calculator.value.trackDegrees,
    expressions: storedState.value.expressions,
  }))

  const standardTemperature = computed(() => {
    try {
      return standardAtmosphereFromAltitude(calculator.value.altitudeMeters).temperatureK - 273.15
    } catch {
      return null
    }
  })

  const expressionsValid = computed(() => Object.values(storedState.value.expressions)
    .every(expression => parseExpression(expression) !== null))

  const result = computed<AirspeedSnapshot | null>(() => {
    if (inputError.value || !expressionsValid.value) return null
    try {
      return calculator.value.snapshot
    } catch {
      return null
    }
  })

  const error = computed<AirspeedCalculationError | null>(() => {
    if (inputError.value) return inputError.value
    if (!expressionsValid.value) {
      return new AirspeedCalculationError('invalid-input', 'Enter valid numeric expressions in all fields.')
    }
    try {
      calculator.value.snapshot
      return null
    } catch (value) {
      return value instanceof AirspeedCalculationError
        ? value
        : new AirspeedCalculationError('invalid-input', 'Please enter valid airspeed inputs.')
    }
  })

  const speedValues = computed(() => result.value
    ? {
        gs: result.value.gsKnots,
        tas: result.value.tasKnots,
        mach: result.value.mach,
        cas: result.value.casKnots,
      }
    : { gs: null, tas: null, mach: null, cas: null })

  function sync(expressions = storedState.value.expressions) {
    inputError.value = null
    storedState.value = {
      ...storedState.value,
      mode: activeMode.value,
      groundspeedKnots: calculator.value.groundspeedKnots,
      altitudeMeters: calculator.value.altitudeMeters,
      speedUnit: calculator.value.speedUnit,
      satCelsius: calculator.value.satCelsius,
      isaDeviationCelsius: calculator.value.isaDeviationCelsius,
      windFromDegrees: calculator.value.windFromDegrees,
      windSpeedKnots: calculator.value.windSpeedKnots,
      trackDegrees: calculator.value.trackDegrees,
      expressions,
    }
    triggerRef(calculator)
  }

  function keepExpression(update: Partial<AirspeedExpressions>, calculationError?: unknown) {
    inputError.value = calculationError instanceof AirspeedCalculationError
      ? calculationError
      : new AirspeedCalculationError('invalid-input', 'Enter a valid numeric expression.')
    storedState.value = {
      ...storedState.value,
      mode: activeMode.value,
      expressions: { ...storedState.value.expressions, ...update },
    }
    triggerRef(calculator)
  }

  function updateSpeed(mode: AirspeedMode, value: string | number | null) {
    const raw = expressionText(value)
    activeMode.value = mode
    const parsed = parseExpression(value)
    if (parsed === null || parsed < 0) {
      keepExpression({ speed: raw })
      return
    }

    try {
      if (mode === 'gs') calculator.value.groundspeed = parsed
      else if (mode === 'tas') calculator.value.tas = parsed
      else if (mode === 'mach') calculator.value.mach = parsed
      else calculator.value.cas = parsed
      sync({ ...storedState.value.expressions, speed: raw })
    } catch (value) {
      keepExpression({ speed: raw }, value)
    }
  }

  function updateAltitude(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null) {
      keepExpression({ altitude: raw })
      return
    }

    try {
      calculator.value.altitudeMeters = convertHeightToMeters(parsed, storedState.value.altitudeUnit)
      const expressions = { ...storedState.value.expressions, altitude: raw }
      if (storedState.value.temperatureSource === 'sat') expressions.isaDeviation = formatNumericExpression(calculator.value.isaDeviationCelsius)
      else expressions.sat = formatNumericExpression(calculator.value.satCelsius)
      sync(expressions)
    } catch (value) {
      keepExpression({ altitude: raw }, value)
    }
  }

  function updateAltitudeUnit(unit: HeightUnit) {
    storedState.value = { ...storedState.value, altitudeUnit: unit }
    const altitudeExpression = formatNumericExpression(convertMetersToHeight(calculator.value.altitudeMeters, unit))
    sync({ ...storedState.value.expressions, altitude: altitudeExpression })
  }

  function updateSpeedUnit(unit: AirspeedUnit) {
    try {
      calculator.value.speedUnit = unit
      const speedExpression = activeMode.value === 'mach'
        ? formatNumericExpression(calculator.value.mach)
        : activeMode.value === 'gs'
          ? formatNumericExpression(calculator.value.groundspeed)
          : activeMode.value === 'tas'
            ? formatNumericExpression(calculator.value.tas)
            : formatNumericExpression(calculator.value.cas)
      sync({
        ...storedState.value.expressions,
        speed: speedExpression,
        windSpeed: formatNumericExpression(convertKnotsToUnit(calculator.value.windSpeedKnots, unit)),
      })
    } catch {
      // The unit list is validated before it reaches the class.
    }
  }

  function updateSat(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null) {
      keepExpression({ sat: raw })
      return
    }

    try {
      calculator.value.satCelsius = parsed
      sync({ ...storedState.value.expressions, sat: raw, isaDeviation: formatNumericExpression(calculator.value.isaDeviationCelsius) })
      storedState.value = { ...storedState.value, temperatureSource: 'sat' }
    } catch (value) {
      keepExpression({ sat: raw }, value)
    }
  }

  function updateIsaDeviation(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null) {
      keepExpression({ isaDeviation: raw })
      return
    }

    try {
      calculator.value.isaDeviationCelsius = parsed
      sync({ ...storedState.value.expressions, isaDeviation: raw, sat: formatNumericExpression(calculator.value.satCelsius) })
      storedState.value = { ...storedState.value, temperatureSource: 'isaDeviation' }
    } catch (value) {
      keepExpression({ isaDeviation: raw }, value)
    }
  }

  function updateWindFrom(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null) {
      keepExpression({ windFrom: raw })
      return
    }
    try {
      calculator.value.windFromDegrees = parsed
      sync({ ...storedState.value.expressions, windFrom: raw })
    } catch (value) {
      keepExpression({ windFrom: raw }, value)
    }
  }

  function updateWindSpeed(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null || parsed < 0) {
      keepExpression({ windSpeed: raw })
      return
    }
    try {
      calculator.value.windSpeedKnots = convertUnitToKnots(parsed, calculator.value.speedUnit)
      sync({ ...storedState.value.expressions, windSpeed: raw })
    } catch (value) {
      keepExpression({ windSpeed: raw }, value)
    }
  }

  function updateTrack(value: string | number | null) {
    const raw = expressionText(value)
    const parsed = parseExpression(value)
    if (parsed === null) {
      keepExpression({ track: raw })
      return
    }
    try {
      calculator.value.trackDegrees = parsed
      sync({ ...storedState.value.expressions, track: raw })
    } catch (value) {
      keepExpression({ track: raw }, value)
    }
  }

  return {
    calculator,
    state,
    standardTemperature,
    result,
    error,
    speedValues,
    updateSpeed,
    updateAltitude,
    updateAltitudeUnit,
    updateSpeedUnit,
    updateSat,
    updateIsaDeviation,
    updateWindFrom,
    updateWindSpeed,
    updateTrack,
  }
}
