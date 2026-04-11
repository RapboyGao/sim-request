export function useRouteLoading() {
  const active = useState('route-loading-active', () => false)
  const pendingCount = useState('route-loading-pending-count', () => 0)
  const router = useRouter()

  if (import.meta.client) {
    const start = () => {
      pendingCount.value += 1
      active.value = true
    }
    const stop = () => {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
      if (pendingCount.value === 0) {
        active.value = false
      }
    }

    router.beforeEach(() => {
      start()
    })
    router.afterEach(() => {
      stop()
    })
    router.onError(() => {
      stop()
    })
  }

  return { active }
}
