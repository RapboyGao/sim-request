import { deleteBookingsBefore } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

function getYesterdayDate() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const body = await readBody<{ confirm?: boolean }>(event)
  if (!body?.confirm) {
    throw createError({ statusCode: 400, statusMessage: '请先确认删除' })
  }

  const cutoffDate = getYesterdayDate()
  const result = await deleteBookingsBefore(event, cutoffDate)

  return {
    ok: true,
    cutoffDate,
    removedCount: result?.removedKeys.length || 0,
  }
})
