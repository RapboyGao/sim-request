import { describe, expect, it } from 'vitest'
import { AirspeedCalculator, calculateAirspeed, type AirspeedInput } from '../utils/airspeed'
import { evaluateNumericExpression } from '../utils/barometric'

function input(overrides: Partial<AirspeedInput> = {}): AirspeedInput {
  return {
    mode: 'tas',
    speed: 100,
    altitudeMeters: 0,
    satCelsius: 15,
    windFromDegrees: 0,
    windSpeedKnots: 0,
    trackDegrees: 90,
    ...overrides,
  }
}

describe('airspeed conversion', () => {
  it('stores GS canonically in knots while exposing the selected unit', () => {
    const calculator = new AirspeedCalculator({
      altitudeMeters: 0,
      satCelsius: 15,
      windFromDegrees: 0,
      windSpeedKnots: 0,
      trackDegrees: 90,
      speedUnit: 'km/h',
    })

    calculator.groundspeed = 185.2

    expect(calculator.speedUnit).toBe('km/h')
    expect(calculator.groundspeedKnots).toBeCloseTo(100, 8)
    expect(calculator.groundspeed).toBeCloseTo(185.2, 8)

    calculator.speedUnit = 'kt'
    expect(calculator.groundspeed).toBeCloseTo(100, 8)
  })

  it('accepts GS setter values in every supported speed unit', () => {
    const values = [
      ['kt', 100],
      ['km/h', 185.2],
      ['mph', 115.0779448],
      ['m/s', 51.44444444444444],
    ] as const

    for (const [speedUnit, value] of values) {
      const calculator = new AirspeedCalculator({
        altitudeMeters: 0,
        satCelsius: 15,
        windFromDegrees: 0,
        windSpeedKnots: 0,
        trackDegrees: 90,
        speedUnit,
      })
      calculator.groundspeed = value
      expect(calculator.groundspeedKnots, speedUnit).toBeCloseTo(100, 8)
    }
  })

  it('keeps GS as the single source when CAS, TAS, and Mach are set', () => {
    const calculator = new AirspeedCalculator({
      altitudeMeters: 0,
      satCelsius: 15,
      windFromDegrees: 270,
      windSpeedKnots: 20,
      trackDegrees: 90,
      speedUnit: 'kt',
    })

    calculator.tas = 100
    expect(calculator.groundspeedKnots).toBeCloseTo(120, 8)

    const cas = calculator.cas
    const mach = calculator.mach

    calculator.cas = cas
    expect(calculator.groundspeedKnots).toBeCloseTo(120, 8)
    calculator.mach = mach
    expect(calculator.groundspeedKnots).toBeCloseTo(120, 8)
    expect(calculator.tas).toBeCloseTo(100, 8)
  })

  it('updates SAT through the ISA deviation setter without changing GS', () => {
    const calculator = new AirspeedCalculator({
      altitudeMeters: 3048,
      satCelsius: -4.8,
      windFromDegrees: 0,
      windSpeedKnots: 0,
      trackDegrees: 90,
      speedUnit: 'kt',
    }, 120)
    const initialGroundspeed = calculator.groundspeedKnots

    calculator.isaDeviationCelsius = 10

    expect(calculator.satCelsius).toBeCloseTo(standardIsaTemperature(3048) + 10, 8)
    expect(calculator.groundspeedKnots).toBe(initialGroundspeed)
  })

  it('stores ISA deviation as the canonical temperature state', () => {
    const expectedDeviation = 5.2 - standardIsaTemperature(3048)
    const calculator = new AirspeedCalculator({
      altitudeMeters: 3048,
      satCelsius: 5.2,
      windFromDegrees: 0,
      windSpeedKnots: 0,
      trackDegrees: 90,
      speedUnit: 'kt',
    })

    expect(calculator.isaDeviationCelsius).toBeCloseTo(expectedDeviation, 8)
    expect(calculator.satCelsius).toBeCloseTo(5.2, 8)

    calculator.altitudeMeters = 0

    expect(calculator.isaDeviationCelsius).toBeCloseTo(expectedDeviation, 8)
    expect(calculator.satCelsius).toBeCloseTo(15 + expectedDeviation, 8)
  })

  it('updates ISA deviation when SAT is edited', () => {
    const expectedDeviation = 5.2 - standardIsaTemperature(3048)
    const calculator = new AirspeedCalculator({
      altitudeMeters: 3048,
      satCelsius: -4.8,
      windFromDegrees: 0,
      windSpeedKnots: 0,
      trackDegrees: 90,
      speedUnit: 'kt',
    })

    calculator.satCelsius = 5.2

    expect(calculator.isaDeviationCelsius).toBeCloseTo(expectedDeviation, 8)
    expect(calculator.satCelsius).toBeCloseTo(5.2, 8)
  })

  it('accepts negative temperatures and arithmetic expressions', () => {
    expect(evaluateNumericExpression('-5')).toBe(-5)
    expect(evaluateNumericExpression('15 - 20')).toBe(-5)
    expect(evaluateNumericExpression('2 * 5000')).toBe(10000)
    expect(evaluateNumericExpression('250 + 10')).toBe(260)
  })

  it('keeps CAS, TAS, and GS aligned at sea level in still ISA air', () => {
    const result = calculateAirspeed(input({ mode: 'cas', speed: 100 }))

    expect(result.casKnots).toBeCloseTo(100, 8)
    expect(result.tasKnots).toBeCloseTo(100, 8)
    expect(result.gsKnots).toBeCloseTo(100, 8)
    expect(result.mach).toBeCloseTo(100 / 661.4788, 4)
  })

  it('converts all four speed modes consistently', () => {
    const tasResult = calculateAirspeed(input({ mode: 'tas', speed: 250 }))
    const casResult = calculateAirspeed(input({ mode: 'cas', speed: tasResult.casKnots }))
    const machResult = calculateAirspeed(input({ mode: 'mach', speed: tasResult.mach }))
    const gsResult = calculateAirspeed(input({ mode: 'gs', speed: tasResult.gsKnots }))

    for (const result of [casResult, machResult, gsResult]) {
      expect(result.tasKnots).toBeCloseTo(tasResult.tasKnots, 6)
      expect(result.casKnots).toBeCloseTo(tasResult.casKnots, 6)
      expect(result.mach).toBeCloseTo(tasResult.mach, 6)
      expect(result.gsKnots).toBeCloseTo(tasResult.gsKnots, 6)
    }
  })

  it('raises TAS above CAS at altitude', () => {
    const result = calculateAirspeed(input({ mode: 'cas', speed: 250, altitudeMeters: 3048, satCelsius: -4.8 }))

    expect(result.tasKnots).toBeGreaterThan(result.casKnots)
    expect(result.mach).toBeGreaterThan(0)
  })

  it('solves a direct tailwind triangle', () => {
    const result = calculateAirspeed(input({ mode: 'tas', speed: 100, windFromDegrees: 270, windSpeedKnots: 20, trackDegrees: 90 }))

    expect(result.gsKnots).toBeCloseTo(120, 8)
    expect(result.headingDegrees).toBeCloseTo(90, 8)
    expect(result.headwindComponentKnots).toBeCloseTo(-20, 8)
    expect(result.crosswindComponentKnots).toBeCloseTo(0, 8)
  })

  it('solves GS input back to TAS and CAS', () => {
    const result = calculateAirspeed(input({ mode: 'gs', speed: 120, windFromDegrees: 270, windSpeedKnots: 20, trackDegrees: 90 }))

    expect(result.tasKnots).toBeCloseTo(100, 8)
    expect(result.gsKnots).toBeCloseTo(120, 8)
  })

  it('keeps the three wind triangle vectors additive', () => {
    const result = calculateAirspeed(input({ mode: 'tas', speed: 220, windFromDegrees: 330, windSpeedKnots: 35, trackDegrees: 80 }))

    expect(result.airVector.east + result.windVector.east).toBeCloseTo(result.groundVector.east, 8)
    expect(result.airVector.north + result.windVector.north).toBeCloseTo(result.groundVector.north, 8)
  })

  it('calculates total air temperature from SAT and Mach', () => {
    const result = calculateAirspeed(input({ mode: 'mach', speed: 0.8, satCelsius: -20 }))

    expect(result.tatCelsius).toBeGreaterThan(-20)
    expect(result.tatCelsius).toBeCloseTo(12.4, 1)
  })

  it('rejects an unachievable track and supersonic input', () => {
    expect(() => calculateAirspeed(input({ mode: 'tas', speed: 100, windFromDegrees: 0, windSpeedKnots: 150, trackDegrees: 90 }))).toThrow(/track/i)
    expect(() => calculateAirspeed(input({ mode: 'mach', speed: 1 }))).toThrow(/subsonic/i)
  })

  it('rejects an altitude outside the standard atmosphere model', () => {
    expect(() => calculateAirspeed(input({ altitudeMeters: 86001 }))).toThrow(/altitude/i)
  })
})

function standardIsaTemperature(altitudeMeters: number) {
  return 15 - altitudeMeters * 0.0065
}
