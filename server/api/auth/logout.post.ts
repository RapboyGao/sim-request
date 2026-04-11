import { getAdminSessionCookieName } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  deleteCookie(event, getAdminSessionCookieName(), { path: '/' })
  return { ok: true }
})
