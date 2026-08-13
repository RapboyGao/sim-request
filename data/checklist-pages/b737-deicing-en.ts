import sourceMarkdown from '../checklists-source/b737-deicing-en.md?raw'
import { createBuiltinChecklist } from './_factory'

export const b737DeicingEnChecklist = createBuiltinChecklist('b737-deicing-en', '737 Deicing Procedures (English)', 'Applicable for engine-off or engine-idle deicing after taxiing to a de-icing pad.', [
  ['1. Before Taxi Procedure', [
    'GENERATOR ...... ON', 'GEN OFF BUS lights ...... Verify OFF', 'If engine shutdown is possible: APU generator ...... ON',
    'Probe heat ...... ON', 'Engine start switches ...... CONT', 'Engine anti-ice ...... As required',
    'Isolation valve ...... AUTO', 'All bleeds ...... OFF', 'If engine-idle deicing is confirmed: APU ...... OFF',
    'Ground personnel / equipment ...... Clear', 'Recall ...... Check', 'ENG/SYS ...... Check and clear',
  ]],
  ['2. Approaching De-icing Pad', ['All bleeds ...... OFF']],
  ['3a. At De-icing Pad - Engine-Off Deicing', [
    'All bleeds ...... OFF', 'APU generator ...... ON', 'Engine start switches ...... OFF',
    'Engine start levers ...... CUTOFF', '(Ready for deicing)', 'Engine anti-ice ...... OFF', 'Isolation valve ...... OPEN',
  ]],
  ['3b. At De-icing Pad - Engine-Idle Deicing', ['All bleeds ...... OFF', '(Ready for deicing)', 'Engine generators ...... ON', 'APU ...... OFF']],
  ['4a. After Engine-Off Deicing', [
    'Timer ...... 60 seconds', 'Anti-collision light ...... ON', 'Before start checklist ...... Complete',
    'After at least 60 seconds', 'Engine bleeds ...... ON', 'APU bleed ...... ON', 'DUAL BLEED light ...... Illuminated',
    'Packs ...... OFF', 'Ground personnel / equipment ...... Clear', 'Engines ...... Start',
    'Before taxi procedure and checklist (including Flaps 40 - UP - Takeoff flaps) ...... Complete',
  ]],
  ['4b. After Engine-Idle Deicing', [
    'Ground personnel / equipment ...... Clear', 'Timing ...... 60 seconds', 'Anti-collision light ...... ON',
    'Flaps ...... 40°', 'Engine anti-ice ...... As required', 'Flight controls ...... Check',
    'After the Flaps 40 green light', 'Flaps ...... UP', 'After at least 60 seconds', 'Engine bleeds ...... ON',
    'Packs ...... AUTO', 'After the flaps-up light is out', 'Flaps ...... Takeoff flaps', 'Recall ...... Check',
    'Weather radar ...... Set', 'ENG/SYS ...... Check and clear', 'Before taxi checklist ...... Complete',
  ]],
], sourceMarkdown)
