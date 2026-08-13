import sourceMarkdown from '../checklists-source/before-flight-day.md?raw'
import { createBuiltinChecklist } from './_factory'

export const beforeFlightDayChecklist = createBuiltinChecklist('before-flight-day', 'A Day Before', '', [
  ['Morning', ['Online Preparation', 'NOTAM', 'Download Relevant Files for Airborne Review', 'EFB Data Update', "Crew Members' Status", 'Clothing Requirements']],
  ['Charging', ['Recorder Data Output', 'Recorder Charging', 'IPad Charging', 'Flashlight Charging', 'Charging']],
  ['Items', [
    'Pilot Hat', 'Sunglasses', 'Pen', 'Charger', 'Reflective Vest', 'Flashlight', 'Aviation Headphones',
    'Voice Recorder', 'Boarding Pass', 'Mouthwash', 'Lens Wipes', 'Dental Floss (牙线)', 'Vitamins',
    'Thermos Cup', 'Earplugs', 'Lip Balm', 'Humidifier', 'Eye Mask', 'Casual Clothes', 'U-shaped Pillow',
    'Razor', 'Lens Cleaning Paper', 'Shoes', 'Socks', 'Medicine', 'Insect Repellent', 'Adapter Plug',
    'Pocket 3', 'Credit Card', 'Power Bank',
  ]],
], sourceMarkdown)
