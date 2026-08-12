---
title: 737 Deicing Procedures (Chinese)
sidebar: true
isOriginal: true
tag:
  - B737
prev: ./b737-deicing-en.md
---

<script setup lang="ts">
let beforeInitialTaxiItems = [
  '发电机 - ON',
  'GEN OFF BUS 灯 - 灭',
  'APU发电机 - 按需',
  '探头加温 - ON',
  '发动机起动电门 - 连续',
  '发动机防冰 - 按需',
  '隔离活门 - 自动',
  '所有引气 - OFF',
  'APU - 按需',
  '地面人员设备 - 移开',
  '再现 - 检查'
]

let engineOffDeicingItems = [
  'APU发电机 - 确认接通',
  '发动机防冰 - OFF',
  '发动机起动电门 - OFF',
  '发动机起动手柄 - CUTOFF'
]

let engineIdleDeicingItems = [
  '发动机发电机 - 接通',
  'APU - OFF'
]

let afterEngineOffDeicingItems = [
  '计时器 - 60秒',
  '起动前检查单',
  '(60秒后) 发动机引气 - ON',
  'APU引气 - ON',
  '双引气灯 - 亮',
  '空调组件 - OFF',
  '地面人员设备 - 移开',
  '发动机 - 起动',
  '滑行前程序（含襟翼全行程检查）'
]

let afterEngineIdleDeicingItems = [
  '地面人员设备 - 移开',
  '计时器 - 60秒',
  '防撞灯 - 确认接通',
  '襟翼40 - 绿灯',
  '飞行操纵检查',
  '襟翼40绿灯后收上',
  '发动机防冰 - 按需',
  '（60秒后）发动机引气 - ON',
  '空调组件 - AUTO',
  '襟翼 - 起飞位',
  '再现检查',
  '气象雷达 - 调定',
  '清空ENG和SYS',
  '滑行前检查单'
]
</script>

# 标准除冰程序

- 适用于滑行至除冰位的发动机关车或慢车除冰

## 初始滑行前准备

::: note
当需要发动机关车除冰时，或不确定是否关车除冰：

- 保持 APU 发电机接通
- 保持 APU 接通

:::

<MyChecklistItemGroup  :items="beforeInitialTaxiItems" />

## 到达除冰坪

### 如果发动机关车除冰

<MyChecklistItemGroup  :items="engineOffDeicingItems" />

### 如果发动机慢车除冰

<MyChecklistItemGroup  :items="engineIdleDeicingItems" />

## 发动机关车除冰后

<MyChecklistItemGroup  :items="afterEngineOffDeicingItems" />

## 发动机慢车除冰后

<MyChecklistItemGroup  :items="afterEngineIdleDeicingItems" />

---

<ResetAllButton />
