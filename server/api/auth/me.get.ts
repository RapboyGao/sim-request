import { getAdminSessionCookieName, isAdminSessionValid } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, getAdminSessionCookieName())
  return { authenticated: isAdminSessionValid(cookie) }
})
