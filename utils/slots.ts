export const SLOT_START_HOURS = Array.from({ length: 12 }, (_, index) => index * 2)
const SLOT_INDEX = new Map(buildSlots().map((slot, index) => [slot, index]))

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

export function formatMergedSlotLabels(date: string, slots: string[]) {
  const sorted = [...new Set(slots)].sort(compareSlots)
  if (sorted.length === 0) return []

  const labels: string[] = []
  let startSlot = sorted[0]
  let previousSlot = sorted[0]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    if (!current || !isConsecutiveSlot(previousSlot, current)) {
      labels.push(formatSlotRange(date, startSlot, previousSlot))
      startSlot = current
    }
    previousSlot = current
  }

  labels.push(formatSlotRange(date, startSlot, previousSlot))
  return labels
}

function compareSlots(left: string, right: string) {
  return (SLOT_INDEX.get(left) ?? Number.MAX_SAFE_INTEGER) - (SLOT_INDEX.get(right) ?? Number.MAX_SAFE_INTEGER)
}

function isConsecutiveSlot(left: string, right: string) {
  const leftEnd = left.split('-')[1]
  const rightStart = right.split('-')[0]
  return Boolean(leftEnd && rightStart && leftEnd === rightStart)
}

function formatSlotRange(date: string, startSlot: string, endSlot: string) {
  const start = startSlot.split('-')[0] || startSlot
  const end = endSlot.split('-')[1] || endSlot
  return `${date} ${start}-${end}`
}
