import { afterEach, describe, expect, it } from 'vitest'
import { hasAdminCredentials, isAdminCredentials } from '../server/utils/admin-auth'

const originalUsername = process.env.ADMIN_USERNAME
const originalPassword = process.env.ADMIN_PASSWORD

function restoreEnv(name: 'ADMIN_USERNAME' | 'ADMIN_PASSWORD', value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

afterEach(() => {
  restoreEnv('ADMIN_USERNAME', originalUsername)
  restoreEnv('ADMIN_PASSWORD', originalPassword)
})

describe('admin credentials', () => {
  it('does not accept credentials when production configuration is missing', () => {
    delete process.env.ADMIN_USERNAME
    delete process.env.ADMIN_PASSWORD

    expect(hasAdminCredentials()).toBe(false)
    expect(isAdminCredentials('Albert', '1351531751532')).toBe(false)
  })

  it('matches only the configured credentials', () => {
    process.env.ADMIN_USERNAME = 'test-admin'
    process.env.ADMIN_PASSWORD = 'a-strong-test-password'

    expect(hasAdminCredentials()).toBe(true)
    expect(isAdminCredentials('test-admin', 'a-strong-test-password')).toBe(true)
    expect(isAdminCredentials('test-admin', 'wrong-password')).toBe(false)
    expect(isAdminCredentials('Albert', '1351531751532')).toBe(false)
  })
})
