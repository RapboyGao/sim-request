export const DEFAULT_CHECKLIST_PASSWORD = '13515'

export const CHECKLIST_ROUTE_IDS = [
  'before-flight-day',
  'before-sleep',
  'before-flight-going',
  'first-leg',
  'next-legs',
  'leaving-aircraft',
] as const

export type BuiltinChecklistRouteId = typeof CHECKLIST_ROUTE_IDS[number]

export function publicChecklistsHomeRoute() {
  return '/checklists/'
}

export function publicChecklistRoute(checklistId: string) {
  return checklistId === 'deicing'
    ? '/checklists/deicing'
    : `/checklists/${encodeURIComponent(checklistId)}`
}

export function publicCustomChecklistRoute(checklistId: string) {
  return `${publicChecklistsHomeRoute()}custom/${encodeURIComponent(checklistId)}`
}

export function publicCustomChecklistEditRoute(checklistId: string) {
  return `${publicCustomChecklistRoute(checklistId)}/edit`
}

export function privateChecklistsHomeRoute(passwords = DEFAULT_CHECKLIST_PASSWORD) {
  return `/private-checklists/${encodeURIComponent(passwords)}/`
}

export function privateChecklistRoute(passwords: string, checklistId: BuiltinChecklistRouteId | string) {
  return `${privateChecklistsHomeRoute(passwords)}${encodeURIComponent(checklistId)}`
}

export function privateCustomChecklistRoute(passwords: string, checklistId: string) {
  return `${privateChecklistsHomeRoute(passwords)}custom/${encodeURIComponent(checklistId)}`
}

export function privateCustomChecklistEditRoute(passwords: string, checklistId: string) {
  return `${privateCustomChecklistRoute(passwords, checklistId)}/edit`
}

// Legacy URL builders retained for compatibility tests and old integrations.
export function checklistRoute(passwords: string, checklistId: BuiltinChecklistRouteId | string) {
  return `/checklists/${encodeURIComponent(passwords)}/${encodeURIComponent(checklistId)}`
}
export function checklistsHomeRoute(passwords = DEFAULT_CHECKLIST_PASSWORD) {
  return `/checklists/${encodeURIComponent(passwords)}/`
}
export function customChecklistRoute(passwords: string, checklistId: string) {
  return `${checklistsHomeRoute(passwords)}custom/${encodeURIComponent(checklistId)}`
}
export function customChecklistEditRoute(passwords: string, checklistId: string) {
  return `${customChecklistRoute(passwords, checklistId)}/edit`
}
