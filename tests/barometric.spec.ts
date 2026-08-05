import { describe, expect, it } from 'vitest'
import {
  altitudeFromPressure,
  convertHeightToMeters,
  convertMetersToHeight,
  convertPascalsToPressure,
  convertPressureToPascals,
  evaluateNumericExpression,
  formatInputValue,
  formatValueForUnit,
  getMinimumModelPressure,
  PRESSURE_UNITS,
  pressureFromAltitude,
} from '../utils/barometric'

describe('barometric formula', () => {
  it('returns standard sea-level pressure at zero altitude', () => {
    expect(pressureFromAltitude(0)).toBeCloseTo(101325, 0)
  })

  it('matches known standard-atmosphere layer bases', () => {
    expect(pressureFromAltitude(11000)).toBeCloseTo(22632.063973462926, 10)
    expect(pressureFromAltitude(20000)).toBeCloseTo(5474.888669677778, 10)
    expect(pressureFromAltitude(51000)).toBeCloseTo(66.93887311868737, 10)
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

  it('formats converted values according to their display units', () => {
    expect(formatValueForUnit(50.000000001, 'ft')).toBe('50')
    expect(formatValueForUnit(1524.0000001, 'm')).toBe('1,524')
    expect(formatValueForUnit(14.695948775, 'psi')).toBe('14.696')
    expect(formatInputValue(50.000000001, 'ft')).toBe('50')
  })

  it('keeps pressure display rounding within 0.1 ft of altitude', () => {
    for (const altitude of [0, 10000, 20000, 41000, 86000]) {
      const pressurePa = pressureFromAltitude(altitude)

      for (const unit of PRESSURE_UNITS) {
        const displayedPressure = Number(formatInputValue(convertPascalsToPressure(pressurePa, unit), unit))
        const displayedAltitude = altitudeFromPressure(convertPressureToPascals(displayedPressure, unit))
        expect(Math.abs(displayedAltitude - altitude), `${altitude} m in ${unit}`).toBeLessThanOrEqual(0.03048 + 1e-9)
      }
    }
  })
})
