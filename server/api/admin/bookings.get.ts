import { readAllBookings } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const all = await readAllBookings(event)
  const entries = Object.entries(all).flatMap(([key, items]) => {
    const match = key.match(/^bookings:(\d{4}-\d{2}-\d{2}):(.+)$/)
    if (!match)
      return []

    const [, date, slot] = match as [string, string, string]
    return items.map((item) => ({
      ...item,
      date,
      slot,
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

  return {
    entries,
    totals: {
      active: entries.filter((item) => item.status !== 'canceled').length,
      canceled: entries.filter((item) => item.status === 'canceled').length,
    },
  }
})
