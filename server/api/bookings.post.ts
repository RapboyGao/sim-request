import { createBooking, readAllBookings } from '~/server/utils/booking-store'
import { isValidDate, buildSlots } from '~/utils/slots'
import { composeStoredBookingName, hasForbiddenNameCharacter, isValidChinaMainlandPhone } from '~/utils/booking-name'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as {
    date?: string
    slots?: unknown[]
    name?: string
    phone?: string
    isClassmate?: boolean
  }
  const date = String(body.date || '')
  const slots: string[] = Array.isArray(body.slots)
    ? body.slots.map((slot) => String(slot))
    : []
  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').replace(/\s+/g, '').trim()
  const isClassmate = Boolean(body.isClassmate)

  if (!isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式不正确' })
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: '请填写姓名' })
  }

  if (hasForbiddenNameCharacter(name)) {
    throw createError({ statusCode: 400, statusMessage: '姓名中不能包含 @' })
  }

  if (phone && !isValidChinaMainlandPhone(phone)) {
    throw createError({ statusCode: 400, statusMessage: '请输入有效的中国大陆手机号' })
  }

  const validSlots = buildSlots()
  const selectedSlots = [...new Set(slots)].filter((slot): slot is string => validSlots.includes(slot))
  const storedName = composeStoredBookingName(name, phone)

  if (selectedSlots.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择至少一个有效时段' })
  }

  const store = await readAllBookings(event)
  const duplicateSlot = selectedSlots.find((slot) => {
    const key = `bookings:${date}:${slot}`
    const current = store[key] || []
    return current.some((entry) => entry.name.trim() === storedName)
  })

  if (duplicateSlot) {
    const duplicateSlots = selectedSlots.filter((slot) => {
      const key = `bookings:${date}:${slot}`
      const current = store[key] || []
      return current.some((entry) => entry.name.trim() === storedName)
    })
    throw createError({
      statusCode: 409,
      statusMessage: '该时段已存在同名预约',
      data: {
        duplicateSlots,
        date,
        name: storedName,
      },
    })
  }

  const bookings = []
  for (const slot of selectedSlots) {
    bookings.push(await createBooking(event, { date, slot, name: storedName, isClassmate }))
  }

  return {
    ok: true,
    date,
    slots: selectedSlots,
    bookings,
  }
})
