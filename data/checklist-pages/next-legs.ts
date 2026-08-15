import { nextLegsSource as sourceMarkdown } from '../checklist-source-documents'
import { createBuiltinChecklist } from './_factory'

const item = (id: string, title: string) => ({ id: `next-legs.${id}`, title })

export const nextLegsChecklist = createBuiltinChecklist('next-legs', 'Next Legs', '', [
  { id: 'next-legs.before-exterior-inspection', title: 'Before Exterior Inspection', items: [
    item('before-exterior-inspection.irs-alignment', 'IRS alignment'), item('before-exterior-inspection.logbook', 'Logbook'), item('before-exterior-inspection.recorder-charging', 'Voice Recorder Charging'), item('before-exterior-inspection.devices-charging', 'Devices Charging'),
  ] },
  { id: 'next-legs.procedures', title: 'Procedures', items: [
    item('procedures.flight-number', 'Flight Number'), item('procedures.time-summary', 'Time Summary'), item('procedures.performance', 'Performance Calculation'), item('procedures.notam', 'NOTAM'), item('procedures.cross-check', 'Cockpit Cross-Check'), item('procedures.qfe', 'QFE'),
    item('procedures.nav-options', 'NAV OPTIONS'), item('procedures.route', 'Route'), item('procedures.special-procedures', 'Special Procedures/Areas'), item('procedures.alternate', 'Alternate'), item('procedures.flight-director', 'Flight Director'), item('procedures.jepp-route', 'Jepp Route'),
  ] },
  { id: 'next-legs.before-doors-closing', title: 'Before Doors Closing', items: [
    item('before-doors-closing.tlb-completed', 'TLB Maintenance Work Completed'), item('before-doors-closing.passport', 'Passport'), item('before-doors-closing.total-plan', 'Total = Plan'), item('before-doors-closing.left-right', 'L = R'), item('before-doors-closing.remaining-added', 'Remaining + Added = Total'),
    item('before-doors-closing.fuel-sheet', 'Fuel Sheet Uploaded'), item('before-doors-closing.flight-plan-info', 'Flight Plan - Info Correct'), item('before-doors-closing.flight-plan-signed', 'Flight Plan - Signed'), item('before-doors-closing.load-sheet-signed', 'Load Sheet - Signed'), item('before-doors-closing.load-sheet-leg', 'Load Sheet - Leg Verified'),
    item('before-doors-closing.load-sheet-fuel', 'Load Sheet - Fuel Quantity'), item('before-doors-closing.load-sheet-occupants', 'Load Sheet - Occupants / Crew'), item('before-doors-closing.tlb-completed-2', 'TLB Maintenance Work Completed'), item('before-doors-closing.logbooks', 'All Logbooks In Cockpit'),
  ] },
  { id: 'next-legs.before-start', title: 'Before Start', items: [
    item('before-start.fuel-transfer', 'Fuel Transfer'), item('before-start.recirculation-fan', 'Recirculation Fan'), item('before-start.windshield-heater', 'Windshield Heater'), item('before-start.ground-facilities', 'Ground Facilities'), item('before-start.eosid', 'EOSID'), item('before-start.comms', 'Comms'),
    item('before-start.voice-recorder', 'Voice Recorder'), item('before-start.departure-clearance', 'Verify Departure Clearance'), item('before-start.lateral-mode', 'Lateral Mode'), item('before-start.initial-altitude', 'Initial Altitude'), item('before-start.heading', 'Heading'), item('before-start.tug', 'Tug'),
    item('before-start.cdu-check', 'CDU Check'), item('before-start.trim', 'Trim'), item('before-start.takeoff-data', 'Takeoff Data'), item('before-start.route', 'Route'), item('before-start.comms-2', 'Comms'), item('before-start.voice-recorder-2', 'Voice Recorder'),
  ] },
], sourceMarkdown)
