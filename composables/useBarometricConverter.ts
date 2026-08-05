import { useStorage } from '@vueuse/core'
import {
  altitudeFromPressure,
  convertHeightToMeters,
  convertMetersToHeight,
  convertPascalsToPressure,
  convertPressureToPascals,
  evaluateNumericExpression,
  formatInputValue,
  pressureFromAltitude,
  type HeightUnit,
  type PressureUnit,
} from '~/utils/barometric'

export type BarometricPointId = 'A' | 'B'

export type BarometricPointState = {
  heightExpression: string
  heightUnit: HeightUnit
  pressureExpression: string
  pressureUnit: PressureUnit
  lastInputKind?: 'height' | 'pressure'
  canonicalHeightMeters?: number
  canonicalPressurePa?: number
}

export type BarometricStoredState = {
  version: 1
  pointA: BarometricPointState
  pointB: BarometricPointState
  heightDifferenceUnit: HeightUnit
  pressureDifferenceUnit: PressureUnit
}

const DEFAULT_STATE: BarometricStoredState = {
  version: 1,
  pointA: {
    heightExpression: '0',
    heightUnit: 'ft',
    pressureExpression: formatInputValue(convertPascalsToPressure(101325, 'psi'), 'psi'),
    pressureUnit: 'psi',
    lastInputKind: 'height',
    canonicalHeightMeters: 0,
    canonicalPressurePa: 101325,
  },
  pointB: {
    heightExpression: '0',
    heightUnit: 'ft',
    pressureExpression: formatInputValue(convertPascalsToPressure(101325, 'psi'), 'psi'),
    pressureUnit: 'psi',
    lastInputKind: 'height',
    canonicalHeightMeters: 0,
    canonicalPressurePa: 101325,
  },
  heightDifferenceUnit: 'ft',
  pressureDifferenceUnit: 'psi',
}

function cloneDefaultState(): BarometricStoredState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE)) as BarometricStoredState
}

function isPointState(value: unknown): value is BarometricPointState {
  if (!value || typeof value !== 'object') return false
  const point = value as Partial<BarometricPointState>
  return typeof point.heightExpression === 'string'
    && typeof point.pressureExpression === 'string'
    && typeof point.heightUnit === 'string'
    && typeof point.pressureUnit === 'string'
    && (point.lastInputKind === undefined || point.lastInputKind === 'height' || point.lastInputKind === 'pressure')
    && (point.canonicalHeightMeters === undefined || Number.isFinite(point.canonicalHeightMeters))
    && (point.canonicalPressurePa === undefined || Number.isFinite(point.canonicalPressurePa))
}

function isStoredState(value: unknown): value is BarometricStoredState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<BarometricStoredState>
  return state.version === 1
    && isPointState(state.pointA)
    && isPointState(state.pointB)
    && typeof state.heightDifferenceUnit === 'string'
    && typeof state.pressureDifferenceUnit === 'string'
}

export function useBarometricConverter() {
  const storedState = useStorage<BarometricStoredState>('barometric-converter-state-v1', cloneDefaultState(), undefined, {
    mergeDefaults: true,
  })

  if (!isStoredState(storedState.value)) {
    storedState.value = cloneDefaultState()
  }

  const points = computed(() => ({
    A: resolvePoint(storedState.value.pointA),
    B: resolvePoint(storedState.value.pointB),
  }))

  function updatePoint(pointId: BarometricPointId, update: Partial<BarometricPointState>) {
    storedState.value = {
      ...storedState.value,
      [pointId === 'A' ? 'pointA' : 'pointB']: {
        ...storedState.value[pointId === 'A' ? 'pointA' : 'pointB'],
        ...update,
      },
    }
  }

  function updateInput(pointId: BarometricPointId, kind: 'height' | 'pressure', expression: string) {
    const point = storedState.value[pointId === 'A' ? 'pointA' : 'pointB']
    const next = {
      ...point,
      [kind === 'height' ? 'heightExpression' : 'pressureExpression']: expression,
      lastInputKind: kind,
    }
    const numericValue = evaluateNumericExpression(expression)

    if (numericValue === null) {
      next.canonicalHeightMeters = undefined
      next.canonicalPressurePa = undefined
      updatePoint(pointId, next)
      return
    }

    try {
      if (kind === 'height') {
        const altitudeM = convertHeightToMeters(numericValue, next.heightUnit)
        const pressurePa = pressureFromAltitude(altitudeM)
        next.pressureExpression = formatInputValue(convertPascalsToPressure(pressurePa, next.pressureUnit), next.pressureUnit)
        next.canonicalHeightMeters = altitudeM
        next.canonicalPressurePa = pressurePa
      } else {
        const pressurePa = convertPressureToPascals(numericValue, next.pressureUnit)
        const altitudeM = altitudeFromPressure(pressurePa)
        next.heightExpression = formatInputValue(convertMetersToHeight(altitudeM, next.heightUnit), next.heightUnit)
        next.canonicalHeightMeters = altitudeM
        next.canonicalPressurePa = pressurePa
      }
    } catch {
      next.canonicalHeightMeters = undefined
      next.canonicalPressurePa = undefined
      updatePoint(pointId, next)
      return
    }

    updatePoint(pointId, next)
  }

  function updateUnit(pointId: BarometricPointId, kind: 'height' | 'pressure', unit: HeightUnit | PressureUnit) {
    const point = storedState.value[pointId === 'A' ? 'pointA' : 'pointB']
    const numericValue = evaluateNumericExpression(kind === 'height' ? point.heightExpression : point.pressureExpression)
    const next = {
      ...point,
      [kind === 'height' ? 'heightUnit' : 'pressureUnit']: unit,
    } as BarometricPointState

    if (numericValue !== null) {
      try {
        if (kind === 'height') {
          const altitudeM = Number.isFinite(point.canonicalHeightMeters)
            ? point.canonicalHeightMeters!
            : convertHeightToMeters(numericValue, point.heightUnit)
          next.heightExpression = formatInputValue(convertMetersToHeight(altitudeM, unit as HeightUnit), unit as HeightUnit)
        } else {
          const pressurePa = Number.isFinite(point.canonicalPressurePa)
            ? point.canonicalPressurePa!
            : convertPressureToPascals(numericValue, point.pressureUnit)
          next.pressureExpression = formatInputValue(convertPascalsToPressure(pressurePa, unit as PressureUnit), unit as PressureUnit)
        }
      } catch {
        // Keep the expression unchanged when the other value is invalid.
      }
    }

    updatePoint(pointId, next)
  }

  function commitInput(pointId: BarometricPointId, kind: 'height' | 'pressure') {
    const point = storedState.value[pointId === 'A' ? 'pointA' : 'pointB']
    const expressionKey = kind === 'height' ? 'heightExpression' : 'pressureExpression'
    const expression = point[expressionKey]
    const numericValue = evaluateNumericExpression(expression)
    if (numericValue === null) return false

    let canonicalHeightMeters: number
    let canonicalPressurePa: number

    try {
      if (kind === 'height') {
        canonicalHeightMeters = convertHeightToMeters(numericValue, point.heightUnit)
        canonicalPressurePa = pressureFromAltitude(canonicalHeightMeters)
      } else {
        canonicalPressurePa = convertPressureToPascals(numericValue, point.pressureUnit)
        canonicalHeightMeters = altitudeFromPressure(canonicalPressurePa)
      }
    } catch {
      return false
    }

    updatePoint(pointId, {
      [expressionKey]: formatInputValue(numericValue, kind === 'height' ? point.heightUnit : point.pressureUnit),
      lastInputKind: kind,
      canonicalHeightMeters,
      canonicalPressurePa,
    })
    return true
  }

  function updateDifferenceUnit(kind: 'height' | 'pressure', unit: HeightUnit | PressureUnit) {
    storedState.value = {
      ...storedState.value,
      [kind === 'height' ? 'heightDifferenceUnit' : 'pressureDifferenceUnit']: unit,
    }
  }

  const heightDifference = computed(() => {
    if (points.value.A.heightMeters === null || points.value.B.heightMeters === null) return null
    return convertMetersToHeight(points.value.A.heightMeters - points.value.B.heightMeters, storedState.value.heightDifferenceUnit)
  })

  const pressureDifference = computed(() => {
    if (points.value.A.pressurePa === null || points.value.B.pressurePa === null) return null
    return convertPascalsToPressure(points.value.A.pressurePa - points.value.B.pressurePa, storedState.value.pressureDifferenceUnit)
  })

  return {
    state: storedState,
    points,
    heightDifference,
    pressureDifference,
    updateInput,
    updateUnit,
    commitInput,
    updateDifferenceUnit,
  }
}

function resolvePoint(point: BarometricPointState) {
  const heightValue = evaluateNumericExpression(point.heightExpression)
  const pressureValue = evaluateNumericExpression(point.pressureExpression)
  let heightMeters: number | null = null
  let pressurePa: number | null = null
  let heightError = heightValue === null
  let pressureError = pressureValue === null

  if (heightValue !== null) {
    try {
      heightMeters = convertHeightToMeters(heightValue, point.heightUnit)
      pressureFromAltitude(heightMeters)
    } catch {
      heightError = true
    }
  }

  if (pressureValue !== null) {
    try {
      pressurePa = convertPressureToPascals(pressureValue, point.pressureUnit)
      altitudeFromPressure(pressurePa)
    } catch {
      pressureError = true
    }
  }

  // The paired field is rounded for readability. Use the last edited field
  // as the authoritative value so that display rounding never affects math.
  if (point.lastInputKind !== 'pressure' && heightMeters !== null) {
    pressurePa = Number.isFinite(point.canonicalPressurePa)
      ? point.canonicalPressurePa!
      : pressureFromAltitude(heightMeters)
    heightMeters = Number.isFinite(point.canonicalHeightMeters)
      ? point.canonicalHeightMeters!
      : heightMeters
    pressureError = false
  } else if (point.lastInputKind === 'pressure' && pressurePa !== null) {
    heightMeters = Number.isFinite(point.canonicalHeightMeters)
      ? point.canonicalHeightMeters!
      : altitudeFromPressure(pressurePa)
    pressurePa = Number.isFinite(point.canonicalPressurePa)
      ? point.canonicalPressurePa!
      : pressurePa
    heightError = false
  }

  return {
    heightMeters,
    pressurePa,
    heightError,
    pressureError,
  }
}
