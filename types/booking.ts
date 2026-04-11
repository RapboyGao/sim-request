export type BookingStatus = 'active' | 'canceled'

export interface BookingEntry {
  id: string
  date: string
  slot: string
  name: string
  isStudent: boolean
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
