import type { Checklist, ChecklistNote, ChecklistSection } from '../types/checklist'
import { DEFAULT_EXPIRY_HOURS } from '../utils/checklists'
import beforeFlightDaySource from './checklists-source/before-flight-day.md?raw'
import beforeFlightGoingSource from './checklists-source/before-flight-going.md?raw'
import beforeSleepSource from './checklists-source/before-sleep.md?raw'
import firstLegSource from './checklists-source/first-leg.md?raw'
import nextLegsSource from './checklists-source/next-legs.md?raw'
import leavingAircraftSource from './checklists-source/leaving-the-aircraft.md?raw'
import b737DeicingEnSource from './checklists-source/b737-deicing-en.md?raw'
import b737DeicingZhSource from './checklists-source/b737-deicing-zh.md?raw'

type GroupInput = [string, string[]]

function section(checklistId: string, index: number, title: string, titles: string[]): ChecklistSection {
  const sectionId = `${checklistId}-section-${index}`
  return {
    id: sectionId,
    title,
    items: titles.map((itemTitle, itemIndex) => ({
      id: `${sectionId}-item-${itemIndex + 1}`,
      title: itemTitle,
      detail: '',
      expiresAfterHours: DEFAULT_EXPIRY_HOURS,
    })),
  }
}

function checklist(id: string, title: string, description: string, groups: GroupInput[], notes: ChecklistNote[] = []): Checklist {
  return {
    id,
    title,
    description,
    source: 'builtin',
    sections: groups.map(([groupTitle, items], index) => section(id, index + 1, groupTitle, items)),
    notes,
  }
}

const builtinChecklistsData: Checklist[] = [
  checklist('before-flight-day', 'A Day Before', '', [
    ['Morning', ['Online Preparation', 'NOTAM', 'Download Relevant Files for Airborne Review', 'EFB Data Update', "Crew Members' Status", 'Clothing Requirements']],
    ['Charging', ['Recorder Data Output', 'Recorder Charging', 'IPad Charging', 'Flashlight Charging', 'Charging']],
    ['Items', ['Pilot Hat', 'Sunglasses', 'Pen', 'Charger', 'Reflective Vest', 'Flashlight', 'Aviation Headphones', 'Voice Recorder', 'Boarding Pass', 'Mouthwash', 'Lens Wipes', 'Dental Floss (牙线)', 'Vitamins', 'Thermos Cup', 'Earplugs', 'Lip Balm', 'Humidifier', 'Eye Mask', 'Casual Clothes', 'U-shaped Pillow', 'Razor', 'Lens Cleaning Paper', 'Shoes', 'Socks', 'Medicine', 'Insect Repellent', 'Adapter Plug', 'Pocket 3', 'Credit Card', 'Power Bank']],
  ]),

  checklist('before-sleep', 'Before Sleep', '', [
    ['Before Sleep', ['Water Bottle', 'Water Heater', 'Stuff for Flight', 'Alarm Clock', 'Data Update', 'Prep Site', 'Learning Site', 'Quit Unnecessary Chats', 'Medicine', 'Vitamins', 'Air Purifier', 'Air Conditioner', 'Ceiling Fan', 'Mosquito repellent device', 'Water Flosser', 'Tooth Brushed', 'Bath', 'Water', 'Mouth Wash', 'Skin Medicine', 'Charging', 'Do Not Disturb', 'Lip Care', 'Face Care', 'Unite']],
  ]),

  checklist('before-flight-going', 'Before Flight', '', [
    ['住公寓前', ['Alarm Clock', 'Water', 'Vitamins', 'Dental Flosser', 'Toothbrush', 'Skin Medicine', 'Shaving', 'Face Care']],
    ['物品', ['IPAD', '充电器', '手电筒', '录音笔', '登机牌']],
    ['物品', ['充电宝', 'Pocket 3']],
    ['物品（可提前）', ['墨镜', '笔', '反光背心', '航空耳机', '帽子']],
    ['证照（可提前）', ['执照', '体检', '应急', '危险品']],
    ['箱内（可提前）', ['漱口水', '擦镜纸', '牙线', '热水杯', '耳塞', '唇膏', '加湿器', '眼罩', '擦镜纸']],
    ['冬季（可提前）', ['手套', '耳罩', '暖宝宝']],
    ['长航线（可提前）', ['便装', 'U 形枕']],
    ['住公寓 (1/3)', ['药', '维生素', '冲牙器', '剃须刀']],
    ['过夜 (2/3)（可提前）', ['鞋', '袜', '维生素', '便装', '药', '驱蚊用品', '转换插头', 'Pocket 3', '信用卡', '充电宝', '冲牙器']],
    ['备份 (3/3)（可提前）', ['白背心', '衬衫', '肩章', '领带', '外套', '大衣', '腰带', '西裤', '皮鞋', '袜子']],
    ['着装', ['手表', '帽子', '领带夹', '胸章', '肩章', '腰带']],
    ['随身', ['手机', '笔', '身份证', '登机牌', '员工卡']],
    ['Double Check', ['IPad', '帽子', '登机牌', '充电器', '反光背心', '手电筒', '外套/大衣']],
    ['最后', ['口罩', '钥匙', '过夜袋', '皮鞋']],
  ]),

  checklist('first-leg', 'First Leg', '', [
    ['Airplane Status', ['Jacket', 'Pins and Covers @ External', 'Pins and Covers @ Onboard', 'External Lights', 'Aircraft Certificates', 'TLB Faults', 'Deferred Defects', 'Emergency Equipments', 'Circuit Breakers', 'Printer Paper', 'Voice Recorder Charging', 'Cockpit Cross-Check', 'Speed Trim Fail', 'Oxygen Mask', 'Fuel System', 'Hydraulic System', 'A/P', 'Recall Check', 'Windshield Wipers', 'Comms & HF Test', 'WXR / TCAS', 'Flight Number', 'QFE', 'NAV OPTIONS', 'A/T', 'Systems Reset', 'Route', 'Special Procedures/Areas', 'Alternate', 'Jepp Route']],
    ['Before Doors Closing', ['TLB Maintenance Work Completed', 'Passports', 'Total = Plan', 'L = R', 'Remaining + Added = Total', 'Fuel Sheet Uploaded', 'Flight Plan Updated', 'Flight Plan - Signed', 'Load Sheet - Signed', 'Load Sheet - Leg Verified', 'Load Sheet - Fuel Quantity', 'Load Sheet - Occupants / Crew', 'TLB Maintenance Work Completed', 'All Logbooks In Cockpit', 'All Logbooks Have Sufficient Pages']],
    ['Before Start', ['Fuel Transfer', 'Recirculation Fan', 'Windshield Heater', 'Ground Facilities', 'EOSID', 'Comms', 'Voice Recorder', 'Verify Departure Clearance', 'Lateral Mode', 'Initial Altitude', 'Heading', 'Tug', 'CDU Check', 'Trim', 'Takeoff Data', 'Route', 'Comms', 'Voice Recorder']],
  ]),

  checklist('next-legs', 'Next Legs', '', [
    ['Before Exterior Inspection', ['IRS alignment', 'Logbook', 'Voice Recorder Charging', 'Devices Charging']],
    ['Procedures', ['Flight Number', 'Time Summary', 'Performance Calculation', 'NOTAM', 'Cockpit Cross-Check', 'QFE', 'NAV OPTIONS', 'Route', 'Special Procedures/Areas', 'Alternate', 'Flight Director', 'Jepp Route']],
    ['Before Doors Closing', ['TLB Maintenance Work Completed', 'Passport', 'Total = Plan', 'L = R', 'Remaining + Added = Total', 'Fuel Sheet Uploaded', 'Flight Plan - Info Correct', 'Flight Plan - Signed', 'Load Sheet - Signed', 'Load Sheet - Leg Verified', 'Load Sheet - Fuel Quantity', 'Load Sheet - Occupants / Crew', 'TLB Maintenance Work Completed', 'All Logbooks In Cockpit']],
    ['Before Start', ['Fuel Transfer', 'Recirculation Fan', 'Windshield Heater', 'Ground Facilities', 'EOSID', 'Comms', 'Voice Recorder', 'Verify Departure Clearance', 'Lateral Mode', 'Initial Altitude', 'Heading', 'Tug', 'CDU Check', 'Trim', 'Takeoff Data', 'Route', 'Comms', 'Voice Recorder']],
  ]),

  checklist('leaving-aircraft', 'Leaving the Aircraft', '', [
    ['Procedures', ['Parking Brake', 'Logbook', 'Headset', 'Voice Recorder', 'Comms', 'Time Log', 'TLB', 'Carbon Work', 'Charger', 'iPad', 'Tidy up', 'Mission Certificate', 'Passports', 'Secure Procedure', 'Pumps', 'Cockpit Door', 'Luggage']],
  ]),

  checklist('b737-deicing-en', '737 Deicing Procedures (English)', 'Applicable for engine-off or engine-idle deicing after taxiing to a remote de-icing pad.', [
    ['Before Initial Taxi', ['GENERATOR 1 & 2 - ON', 'GEN OFF BUS lights - Verify OFF', 'APU GENERATOR - As Needed', 'Probe Heat - On', 'Engine Start Switches - CONT', 'ENGINE ANTI-ICE - As Needed', 'ISOLATION VALVE - AUTO', 'All BLEED Switches - OFF', 'APU Switch - As Needed', 'Ground Personnel & Equipment - Clear', 'Recall - Check']],
    ['For Engine-Off Deicing', ['APU GENERATOR - Verify ON', 'ENGINE ANTI-ICE - OFF', 'ENGINE START switches - OFF', 'ENGINE START LEVER - CUTOFF']],
    ['For Engine-Idle Deicing', ['ENGINE GENERATORS - ON', 'APU - OFF']],
    ['After Engine-Off Deicing', ['Timer - 60 seconds', 'BEFORE START Checklist?', '(AFTER 60 SEC) ENGINE BLEED - ON', 'APU BLEED - ON', 'DUAL BLEED - Verify Illuminated', 'Packs - OFF', 'Ground Personnel & Equipment - Clear', 'Engines - Start', 'BEFORE TAXI Procedures (with flaps check)']],
    ['After Engine-Idle Deicing', ['Ground Personnel & Equipment - Clear', 'Timer - 60 seconds', 'ANTI-COLLISION LIGHT - Verify ON', 'FLAPS 40 - GREEN', 'FLIGHT CONTROLS - CHECK', 'FLAPS - VERIFY 40 GREEN LIGHT', 'FLAPS - UP', 'ENGINE ANTI-ICE - AS NEEDED', '(AFTER 60 SEC) ENGINE BLEEDs - ON', 'PACKS - AUTO', 'FLAPS - TAKEOFF POSITION', 'RECALL - CHECK', 'WEATHER RADAR - SET', 'ENG AND SYS - CLEAR', 'BEFORE-TAXI CHECKLIST']],
  ]),

  checklist('b737-deicing-zh', '737 Deicing Procedures (Chinese)', '适用于滑行至除冰位的发动机关车或慢车除冰。', [
    ['初始滑行前准备', ['发电机 - ON', 'GEN OFF BUS 灯 - 灭', 'APU发电机 - 按需', '探头加温 - ON', '发动机起动电门 - 连续', '发动机防冰 - 按需', '隔离活门 - 自动', '所有引气 - OFF', 'APU - 按需', '地面人员设备 - 移开', '再现 - 检查']],
    ['如果发动机关车除冰', ['APU发电机 - 确认接通', '发动机防冰 - OFF', '发动机起动电门 - OFF', '发动机起动手柄 - CUTOFF']],
    ['如果发动机慢车除冰', ['发动机发电机 - 接通', 'APU - OFF']],
    ['发动机关车除冰后', ['计时器 - 60秒', '起动前检查单', '(60秒后) 发动机引气 - ON', 'APU引气 - ON', '双引气灯 - 亮', '空调组件 - OFF', '地面人员设备 - 移开', '发动机 - 起动', '滑行前程序（含襟翼全行程检查）']],
    ['发动机慢车除冰后', ['地面人员设备 - 移开', '计时器 - 60秒', '防撞灯 - 确认接通', '襟翼40 - 绿灯', '飞行操纵检查', '襟翼40绿灯后收上', '发动机防冰 - 按需', '（60秒后）发动机引气 - ON', '空调组件 - AUTO', '襟翼 - 起飞位', '再现检查', '气象雷达 - 调定', '清空ENG和SYS', '滑行前检查单']],
  ]),
]

const sourceMarkdownById: Record<string, string> = {
  'before-flight-day': beforeFlightDaySource,
  'before-sleep': beforeSleepSource,
  'before-flight-going': beforeFlightGoingSource,
  'first-leg': firstLegSource,
  'next-legs': nextLegsSource,
  'leaving-aircraft': leavingAircraftSource,
  'b737-deicing-en': b737DeicingEnSource,
  'b737-deicing-zh': b737DeicingZhSource,
}

export const builtinChecklists: Checklist[] = builtinChecklistsData.map((item) => ({
  ...item,
  sourceMarkdown: sourceMarkdownById[item.id],
}))
