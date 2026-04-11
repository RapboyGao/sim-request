import { setBookingPriority } from '~/server/utils/booking-store'
import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'
import type { BookingPriority } from '~/types/booking'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  if (!isAdminSessionValid(cookie)) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const body = (await readBody(event)) as {
    date?: string
    slot?: string
    id?: string
    priorityLevel?: BookingPriority
  }

  const date = String(body.date || '')
  const slot = String(body.slot || '')
  const id = String(body.id || '')
  const priorityLevel = body.priorityLevel

  if (!date || !slot || !id) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }

  if (priorityLevel !== 'specified' && priorityLevel !== 'student' && priorityLevel !== 'normal') {
    throw createError({ statusCode: 400, statusMessage: '级别不正确' })
  }

  const bookings = await setBookingPriority(event, {
    date,
    slot,
    id,
    priorityLevel,
  })

  return { ok: true, bookings }
})
