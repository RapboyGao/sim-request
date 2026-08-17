type PwaManifest = {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone'
  background_color: string
  theme_color: string
  lang: string
  scope: string
  id: string
  orientation: 'portrait-primary'
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: string
  }>
}

function getSafeStartUrl(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.includes('://') || value.includes('\n') || value.includes('\r')) return '/'
  return value || '/'
}

export default defineEventHandler((event): PwaManifest => {
  const query = getQuery(event)
  const startUrl = getSafeStartUrl(query.start_url)

  setHeader(event, 'content-type', 'application/manifest+json; charset=utf-8')
  setHeader(event, 'cache-control', 'no-store')

  return {
    name: 'Observation 预约',
    short_name: 'Observation',
    description: 'Observation 预约系统，用于模拟机观摩预约、日历查看与管理。',
    start_url: startUrl,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f766e',
    lang: 'zh-CN',
    scope: '/',
    id: startUrl,
    orientation: 'portrait-primary',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
})
