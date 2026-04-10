import { buildSlots } from '~/utils/slots'
import { readAllBookings } from '~/server/utils/booking-store'

function toCsvValue(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export default defineEventHandler(async (event) => {
  const format = String(getQuery(event).format || 'csv')
  const date = getQuery(event).date as string | undefined
  const selectedDate = date || new Date().toISOString().slice(0, 10)
  const all = await readAllBookings(event)
  const slots = buildSlots()
  const rows = slots.flatMap((slot) => (all[`bookings:${selectedDate}:${slot}`] || []).map((item) => ({
    date: selectedDate,
    slot,
    name: item.name,
    isStudent: item.isStudent ? '是' : '否',
    status: item.status === 'confirmed' ? '已确认' : '候补',
    rank: item.rank,
    createdAt: item.createdAt,
  })))

  if (format === 'json') {
    setHeader(event, 'content-type', 'application/json; charset=utf-8')
    setHeader(event, 'content-disposition', `attachment; filename="bookings-${selectedDate}.json"`)
    return rows
  }

  const csv = [
    ['日期', '时段', '姓名', '是否为同学', '状态', '序号', '提交时间'].map(toCsvValue).join(','),
    ...rows.map((row) => [
      row.date,
      row.slot,
      row.name,
      row.isStudent,
      row.status,
      row.rank,
      row.createdAt,
    ].map(toCsvValue).join(',')),
  ].join('\n')

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="bookings-${selectedDate}.csv"`)
  return csv
})
