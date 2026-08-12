---
title: Before Sleep
sidebar: true
isOriginal: true
---

<script setup lang="ts">
let items = [
    'Water Bottle',
    'Water Heater',
    'Stuff for Flight',
    'Alarm Clock', 
    'Data Update',
    'Prep Site',
    'Learning Site',
    'Quit Unnecessary Chats',
    'Medicine', 
    'Vitamins', 
    'Air Purifier',
    'Air Conditioner',
    'Ceiling Fan', // 浴霸
    'Mosquito repellent device', 
    'Water Flosser', //冲牙器
    'Tooth Brushed', 
    'Bath', 
    'Water',
    'Mouth Wash', 
    'Skin Medicine', 
    'Charging',
    'Do Not Disturb',
    'Lip Care', 
    'Face Care',
    'Unite'
]
</script>

<MyChecklistItemGroup :items="items" />

---

<ResetAllButton />
