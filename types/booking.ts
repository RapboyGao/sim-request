export type BookingStatus = 'confirmed' | 'waitlist' | 'canceled'

export interface BookingEntry {
  id: string
  date: string
  slot: string
  name: string
  isStudent: boolean
  createdAt: string
  status: BookingStatus
  rank: number
}

export interface SlotSummary {
  slot: string
  confirmed: BookingEntry[]
  waitlist: BookingEntry[]
  canceled: BookingEntry[]
}

export interface DaySchedule {
  date: string
  slots: SlotSummary[]
}
