---
title: Next Legs
sidebar: true
isOriginal: true
prev: ./first-leg.md
next: ./leaving-the-aircraft.md
---

<script setup lang="ts">
const beforeExteriorInspection = [
  'IRS alignment',
  'Logbook',
  // 'Carbon Work',
  'Voice Recorder Charging',
  'Devices Charging',
]

const nextLegsItems = [
  'Flight Number',
  'Time Summary',
  'Performance Calculation',
  'NOTAM',
  'Cockpit Cross-Check',
  'QFE',
  'NAV OPTIONS',
  'Route',
  'Special Procedures/Areas',
  'Alternate',
  'Flight Director',
  'Jepp Route'
]

const proceduresItems = [
  'TLB Maintenance Work Completed', // 重复
  'Passport',
  'Total = Plan',
  'L = R',
  'Remaining + Added = Total',
  'Fuel Sheet Uploaded',
  'Flight Plan - Info Correct',
  'Flight Plan - Signed',
  'Load Sheet - Signed',
  'Load Sheet - Leg Verified',
  'Load Sheet - Fuel Quantity',
  'Load Sheet - Occupants / Crew',
  'TLB Maintenance Work Completed', // 重复
  'All Logbooks In Cockpit'
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

## Before Exterior Inspection

<MyChecklistItemGroup  :items="beforeExteriorInspection" />

## Procedures

<MyChecklistItemGroup  :items="nextLegsItems" />

## Before Doors Closing

<MyChecklistItemGroup  :items="proceduresItems" />

## Before Start

<MyChecklistItemGroup  :items="beforeStartItems" />

---

<ResetAllButton />
