import { DEFAULT_CHECKLIST_PASSWORD } from '~/utils/checklist-routes'

export function useChecklistPassword() {
  const config = useRuntimeConfig()
  const password = String(config.public.checklistsPassword || '').trim()
  return password || DEFAULT_CHECKLIST_PASSWORD
}
