import sourceMarkdown from '../checklists-source/next-legs.md?raw'
import { createBuiltinChecklist } from './_factory'

export const nextLegsChecklist = createBuiltinChecklist('next-legs', 'Next Legs', '', [
  ['Before Exterior Inspection', ['IRS alignment', 'Logbook', 'Voice Recorder Charging', 'Devices Charging']],
  ['Procedures', [
    'Flight Number', 'Time Summary', 'Performance Calculation', 'NOTAM', 'Cockpit Cross-Check', 'QFE',
    'NAV OPTIONS', 'Route', 'Special Procedures/Areas', 'Alternate', 'Flight Director', 'Jepp Route',
  ]],
  ['Before Doors Closing', [
    'TLB Maintenance Work Completed', 'Passport', 'Total = Plan', 'L = R', 'Remaining + Added = Total',
    'Fuel Sheet Uploaded', 'Flight Plan - Info Correct', 'Flight Plan - Signed', 'Load Sheet - Signed',
    'Load Sheet - Leg Verified', 'Load Sheet - Fuel Quantity', 'Load Sheet - Occupants / Crew',
    'TLB Maintenance Work Completed', 'All Logbooks In Cockpit',
  ]],
  ['Before Start', [
    'Fuel Transfer', 'Recirculation Fan', 'Windshield Heater', 'Ground Facilities', 'EOSID', 'Comms',
    'Voice Recorder', 'Verify Departure Clearance', 'Lateral Mode', 'Initial Altitude', 'Heading', 'Tug',
    'CDU Check', 'Trim', 'Takeoff Data', 'Route', 'Comms', 'Voice Recorder',
  ]],
], sourceMarkdown)
