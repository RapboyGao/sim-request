import { createBooking, readAllBookings } from '~/server/utils/booking-store'
import { isValidDate, buildSlots } from '~/utils/slots'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as {
    date?: string
    slots?: unknown[]
    name?: string
    isClassmate?: boolean
  }
  const date = String(body.date || '')
  const slots: string[] = Array.isArray(body.slots)
    ? body.slots.map((slot) => String(slot))
    : []
  const name = String(body.name || '').trim()
  const isClassmate = Boolean(body.isClassmate)

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

  const store = await readAllBookings(event)
  const duplicateSlot = selectedSlots.find((slot) => {
    const key = `bookings:${date}:${slot}`
    const current = store[key] || []
    return current.some((entry) => entry.name.trim() === name)
  })

  if (duplicateSlot) {
    const duplicateSlots = selectedSlots.filter((slot) => {
      const key = `bookings:${date}:${slot}`
      const current = store[key] || []
      return current.some((entry) => entry.name.trim() === name)
    })
    throw createError({
      statusCode: 409,
      statusMessage: '该时段已存在同名预约',
      data: {
        duplicateSlots,
        date,
        name,
      },
    })
  }

  const bookings = []
  for (const slot of selectedSlots) {
    bookings.push(await createBooking(event, { date, slot, name, isClassmate }))
  }

  return {
    ok: true,
    date,
    slots: selectedSlots,
    bookings,
  }
})
