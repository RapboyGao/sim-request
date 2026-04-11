import { createBooking } from '~/server/utils/booking-store'
import { isValidDate, buildSlots } from '~/utils/slots'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as {
    date?: string
    slots?: unknown[]
    name?: string
    isStudent?: boolean
  }
  const date = String(body.date || '')
  const slots: string[] = Array.isArray(body.slots)
    ? body.slots.map((slot) => String(slot))
    : []
  const name = String(body.name || '').trim()
  const isStudent = Boolean(body.isStudent)

  if (!isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式不正确' })
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '请填写姓名' })
  }

  const validSlots = buildSlots()
  const selectedSlots = [...new Set(slots)].filter((slot): slot is string => validSlots.includes(slot))

  if (selectedSlots.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择至少一个有效时段' })
  }

  const bookings = await Promise.all(
    selectedSlots.map((slot) => createBooking(event, { date, slot, name, isStudent })),
  )

  return {
    ok: true,
    date,
    slots: selectedSlots,
    bookings,
  }
})
