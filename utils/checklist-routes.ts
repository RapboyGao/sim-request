export const PUBLIC_CHECKLIST_ROUTE_IDS = ['deicing', 'no-engine-bleed-takeoff', 'preflight', 'first-leg', 'turnaround'] as const

export function publicChecklistsHomeRoute() { return '/checklists/' }
export function publicChecklistRoute(checklistId: string) { return `/checklists/${encodeURIComponent(checklistId)}` }
export function publicCustomChecklistRoute(checklistId: string) { return `${publicChecklistsHomeRoute()}custom/${encodeURIComponent(checklistId)}` }
export function publicCustomChecklistEditRoute(checklistId: string) { return `${publicCustomChecklistRoute(checklistId)}/edit` }
