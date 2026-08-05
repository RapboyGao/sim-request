import { describe, expect, it } from 'vitest'
import {
  altitudeFromPressure,
  convertHeightToMeters,
  convertMetersToHeight,
  convertPascalsToPressure,
  convertPressureToPascals,
  evaluateNumericExpression,
  getMinimumModelPressure,
  pressureFromAltitude,
} from '../utils/barometric'

describe('barometric formula', () => {
  it('returns standard sea-level pressure at zero altitude', () => {
    expect(pressureFromAltitude(0)).toBeCloseTo(101325, 0)
  })

  it('matches known standard-atmosphere layer bases', () => {
    expect(pressureFromAltitude(11000)).toBeCloseTo(22632.1, 0)
    expect(pressureFromAltitude(20000)).toBeCloseTo(5474.89, 0)
    expect(pressureFromAltitude(51000)).toBeCloseTo(66.9389, 1)
  })

  it('round-trips altitude through pressure at layer boundaries', () => {
    for (const altitude of [0, 1000, 11000, 20000, 32000, 47000, 51000, 71000, 86000]) {
      const pressure = pressureFromAltitude(altitude)
      expect(altitudeFromPressure(pressure)).toBeCloseTo(altitude, 1)
    }
  })

  it('supports elevations below sea level', () => {
    const altitude = -430
    const pressure = pressureFromAltitude(altitude)

    expect(pressure).toBeGreaterThan(101325)
    expect(altitudeFromPressure(pressure)).toBeCloseTo(altitude, 1)
  })

  it('rejects values outside the standard-atmosphere range', () => {
    expect(() => pressureFromAltitude(86001)).toThrow(RangeError)
    expect(() => altitudeFromPressure(getMinimumModelPressure() - 0.001)).toThrow(RangeError)
  })
})

describe('units and expressions', () => {
  it('converts common height and pressure units through SI values', () => {
    expect(convertHeightToMeters(1, 'ft')).toBeCloseTo(0.3048)
    expect(convertMetersToHeight(1852, 'nmi')).toBeCloseTo(1)
    expect(convertPressureToPascals(1, 'psi')).toBeCloseTo(6894.757293168)
    expect(convertPascalsToPressure(101325, 'atm')).toBeCloseTo(1)
  })

  it('evaluates arithmetic expressions and rejects non-numeric results', () => {
    expect(evaluateNumericExpression('2 * (5000 + 250)')).toBe(10500)
    expect(evaluateNumericExpression('10e3')).toBe(10000)
    expect(evaluateNumericExpression('2000×45')).toBe(90000)
    expect(evaluateNumericExpression('9000÷3')).toBe(3000)
    expect(evaluateNumericExpression('')).toBeNull()
    expect(evaluateNumericExpression('sqrt(-1)')).toBeNull()
  })
})
