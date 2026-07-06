type BookingSuccessNoticeState = {
  open: boolean
  bookingId: string
}

export function useBookingSuccessNotice() {
  const notice = useState<BookingSuccessNoticeState>('booking-success-notice', () => ({
    open: false,
    bookingId: '',
  }))

  function showBookingSuccessNotice(bookingId = '') {
    notice.value = {
      open: true,
      bookingId,
    }
  }

  function hideBookingSuccessNotice() {
    notice.value = {
      open: false,
      bookingId: '',
    }
  }

  return {
    notice,
    showBookingSuccessNotice,
    hideBookingSuccessNotice,
  }
}
