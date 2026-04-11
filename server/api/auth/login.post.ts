import { getAdminSessionCookieName, getAdminSessionCookieValue, isAdminCredentials } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body.username || '').trim()
  const password = body.password || ''

  if (!isAdminCredentials(username, password)) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }

  setCookie(event, getAdminSessionCookieName(), getAdminSessionCookieValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  return { ok: true }
})
