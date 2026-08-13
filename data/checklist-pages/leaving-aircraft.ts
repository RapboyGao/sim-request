import sourceMarkdown from '../checklists-source/leaving-the-aircraft.md?raw'
import { createBuiltinChecklist } from './_factory'

export const leavingAircraftChecklist = createBuiltinChecklist('leaving-aircraft', 'Leaving the Aircraft', '', [
  ['Procedures', [
    'Parking Brake', 'Logbook', 'Headset', 'Voice Recorder', 'Comms', 'Time Log', 'TLB', 'Carbon Work',
    'Charger', 'iPad', 'Tidy up', 'Mission Certificate', 'Passports', 'Secure Procedure', 'Pumps',
    'Cockpit Door', 'Luggage',
  ]],
], sourceMarkdown)
