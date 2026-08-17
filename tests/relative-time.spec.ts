import { describe, expect, it } from 'vitest'
import { formatRelativeTime, relativeTimeParts } from '../utils/relative-time'

const messages = {
  justNow: 'just now',
  minute: (count: number) => `${count} minute${count === 1 ? '' : 's'} ago`,
  hour: (count: number) => `${count} hour${count === 1 ? '' : 's'} ago`,
  day: (count: number) => `${count} day${count === 1 ? '' : 's'} ago`,
}

describe('relative time', () => {
  const now = Date.parse('2026-08-17T00:00:00.000Z')

  it('shows just now for timestamps less than one minute old', () => {
    expect(formatRelativeTime(now, now, messages)).toBe('just now')
    expect(formatRelativeTime(now - 59_000, now, messages)).toBe('just now')
    expect(relativeTimeParts(now - 59_000, now)).toEqual({ unit: 'justNow', count: 0 })
  })

  it('shows exact minutes, hours, and days', () => {
    expect(formatRelativeTime(now - 60_000, now, messages)).toBe('1 minute ago')
    expect(formatRelativeTime(now - 2 * 60_000, now, messages)).toBe('2 minutes ago')
    expect(formatRelativeTime(now - 60 * 60_000, now, messages)).toBe('1 hour ago')
    expect(formatRelativeTime(now - 2 * 60 * 60_000, now, messages)).toBe('2 hours ago')
    expect(formatRelativeTime(now - 24 * 60 * 60_000, now, messages)).toBe('1 day ago')
    expect(formatRelativeTime(now - 10 * 24 * 60 * 60_000, now, messages)).toBe('10 days ago')
    expect(formatRelativeTime(now - 11 * 24 * 60 * 60_000, now, messages)).toBe('11 days ago')
  })

  it('clamps future timestamps to just now and rejects invalid timestamps', () => {
    expect(formatRelativeTime(now + 10_000, now, messages)).toBe('just now')
    expect(formatRelativeTime('not-a-date', now, messages)).toBe('')
  })
})
