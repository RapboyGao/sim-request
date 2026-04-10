import { buildSlots } from '~/utils/slots'
import { readAllBookings } from '~/server/utils/booking-store'

export default defineEventHandler(async (event) => {
  const date = getQuery(event).date as string | undefined
  const selectedDate = date || new Date().toISOString().slice(0, 10)
  const all = await readAllBookings(event)
  const slots = buildSlots()
  const entries = slots.flatMap((slot) => (all[`bookings:${selectedDate}:${slot}`] || []).map((item) => ({
    ...item,
    date: selectedDate,
    slot,
  })))

  return {
    date: selectedDate,
    slots,
    entries,
    totals: {
      confirmed: entries.filter((item) => item.status === 'confirmed').length,
      waitlist: entries.filter((item) => item.status === 'waitlist').length,
    },
  }
})
