export const CHECKLIST_ROUTE_IDS = [
  'before-flight-day',
  'before-sleep',
  'before-flight-going',
  'first-leg',
  'next-legs',
  'leaving-aircraft',
  'b737-deicing-en',
  'b737-deicing-zh',
] as const

export type BuiltinChecklistRouteId = typeof CHECKLIST_ROUTE_IDS[number]

export function checklistRoute(passwords: string, checklistId: BuiltinChecklistRouteId | string) {
  return `/checklists/${encodeURIComponent(passwords)}/${encodeURIComponent(checklistId)}`
}

export function checklistsHomeRoute(passwords: string) {
  return `/checklists/${encodeURIComponent(passwords)}/`
}

export function customChecklistRoute(passwords: string, checklistId: string) {
  return `${checklistsHomeRoute(passwords)}custom/${encodeURIComponent(checklistId)}`
}
