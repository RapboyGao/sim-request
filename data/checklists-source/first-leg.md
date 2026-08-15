---
title: First Leg
sidebar: true
isOriginal: true
next: ./next-legs.md
---

<script setup lang="ts">
const firstLegItems = [
  'Jacket',
  'Pins and Covers @ External',
  'Pins and Covers @ Onboard',
  'External Lights',
  'Aircraft Certificates',
  'TLB Faults',
  'Deferred Defects',
  'Emergency Equipments',
  'Circuit Breakers',
  'Printer Paper',
  'Voice Recorder Charging',
  'Cockpit Cross-Check',
  'Speed Trim Fail',
  'Oxygen Mask',
  'Fuel System',
  'Hydraulic System',
  'A/P',
  'Recall Check',
  'Windshield Wipers',
  'Comms & HF Test',
  'WXR / TCAS',
  'Flight Number',
  'QFE',
  'NAV OPTIONS',
  'A/T',
  'Systems Reset',
  'Route',
  'Special Procedures/Areas',
  'Alternate',
  'Jepp Route'
]
const proceduresItems = [
  'TLB Maintenance Work Completed', // 重复
  'Passports',
  'Total = Plan',
  'L = R',
  'Remaining + Added = Total',
  'Fuel Sheet Uploaded',
  'Flight Plan Updated',
  'Flight Plan - Signed',
  'Load Sheet - Signed',
  'Load Sheet - Leg Verified',
  'Load Sheet - Fuel Quantity',
  'Load Sheet - Occupants / Crew',
  'TLB Maintenance Work Completed', // 重复
  'All Logbooks In Cockpit', 
  'All Logbooks Have Sufficient Pages'
]

const beforeStartItems = [
  'Fuel Transfer',
  'Recirculation Fan',
  'Windshield Heater',
  'Ground Facilities',
  'EOSID',
  'Comms', // 重复
  'Voice Recorder', // 重复
  'Verify Departure Clearance',
  'Lateral Mode',
  'Initial Altitude',
  'Heading',
  'Tug',
  'CDU Check',
  'Trim',
  'Takeoff Data',
  'Route',
  'Comms', // 重复
  'Voice Recorder' // 重复
]
</script>

## Airplane Status

<MyChecklistItemGroup  :items="firstLegItems" />

## Before Doors Closing

<MyChecklistItemGroup  :items="proceduresItems" />

## Before Start

<MyChecklistItemGroup  :items="beforeStartItems" />

---

<ResetAllButton />

