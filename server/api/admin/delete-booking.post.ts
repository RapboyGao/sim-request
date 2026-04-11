import { deleteBooking } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const body = await readBody<{ date?: string; slot?: string; id?: string }>(event)
  if (!body?.date || !body.slot || !body.id) {
    throw createError({ statusCode: 400, statusMessage: '缺少删除参数' })
  }

  const entries = await deleteBooking(event, {
    date: body.date,
    slot: body.slot,
    id: body.id,
  })

  return {
    ok: true,
    entries,
  }
})
