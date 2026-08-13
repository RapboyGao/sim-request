import sourceMarkdown from '../checklists-source/before-flight-going.md?raw'
import { createBuiltinChecklist } from './_factory'

export const beforeFlightGoingChecklist = createBuiltinChecklist('before-flight-going', 'Before Flight', '', [
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
], sourceMarkdown)
