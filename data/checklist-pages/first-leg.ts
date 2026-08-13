import sourceMarkdown from '../checklists-source/first-leg.md?raw'
import { createBuiltinChecklist } from './_factory'

export const firstLegChecklist = createBuiltinChecklist('first-leg', 'First Leg', '', [
  ['Airplane Status', [
    'Jacket', 'Pins and Covers @ External', 'Pins and Covers @ Onboard', 'External Lights', 'Aircraft Certificates',
    'TLB Faults', 'Deferred Defects', 'Emergency Equipments', 'Circuit Breakers', 'Printer Paper',
    'Voice Recorder Charging', 'Cockpit Cross-Check', 'Speed Trim Fail', 'Oxygen Mask', 'Fuel System',
    'Hydraulic System', 'A/P', 'Recall Check', 'Windshield Wipers', 'Comms & HF Test', 'WXR / TCAS',
    'Flight Number', 'QFE', 'NAV OPTIONS', 'A/T', 'Systems Reset', 'Route', 'Special Procedures/Areas',
    'Alternate', 'Jepp Route',
  ]],
  ['Before Doors Closing', [
    'TLB Maintenance Work Completed', 'Passports', 'Total = Plan', 'L = R', 'Remaining + Added = Total',
    'Fuel Sheet Uploaded', 'Flight Plan Updated', 'Flight Plan - Signed', 'Load Sheet - Signed',
    'Load Sheet - Leg Verified', 'Load Sheet - Fuel Quantity', 'Load Sheet - Occupants / Crew',
    'TLB Maintenance Work Completed', 'All Logbooks In Cockpit', 'All Logbooks Have Sufficient Pages',
  ]],
  ['Before Start', [
    'Fuel Transfer', 'Recirculation Fan', 'Windshield Heater', 'Ground Facilities', 'EOSID', 'Comms',
    'Voice Recorder', 'Verify Departure Clearance', 'Lateral Mode', 'Initial Altitude', 'Heading', 'Tug',
    'CDU Check', 'Trim', 'Takeoff Data', 'Route', 'Comms', 'Voice Recorder',
  ]],
], sourceMarkdown)
