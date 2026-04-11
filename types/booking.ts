export type BookingStatus = 'active' | 'canceled'
export type BookingPriority = 'specified' | 'classmate' | 'normal'

export interface BookingEntry {
  id: string
  date: string
  slot: string
  name: string
  priorityLevel: BookingPriority
  createdAt: string
  status: BookingStatus
}

export interface SlotSummary {
  slot: string
  active: BookingEntry[]
  canceled: BookingEntry[]
}

export interface DaySchedule {
  date: string
  slots: SlotSummary[]
}
