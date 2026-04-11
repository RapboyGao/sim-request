import { buildSlots, isValidDate } from '~/utils/slots'
import { listDayBookings, readAllBookings } from '~/server/utils/booking-store'

export default defineEventHandler(async (event) => {
  const date = getQuery(event).date as string | undefined

  if (date && !isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  const slots = buildSlots()
  const bookings = date ? await listDayBookings(event, date) : await readAllBookings(event)

  return {
    date: date || null,
    slots,
    bookings,
  }
})
