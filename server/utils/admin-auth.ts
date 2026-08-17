const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_SESSION_VALUE = 'logged_in'

export function isAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME || ''
  const configuredPassword = process.env.ADMIN_PASSWORD || ''
  return Boolean(configuredUsername && configuredPassword)
    && username === configuredUsername
    && password === configuredPassword
}

export function hasAdminCredentials() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE
}

export function getAdminSessionCookieValue() {
  return ADMIN_SESSION_VALUE
}

export function isAdminSessionValid(value: string | undefined) {
  return value === ADMIN_SESSION_VALUE
}
