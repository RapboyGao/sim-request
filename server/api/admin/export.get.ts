import { readAllBookings } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

function toCsvValue(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const format = String(getQuery(event).format || 'csv')
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
      isStudent: item.isStudent ? '是' : '否',
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
    setHeader(event, 'content-disposition', 'attachment; filename="bookings-all.json"')
    return rows
  }

  const csv = [
    ['日期', '时段', '姓名', '是否为同学', '状态', '提交时间'].map(toCsvValue).join(','),
    ...rows.map((row) => [
      row.date,
      row.slot,
      row.name,
      row.isStudent,
      row.status,
      row.createdAt,
    ].map(toCsvValue).join(',')),
  ].join('\n')

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(event, 'content-disposition', 'attachment; filename="bookings-all.csv"')
  return csv
})
