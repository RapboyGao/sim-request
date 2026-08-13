import sourceMarkdown from '../checklists-source/before-sleep.md?raw'
import { createBuiltinChecklist } from './_factory'

export const beforeSleepChecklist = createBuiltinChecklist('before-sleep', 'Before Sleep', '', [
  ['Before Sleep', [
    'Water Bottle', 'Water Heater', 'Stuff for Flight', 'Alarm Clock', 'Data Update', 'Prep Site',
    'Learning Site', 'Quit Unnecessary Chats', 'Medicine', 'Vitamins', 'Air Purifier', 'Air Conditioner',
    'Ceiling Fan', 'Mosquito repellent device', 'Water Flosser', 'Tooth Brushed', 'Bath', 'Water',
    'Mouth Wash', 'Skin Medicine', 'Charging', 'Do Not Disturb', 'Lip Care', 'Face Care', 'Unite',
  ]],
], sourceMarkdown)
