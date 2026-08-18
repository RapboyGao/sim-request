import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const nuxtConfig = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
const app = readFileSync(new URL('../app.vue', import.meta.url), 'utf8')
const manifest = readFileSync(new URL('../server/api/pwa-manifest.get.ts', import.meta.url), 'utf8')

describe('offline PWA assets', () => {
  it('matches versioned icon-font URLs in the precache and runtime cache', () => {
    expect(nuxtConfig).toContain('ignoreURLParametersMatching: [/^v$/]')
    expect(nuxtConfig).toContain("globPatterns: ['**/*.{js,css,html,json,png,svg,ico,woff,woff2,ttf,eot}']")
    expect(nuxtConfig).toContain("cacheName: 'site-assets'")
    expect(nuxtConfig).toContain("cacheName: 'pwa-manifest'")
  })

  it('references local icon assets from the app and manifest', () => {
    expect(app).toContain("href: '/favicon.png'")
    expect(app).toContain("href: '/apple-touch-icon.png'")
    expect(manifest).toContain("src: '/pwa-192x192.png'")
    expect(manifest).toContain("src: '/pwa-512x512.png'")
  })
})
