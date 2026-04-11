import { cancelBooking } from '~/server/utils/booking-store'
import { isValidDate } from '~/utils/slots'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ date?: string; slot?: string; id?: string }>(event)
  const date = body.date || ''
  const slot = body.slot || ''
  const id = body.id || ''

  if (!isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式不正确' })
  }
  if (!slot || !id) {
    throw createError({ statusCode: 400, statusMessage: '缺少取消参数' })
  }

  const entries = await cancelBooking(event, { date, slot, id })
  return { ok: true, entries }
})
