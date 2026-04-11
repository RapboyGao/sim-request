const ADMIN_USERNAME = 'Albert'
const ADMIN_PASSWORD = '1351531751532'
const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_SESSION_VALUE = 'logged_in'

export function isAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
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
