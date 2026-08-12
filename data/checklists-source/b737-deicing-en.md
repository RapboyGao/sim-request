---
title: 737 Deicing Procedures (English)
sidebar: true
isOriginal: true
tag:
  - B737
next: ./b737-deicing-zh.md
---

<script setup lang="ts">
let beforeInitialTaxiItems = [
  'GENERATOR 1 & 2 - ON',
  'GEN OFF BUS lights - Verify OFF',
  'APU GENERATOR - As Needed',
  'Probe Heat - On',
  'Engine Start Switches - CONT',
  'ENGINE ANTI-ICE - As Needed',
  'ISOLATION VALVE - AUTO',
  'All BLEED Switches - OFF',
  'APU Switch - As Needed',
  'Ground Personnel & Equipment - Clear',
  'Recall - Check',
]

let engineOffDeicingItems = [
  'APU GENERATOR - Verify ON',
  'ENGINE ANTI-ICE - OFF',
  'ENGINE START switches - OFF',
  'ENGINE START LEVER - CUTOFF',
]

let engineIdleDeicingItems = [
  'ENGINE GENERATORS - ON',
  'APU - OFF',
]

let afterEngineOffDeicingItems = [
  'Timer - 60 seconds',
  'BEFORE START Checklist?',
  '(AFTER 60 SEC) ENGINE BLEED - ON',
  'APU BLEED - ON',
  'DUAL BLEED - Verify Illuminated',
  'Packs - OFF',
  'Ground Personnel & Equipment - Clear',
  'Engines - Start',
  'BEFORE TAXI Procedures (with flaps check)',
]

let afterEngineIdleDeicingItems = [
  'Ground Personnel & Equipment - Clear',
  'Timer - 60 seconds',
  'ANTI-COLLISION LIGHT - Verify ON',
  'FLAPS 40 - GREEN',
  'FLIGHT CONTROLS - CHECK',
  'FLAPS - VERIFY 40 GREEN LIGHT',
  'FLAPS - UP',
  'ENGINE ANTI-ICE - AS NEEDED',
  '(AFTER 60 SEC) ENGINE BLEEDs - ON',
  'PACKS - AUTO',
  'FLAPS - TAKEOFF POSITION',
  'RECALL - CHECK',
  'WEATHER RADAR - SET',
  'ENG AND SYS - CLEAR',
  'BEFORE-TAXI CHECKLIST',
]
</script>

- Applicable for engine-off or engine-idle deicing after taxiing to a remote de-icing pad.

## Before Initial Taxi

<MyChecklistItemGroup  :items="beforeInitialTaxiItems" />

::: note

- If engine-off de-icing is required or possible
  - APU generator should be ON
  - APU switch should be ON

:::

## At De-icing Pad

### For Engine-Off Deicing

<MyChecklistItemGroup  :items="engineOffDeicingItems" />

### For Engine-Idle Deicing

<MyChecklistItemGroup  :items="engineIdleDeicingItems" />

## After Engine-Off Deicing

<MyChecklistItemGroup  :items="afterEngineOffDeicingItems" />

## After Engine-Idle Deicing

<MyChecklistItemGroup  :items="afterEngineIdleDeicingItems" />

---

<ResetAllButton />
