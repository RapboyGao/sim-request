export const SLOT_START_HOURS = Array.from({ length: 12 }, (_, index) => index * 2)

export function buildSlots() {
  return SLOT_START_HOURS.map((hour) => {
    const start = `${String(hour).padStart(2, '0')}:00`
    const endHour = (hour + 2) % 24
    const end = `${String(endHour).padStart(2, '0')}:00`
    return `${start}-${end}`
  })
}

export function isValidDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00`))
}
