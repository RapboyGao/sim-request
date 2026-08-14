import { standardAtmosphereFromAltitude } from './barometric'

export const AIRSPEED_MODES = ['gs', 'tas', 'mach', 'cas'] as const
export type AirspeedMode = (typeof AIRSPEED_MODES)[number]

export const AIRSPEED_UNITS = ['kt', 'km/h', 'mph', 'm/s'] as const
export type AirspeedUnit = (typeof AIRSPEED_UNITS)[number]

export type AirspeedConditions = {
  altitudeMeters: number
  satCelsius: number
  windFromDegrees: number
  windSpeedKnots: number
  trackDegrees: number
  speedUnit: AirspeedUnit
}

export type AirspeedInput = {
  mode: AirspeedMode
  speed: number
  altitudeMeters: number
  satCelsius: number
  windFromDegrees: number
  windSpeedKnots: number
  trackDegrees: number
}

export type AirspeedVector = {
  east: number
  north: number
}

export type AirspeedSnapshot = {
  gsKnots: number
  tasKnots: number
  mach: number
  casKnots: number
  tatCelsius: number
  headingDegrees: number
  headwindComponentKnots: number
  crosswindComponentKnots: number
  windVector: AirspeedVector
  airVector: AirspeedVector
  groundVector: AirspeedVector
}

export type AirspeedResult = AirspeedSnapshot

export type AirspeedErrorCode = 'invalid-input' | 'unsupported-supersonic' | 'track-unachievable'

export class AirspeedCalculationError extends RangeError {
  readonly code: AirspeedErrorCode

  constructor(code: AirspeedErrorCode, message: string) {
    super(message)
    this.name = 'AirspeedCalculationError'
    this.code = code
  }
}

const GAMMA = 1.4
const AIR_GAS_CONSTANT = 287.05287
const STANDARD_PRESSURE_PA = 101325
const STANDARD_TEMPERATURE_K = 288.15
const KNOT_TO_METERS_PER_SECOND = 0.5144444444444444
const SPEED_OF_SOUND_SEA_LEVEL_KNOTS = Math.sqrt(GAMMA * AIR_GAS_CONSTANT * STANDARD_TEMPERATURE_K) / KNOT_TO_METERS_PER_SECOND
const MACH_LIMIT = 1 - 1e-9
const EPSILON = 1e-9

function toRadians(degrees: number) {
  return degrees * Math.PI / 180
}

export function normalizeBearing(degrees: number) {
  return ((degrees % 360) + 360) % 360
}

function bearingVector(degrees: number, magnitude: number): AirspeedVector {
  const radians = toRadians(degrees)
  return {
    east: magnitude * Math.sin(radians),
    north: magnitude * Math.cos(radians),
  }
}

function vectorMagnitude(vector: AirspeedVector) {
  return Math.hypot(vector.east, vector.north)
}

function subtractVectors(left: AirspeedVector, right: AirspeedVector): AirspeedVector {
  return { east: left.east - right.east, north: left.north - right.north }
}

function dot(left: AirspeedVector, right: AirspeedVector) {
  return left.east * right.east + left.north * right.north
}

function headingFromVector(vector: AirspeedVector, fallback: number) {
  if (vectorMagnitude(vector) <= EPSILON) return normalizeBearing(fallback)
  return normalizeBearing(Math.atan2(vector.east, vector.north) * 180 / Math.PI)
}

function assertFinite(value: number, message: string) {
  if (!Number.isFinite(value)) {
    throw new AirspeedCalculationError('invalid-input', message)
  }
}

function assertBearing(value: number) {
  assertFinite(value, 'Directions must be finite numbers.')
  if (value < 0 || value > 360) {
    throw new AirspeedCalculationError('invalid-input', 'Directions must be between 0 and 360 degrees.')
  }
}

function assertNonNegative(value: number, message: string) {
  assertFinite(value, message)
  if (value < 0) {
    throw new AirspeedCalculationError('invalid-input', message)
  }
}

function staticTemperatureK(satCelsius: number) {
  const temperatureK = satCelsius + 273.15
  if (temperatureK <= 0) {
    throw new AirspeedCalculationError('invalid-input', 'Static air temperature must be above absolute zero.')
  }
  return temperatureK
}

function standardTemperatureCelsius(altitudeMeters: number) {
  return standardAtmosphereFromAltitude(altitudeMeters).temperatureK - 273.15
}

function machFromImpactPressure(impactPressurePa: number, staticPressurePa: number) {
  const machSquared = 5 * (Math.pow(impactPressurePa / staticPressurePa + 1, 2 / 7) - 1)
  return Math.sqrt(Math.max(0, machSquared))
}

function impactPressureFromMach(mach: number, staticPressurePa: number) {
  return staticPressurePa * (Math.pow(1 + 0.2 * mach * mach, 3.5) - 1)
}

function machFromCas(casKnots: number, staticPressurePa: number) {
  const impactPressurePa = STANDARD_PRESSURE_PA * (Math.pow(1 + 0.2 * Math.pow(casKnots / SPEED_OF_SOUND_SEA_LEVEL_KNOTS, 2), 3.5) - 1)
  return machFromImpactPressure(impactPressurePa, staticPressurePa)
}

function casFromMach(mach: number, staticPressurePa: number) {
  const impactPressurePa = impactPressureFromMach(mach, staticPressurePa)
  return SPEED_OF_SOUND_SEA_LEVEL_KNOTS * Math.sqrt(5 * (Math.pow(impactPressurePa / STANDARD_PRESSURE_PA + 1, 2 / 7) - 1))
}

function tasFromMach(mach: number, staticTemperatureKValue: number) {
  return mach * Math.sqrt(GAMMA * AIR_GAS_CONSTANT * staticTemperatureKValue) / KNOT_TO_METERS_PER_SECOND
}

function windVectorFromConditions(windFromDegrees: number, windSpeedKnots: number) {
  return bearingVector(normalizeBearing(windFromDegrees + 180), windSpeedKnots)
}

function windTriangleFromTas(tasKnots: number, windVector: AirspeedVector, trackDegrees: number) {
  const trackVector = bearingVector(trackDegrees, 1)
  const rightVector = bearingVector(trackDegrees + 90, 1)
  const alongTrackWind = dot(windVector, trackVector)
  const crossTrackWind = dot(windVector, rightVector)
  const remainingSquared = tasKnots * tasKnots - crossTrackWind * crossTrackWind

  if (remainingSquared < -EPSILON) {
    throw new AirspeedCalculationError('track-unachievable', 'The selected track cannot be maintained with this TAS and wind.')
  }

  const groundSpeed = alongTrackWind + Math.sqrt(Math.max(0, remainingSquared))
  if (groundSpeed < -EPSILON) {
    throw new AirspeedCalculationError('track-unachievable', 'The headwind is stronger than the available TAS.')
  }

  const groundVector = bearingVector(trackDegrees, Math.max(0, groundSpeed))
  const airVector = subtractVectors(groundVector, windVector)
  return { groundSpeed: Math.max(0, groundSpeed), groundVector, airVector }
}

function convertSpeed(value: number, unit: AirspeedUnit) {
  if (unit === 'kt') return value
  if (unit === 'km/h') return value * 1.852
  if (unit === 'mph') return value * 1.150779448
  return value * KNOT_TO_METERS_PER_SECOND
}

function convertSpeedToKnots(value: number, unit: AirspeedUnit) {
  if (unit === 'kt') return value
  if (unit === 'km/h') return value / 1.852
  if (unit === 'mph') return value / 1.150779448
  return value / KNOT_TO_METERS_PER_SECOND
}

export class AirspeedCalculator {
  private _altitudeMeters: number
  private _isaDeviationCelsius: number
  private _windFromDegrees: number
  private _windSpeedKnots: number
  private _trackDegrees: number
  private _speedUnit: AirspeedUnit
  private _groundspeedKnots: number

  constructor(conditions: AirspeedConditions, groundspeedKnots = 0) {
    this._altitudeMeters = conditions.altitudeMeters
    this._isaDeviationCelsius = 0
    this._windFromDegrees = conditions.windFromDegrees
    this._windSpeedKnots = conditions.windSpeedKnots
    this._trackDegrees = conditions.trackDegrees
    this._speedUnit = conditions.speedUnit
    this._groundspeedKnots = groundspeedKnots

    this.validateConditions()
    // SAT is a compatibility input; ISA deviation is the canonical state.
    this.satCelsius = conditions.satCelsius
    this.groundspeedKnots = groundspeedKnots
  }

  get altitudeMeters() { return this._altitudeMeters }
  set altitudeMeters(value: number) {
    assertFinite(value, 'Altitude must be a finite number.')
    try {
      standardAtmosphereFromAltitude(value)
    } catch {
      throw new AirspeedCalculationError('invalid-input', 'Altitude is outside the supported range.')
    }
    this._altitudeMeters = value
  }

  get satCelsius() {
    return standardTemperatureCelsius(this._altitudeMeters) + this._isaDeviationCelsius
  }
  set satCelsius(value: number) {
    assertFinite(value, 'Static air temperature must be a finite number.')
    staticTemperatureK(value)
    this._isaDeviationCelsius = value - standardTemperatureCelsius(this._altitudeMeters)
  }

  get isaDeviationCelsius() { return this._isaDeviationCelsius }
  set isaDeviationCelsius(value: number) {
    assertFinite(value, 'ISA deviation must be a finite number.')
    staticTemperatureK(standardTemperatureCelsius(this._altitudeMeters) + value)
    this._isaDeviationCelsius = value
  }

  get windFromDegrees() { return this._windFromDegrees }
  set windFromDegrees(value: number) {
    assertBearing(value)
    this._windFromDegrees = value
  }

  get windSpeedKnots() { return this._windSpeedKnots }
  set windSpeedKnots(value: number) {
    assertNonNegative(value, 'Wind speed cannot be negative.')
    this._windSpeedKnots = value
  }

  get trackDegrees() { return this._trackDegrees }
  set trackDegrees(value: number) {
    assertBearing(value)
    this._trackDegrees = value
  }

  get speedUnit() { return this._speedUnit }
  set speedUnit(value: AirspeedUnit) {
    if (!AIRSPEED_UNITS.includes(value)) {
      throw new AirspeedCalculationError('invalid-input', 'Unsupported airspeed unit.')
    }
    this._speedUnit = value
  }

  get groundspeedKnots() { return this._groundspeedKnots }
  set groundspeedKnots(value: number) {
    assertNonNegative(value, 'Ground speed cannot be negative.')
    this._groundspeedKnots = value
  }

  get groundspeed() { return convertSpeed(this._groundspeedKnots, this._speedUnit) }
  set groundspeed(value: number) {
    this.groundspeedKnots = convertSpeedToKnots(value, this._speedUnit)
  }

  get tas() { return convertSpeed(this.snapshot.tasKnots, this._speedUnit) }
  set tas(value: number) {
    const tasKnots = convertSpeedToKnots(value, this._speedUnit)
    assertNonNegative(tasKnots, 'True airspeed cannot be negative.')
    this.setGroundspeedFromTas(tasKnots)
  }

  get cas() { return convertSpeed(this.snapshot.casKnots, this._speedUnit) }
  set cas(value: number) {
    const casKnots = convertSpeedToKnots(value, this._speedUnit)
    assertNonNegative(casKnots, 'Calibrated airspeed cannot be negative.')
    const atmosphere = standardAtmosphereFromAltitude(this._altitudeMeters)
    const mach = machFromCas(casKnots, atmosphere.pressurePa)
    this.assertSubsonic(mach)
    this.setGroundspeedFromTas(tasFromMach(mach, staticTemperatureK(this.satCelsius)))
  }

  get mach() { return this.snapshot.mach }
  set mach(value: number) {
    assertNonNegative(value, 'Mach cannot be negative.')
    this.assertSubsonic(value)
    this.setGroundspeedFromTas(tasFromMach(value, staticTemperatureK(this.satCelsius)))
  }

  get tatCelsius() { return this.snapshot.tatCelsius }
  get headingDegrees() { return this.snapshot.headingDegrees }
  get headwindComponentKnots() { return this.snapshot.headwindComponentKnots }
  get crosswindComponentKnots() { return this.snapshot.crosswindComponentKnots }
  get windVector() { return windVectorFromConditions(this._windFromDegrees, this._windSpeedKnots) }
  get groundVector() { return bearingVector(this._trackDegrees, this._groundspeedKnots) }
  get airVector() { return subtractVectors(this.groundVector, this.windVector) }

  get snapshot(): AirspeedSnapshot {
    const atmosphere = standardAtmosphereFromAltitude(this._altitudeMeters)
    const temperatureK = staticTemperatureK(this.satCelsius)
    const windVector = this.windVector
    const groundVector = this.groundVector
    const airVector = this.airVector
    const tasKnots = vectorMagnitude(airVector)
    const mach = tasKnots / (Math.sqrt(GAMMA * AIR_GAS_CONSTANT * temperatureK) / KNOT_TO_METERS_PER_SECOND)
    this.assertSubsonic(mach)
    const trackVector = bearingVector(this._trackDegrees, 1)
    const rightVector = bearingVector(this._trackDegrees + 90, 1)

    return {
      gsKnots: this._groundspeedKnots,
      tasKnots,
      mach,
      casKnots: casFromMach(mach, atmosphere.pressurePa),
      tatCelsius: temperatureK * (1 + 0.2 * mach * mach) - 273.15,
      headingDegrees: headingFromVector(airVector, this._trackDegrees),
      headwindComponentKnots: -dot(windVector, trackVector),
      crosswindComponentKnots: dot(windVector, rightVector),
      windVector,
      airVector,
      groundVector,
    }
  }

  private setGroundspeedFromTas(tasKnots: number) {
    const triangle = windTriangleFromTas(tasKnots, this.windVector, this._trackDegrees)
    this._groundspeedKnots = triangle.groundSpeed
  }

  private assertSubsonic(mach: number) {
    if (mach >= MACH_LIMIT) {
      throw new AirspeedCalculationError('unsupported-supersonic', 'Only subsonic airspeed calculations are supported.')
    }
  }

  private validateConditions() {
    this.altitudeMeters = this._altitudeMeters
    this.windFromDegrees = this._windFromDegrees
    this.windSpeedKnots = this._windSpeedKnots
    this.trackDegrees = this._trackDegrees
    this.speedUnit = this._speedUnit
  }
}

export function calculateAirspeed(input: AirspeedInput): AirspeedResult {
  const calculator = new AirspeedCalculator({
    altitudeMeters: input.altitudeMeters,
    satCelsius: input.satCelsius,
    windFromDegrees: input.windFromDegrees,
    windSpeedKnots: input.windSpeedKnots,
    trackDegrees: input.trackDegrees,
    speedUnit: 'kt',
  })

  if (input.mode === 'gs') calculator.groundspeedKnots = input.speed
  else if (input.mode === 'tas') calculator.tas = input.speed
  else if (input.mode === 'mach') calculator.mach = input.speed
  else calculator.cas = input.speed

  return calculator.snapshot
}

export function convertKnotsToUnit(value: number, unit: AirspeedUnit) {
  return convertSpeed(value, unit)
}

export function convertUnitToKnots(value: number, unit: AirspeedUnit) {
  return convertSpeedToKnots(value, unit)
}

export function convertMetersToTemperatureCelsius(temperatureK: number) {
  return temperatureK - 273.15
}
