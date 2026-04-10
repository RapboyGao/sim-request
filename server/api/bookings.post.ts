import { createBooking } from '~/server/utils/booking-store'
import { isValidDate, buildSlots } from '~/utils/slots'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const date = String(body?.date || '')
  const slot = String(body?.slot || '')
  const name = String(body?.name || '').trim()
  const isStudent = Boolean(body?.isStudent)

  if (!isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式不正确' })
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '请填写姓名' })
  }

  if (!buildSlots().includes(slot)) {
    throw createError({ statusCode: 400, statusMessage: '请选择有效时段' })
  }

  const bookings = await createBooking(event, { date, slot, name, isStudent })

  return {
    ok: true,
    date,
    slot,
    bookings,
  }
})
