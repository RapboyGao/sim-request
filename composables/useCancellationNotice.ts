import type { BookingPriority, BookingPromotion } from '~/types/booking'

export type CancellationNoticeItem = {
  id: string
  name: string
  date: string
  slots: string[]
  priorityLevel: BookingPriority
}

type CancellationNoticeState = {
  open: boolean
  items: CancellationNoticeItem[]
}

export function useCancellationNotice() {
  const notice = useState<CancellationNoticeState>('cancellation-success-notice', () => ({
    open: false,
    items: [],
  }))

  function showCancellationNotice(items: BookingPromotion[]) {
    const grouped = new Map<string, CancellationNoticeItem>()

    for (const item of items) {
      const key = `${item.date}|${item.name}|${item.priorityLevel}`
      const current = grouped.get(key)
      if (!current) {
        grouped.set(key, {
          id: key,
          name: item.name,
          date: item.date,
          slots: [item.slot],
          priorityLevel: item.priorityLevel,
        })
        continue
      }

      current.slots.push(item.slot)
    }

    notice.value = {
      open: grouped.size > 0,
      items: [...grouped.values()]
        .map((item) => ({
          ...item,
          slots: [...new Set(item.slots)],
        }))
        .sort((left, right) => {
          const dateCompare = left.date.localeCompare(right.date)
          if (dateCompare !== 0) return dateCompare
          if (left.priorityLevel !== right.priorityLevel) {
            const order: Record<BookingPriority, number> = {
              specified: 0,
              classmate: 1,
              normal: 2,
            }
            return order[left.priorityLevel] - order[right.priorityLevel]
          }
          return left.name.localeCompare(right.name)
        }),
    }
  }

  function hideCancellationNotice() {
    notice.value = {
      open: false,
      items: [],
    }
  }

  return {
    notice,
    showCancellationNotice,
    hideCancellationNotice,
  }
}
