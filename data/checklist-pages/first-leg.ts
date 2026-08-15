import { firstLegSource as sourceMarkdown } from '../checklist-source-documents'
import { createBuiltinChecklist } from './_factory'

const item = (id: string, title: string) => ({ id: `first-leg.${id}`, title })

export const firstLegChecklist = createBuiltinChecklist('first-leg', 'First Leg', '', [
  { id: 'first-leg.airplane-status', title: 'Airplane Status', items: [
    item('airplane-status.jacket', 'Jacket'), item('airplane-status.external-pins', 'Pins and Covers @ External'), item('airplane-status.onboard-pins', 'Pins and Covers @ Onboard'), item('airplane-status.external-lights', 'External Lights'), item('airplane-status.certificates', 'Aircraft Certificates'),
    item('airplane-status.tlb-faults', 'TLB Faults'), item('airplane-status.deferred-defects', 'Deferred Defects'), item('airplane-status.emergency-equipment', 'Emergency Equipments'), item('airplane-status.circuit-breakers', 'Circuit Breakers'), item('airplane-status.printer-paper', 'Printer Paper'),
    item('airplane-status.recorder-charging', 'Voice Recorder Charging'), item('airplane-status.cross-check', 'Cockpit Cross-Check'), item('airplane-status.speed-trim', 'Speed Trim Fail'), item('airplane-status.oxygen-mask', 'Oxygen Mask'), item('airplane-status.fuel-system', 'Fuel System'),
    item('airplane-status.hydraulic-system', 'Hydraulic System'), item('airplane-status.ap', 'A/P'), item('airplane-status.recall', 'Recall Check'), item('airplane-status.wipers', 'Windshield Wipers'), item('airplane-status.comms-hf', 'Comms & HF Test'),
    item('airplane-status.wxr-tcas', 'WXR / TCAS'), item('airplane-status.flight-number', 'Flight Number'), item('airplane-status.qfe', 'QFE'), item('airplane-status.nav-options', 'NAV OPTIONS'), item('airplane-status.at', 'A/T'),
    item('airplane-status.systems-reset', 'Systems Reset'), item('airplane-status.route', 'Route'), item('airplane-status.special-procedures', 'Special Procedures/Areas'), item('airplane-status.alternate', 'Alternate'), item('airplane-status.jepp-route', 'Jepp Route'),
  ] },
  { id: 'first-leg.before-doors-closing', title: 'Before Doors Closing', items: [
    item('before-doors-closing.tlb-completed', 'TLB Maintenance Work Completed'), item('before-doors-closing.passports', 'Passports'), item('before-doors-closing.total-plan', 'Total = Plan'), item('before-doors-closing.left-right', 'L = R'), item('before-doors-closing.remaining-added', 'Remaining + Added = Total'),
    item('before-doors-closing.fuel-sheet', 'Fuel Sheet Uploaded'), item('before-doors-closing.flight-plan-updated', 'Flight Plan Updated'), item('before-doors-closing.flight-plan-signed', 'Flight Plan - Signed'), item('before-doors-closing.load-sheet-signed', 'Load Sheet - Signed'), item('before-doors-closing.load-sheet-leg', 'Load Sheet - Leg Verified'),
    item('before-doors-closing.load-sheet-fuel', 'Load Sheet - Fuel Quantity'), item('before-doors-closing.load-sheet-occupants', 'Load Sheet - Occupants / Crew'), item('before-doors-closing.tlb-completed-2', 'TLB Maintenance Work Completed'), item('before-doors-closing.logbooks', 'All Logbooks In Cockpit'), item('before-doors-closing.logbook-pages', 'All Logbooks Have Sufficient Pages'),
  ] },
  { id: 'first-leg.before-start', title: 'Before Start', items: [
    item('before-start.fuel-transfer', 'Fuel Transfer'), item('before-start.recirculation-fan', 'Recirculation Fan'), item('before-start.windshield-heater', 'Windshield Heater'), item('before-start.ground-facilities', 'Ground Facilities'), item('before-start.eosid', 'EOSID'), item('before-start.comms', 'Comms'),
    item('before-start.voice-recorder', 'Voice Recorder'), item('before-start.departure-clearance', 'Verify Departure Clearance'), item('before-start.lateral-mode', 'Lateral Mode'), item('before-start.initial-altitude', 'Initial Altitude'), item('before-start.heading', 'Heading'), item('before-start.tug', 'Tug'),
    item('before-start.cdu-check', 'CDU Check'), item('before-start.trim', 'Trim'), item('before-start.takeoff-data', 'Takeoff Data'), item('before-start.route', 'Route'), item('before-start.comms-2', 'Comms'), item('before-start.voice-recorder-2', 'Voice Recorder'),
  ] },
], sourceMarkdown)
