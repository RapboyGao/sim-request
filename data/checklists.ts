import { beforeFlightDayChecklist } from './checklist-pages/before-flight-day'
import { beforeSleepChecklist } from './checklist-pages/before-sleep'
import { beforeFlightGoingChecklist } from './checklist-pages/before-flight-going'
import { firstLegChecklist } from './checklist-pages/first-leg'
import { nextLegsChecklist } from './checklist-pages/next-legs'
import { leavingAircraftChecklist } from './checklist-pages/leaving-aircraft'
import { b737DeicingEnChecklist } from './checklist-pages/b737-deicing-en'
import { b737DeicingZhChecklist } from './checklist-pages/b737-deicing-zh'

/**
 * Built-in checklist catalog used by the home page, menu and status views.
 * The content is maintained by each page module under data/checklist-pages.
 */
export const builtinChecklists = [
  beforeFlightDayChecklist,
  beforeSleepChecklist,
  beforeFlightGoingChecklist,
  firstLegChecklist,
  nextLegsChecklist,
  leavingAircraftChecklist,
  b737DeicingEnChecklist,
  b737DeicingZhChecklist,
] as const
