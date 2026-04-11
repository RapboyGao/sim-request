import { normalizeBookingMap, readAllBookings } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

function toCsvValue(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function formatExportTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value || ''

  return `${lookup('year')}${lookup('month')}${lookup('day')}-${lookup('hour')}${lookup('minute')}${lookup('second')}`
}

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const query = getQuery(event)
  const format = String(query.format || 'csv')
  const variant = String(query.variant || 'supabase')
  const timestamp = formatExportTimestamp()
  const all = await readAllBookings(event)
  const rows = Object.entries(all).flatMap(([key, items]) => {
    const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
    if (!match)
      return []

    const [, date, slot] = match as [string, string, string]
    return items.map((item) => ({
      date,
      slot,
      name: item.name,
      priorityLevel: item.priorityLevel,
      status: item.status === 'canceled' ? '已取消' : '未取消',
      createdAt: item.createdAt,
    }))
  }).sort((left, right) => {
    const dateCompare = left.date.localeCompare(right.date)
    if (dateCompare !== 0)
      return dateCompare

    const slotCompare = left.slot.localeCompare(right.slot)
    if (slotCompare !== 0)
      return slotCompare

    return left.createdAt.localeCompare(right.createdAt)
  })

  if (format === 'json') {
    setHeader(event, 'content-type', 'application/json; charset=utf-8')
    if (variant === 'debug') {
      setHeader(event, 'content-disposition', `attachment; filename="bookings-debug-${timestamp}.json"`)
      return normalizeBookingMap(all)
    }
    setHeader(event, 'content-disposition', `attachment; filename="bookings-supabase-${timestamp}.json"`)
    return rows.map((row) => ({
      id: `${row.date}:${row.slot}:${row.createdAt}:${row.name}`,
      date: row.date,
      slot: row.slot,
      name: row.name,
      priority_level: row.priorityLevel,
      created_at: row.createdAt,
      status: row.status === '已取消' ? 'canceled' : 'active',
    }))
  }

  const csv = [
    ['日期', '时段', '姓名', '级别', '状态', '提交时间'].map(toCsvValue).join(','),
    ...rows.map((row) => [
      row.date,
      row.slot,
      row.name,
      row.priorityLevel,
      row.status,
      row.createdAt,
    ].map(toCsvValue).join(',')),
  ].join('\n')

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="bookings-all-${timestamp}.csv"`)
  return csv
})
