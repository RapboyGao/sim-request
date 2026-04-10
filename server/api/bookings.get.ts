import { buildSlots, isValidDate } from '~/utils/slots'
import { listDayBookings } from '~/server/utils/booking-store'

export default defineEventHandler(async (event) => {
  const date = getQuery(event).date as string | undefined
  const selectedDate = date || new Date().toISOString().slice(0, 10)

  if (!isValidDate(selectedDate)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  const slots = buildSlots()
  const bookings = await listDayBookings(event, selectedDate)

  return {
    date: selectedDate,
    slots,
    bookings,
  }
})
