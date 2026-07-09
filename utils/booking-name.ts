export function isValidChinaMainlandPhone(value: string) {
  return /^1[3-9]\d{9}$/.test(value.trim())
}

export function hasForbiddenNameCharacter(value: string) {
  return value.includes('@')
}

export function composeStoredBookingName(name: string, phone = '') {
  const trimmedName = name.trim()
  const trimmedPhone = phone.trim()
  return trimmedPhone ? `${trimmedName}@${trimmedPhone}` : trimmedName
}

export function parseStoredBookingName(value: string) {
  const trimmed = value.trim()
  const atIndex = trimmed.lastIndexOf('@')
  if (atIndex <= 0) {
    return {
      name: trimmed,
      phone: '',
    }
  }

  const name = trimmed.slice(0, atIndex).trim()
  const phone = trimmed.slice(atIndex + 1).trim()
  return {
    name,
    phone,
  }
}

export function getBookingSearchText(value: string) {
  const parsed = parseStoredBookingName(value)
  return `${parsed.name} ${parsed.phone}`.trim().toLowerCase()
}
