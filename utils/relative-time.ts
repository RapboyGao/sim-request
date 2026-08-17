export type RelativeTimeMessages = {
  justNow: string
  minute: (count: number) => string
  hour: (count: number) => string
  day: (count: number) => string
}

export type RelativeTimeParts =
  | { unit: 'justNow'; count: 0 }
  | { unit: 'minute' | 'hour' | 'day'; count: number }

function toTimestamp(value: string | number | Date) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return Date.parse(value)
}

export function relativeTimeParts(value: string | number | Date, now = Date.now()): RelativeTimeParts | null {
  const timestamp = toTimestamp(value)
  if (!Number.isFinite(timestamp)) return null

  const elapsed = Math.max(0, now - timestamp)
  if (elapsed < 60 * 1000) return { unit: 'justNow', count: 0 }

  const minutes = Math.floor(elapsed / (60 * 1000))
  if (minutes < 60) return { unit: 'minute', count: minutes }

  const hours = Math.floor(elapsed / (60 * 60 * 1000))
  if (hours < 24) return { unit: 'hour', count: hours }

  return { unit: 'day', count: Math.floor(elapsed / (24 * 60 * 60 * 1000)) }
}

export function formatRelativeTime(
  value: string | number | Date,
  now: number,
  messages: RelativeTimeMessages,
) {
  const parts = relativeTimeParts(value, now)
  if (!parts) return ''
  if (parts.unit === 'justNow') return messages.justNow
  return messages[parts.unit](parts.count)
}
