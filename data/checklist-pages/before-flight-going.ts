import { beforeFlightGoingSource as sourceMarkdown } from "../checklist-source-documents";
import { createBuiltinChecklist } from "./_factory";

const item = (id: string, title: string) => ({ id: `before-flight-going.${id}`, title });

export const beforeFlightGoingChecklist = createBuiltinChecklist(
  "before-flight-going",
  "Before Flight",
  "",
  [
    {
      id: "before-flight-going.apartment",
      title: "住公寓前",
      items: [
        item("apartment.alarm-clock", "Alarm Clock"),
        item("apartment.water", "Water"),
        item("apartment.vitamins", "Vitamins"),
        item("apartment.dental-flosser", "Dental Flosser"),
        item("apartment.toothbrush", "Toothbrush"),
        item("apartment.skin-medicine", "Skin Medicine"),
        item("apartment.shaving", "Shaving"),
        item("apartment.face-care", "Face Care"),
      ],
    },
    {
      id: "before-flight-going.flight-status",
      title: "航班状态",
      items: [item("flight-status.delayed", "延误/取消.....检查"), item("flight-status.send", "准备时间.....发送")],
    },
    {
      id: "before-flight-going.items",
      title: "物品",
      items: [item("items.ipad", "IPAD"), item("items.charger", "充电器"), item("items.flashlight", "手电筒"), item("items.recorder", "录音笔"), item("items.boarding-pass", "登机牌")],
    },
    { id: "before-flight-going.power", title: "物品", items: [item("power.power-bank", "充电宝"), item("power.pocket-3", "Pocket 3")] },
    {
      id: "before-flight-going.optional-items",
      title: "物品（可提前）",
      items: [
        item("optional-items.sunglasses", "墨镜"),
        item("optional-items.pen", "笔"),
        item("optional-items.reflective-vest", "反光背心"),
        item("optional-items.headset", "航空耳机"),
        item("optional-items.hat", "帽子"),
      ],
    },
    {
      id: "before-flight-going.documents",
      title: "证照（可提前）",
      items: [item("documents.license", "执照"), item("documents.medical", "体检"), item("documents.emergency", "应急"), item("documents.dangerous-goods", "危险品")],
    },
    {
      id: "before-flight-going.cabin-bag",
      title: "箱内（可提前）",
      items: [
        item("cabin-bag.mouthwash", "漱口水"),
        item("cabin-bag.lens-paper", "擦镜纸"),
        item("cabin-bag.dental-floss", "牙线"),
        item("cabin-bag.thermos", "热水杯"),
        item("cabin-bag.earplugs", "耳塞"),
        item("cabin-bag.lip-care", "唇膏"),
        item("cabin-bag.humidifier", "加湿器"),
        item("cabin-bag.eye-mask", "眼罩"),
        item("cabin-bag.lens-paper-2", "擦镜纸"),
      ],
    },
    { id: "before-flight-going.winter", title: "冬季（可提前）", items: [item("winter.gloves", "手套"), item("winter.earmuffs", "耳罩"), item("winter.hand-warmer", "暖宝宝")] },
    { id: "before-flight-going.long-haul", title: "长航线（可提前）", items: [item("long-haul.casual-clothes", "便装"), item("long-haul.u-pillow", "U 形枕"), item("long-haul.eye-mask", "眼罩")] },
    {
      id: "before-flight-going.apartment-bag",
      title: "住公寓 (1/3)",
      items: [item("apartment-bag.medicine", "药"), item("apartment-bag.vitamins", "维生素"), item("apartment-bag.water-flosser", "冲牙器"), item("apartment-bag.shaver", "剃须刀")],
    },
    {
      id: "before-flight-going.overnight",
      title: "过夜 (2/3)（可提前）",
      items: [
        item("overnight.shoes", "鞋"),
        item("overnight.socks", "袜"),
        item("overnight.vitamins", "维生素"),
        item("overnight.casual-clothes", "便装"),
        item("overnight.medicine", "药"),
        item("overnight.mosquito-repellent", "驱蚊用品"),
        item("overnight.adapter", "转换插头"),
        item("overnight.pocket-3", "Pocket 3"),
        item("overnight.credit-card", "信用卡"),
        item("overnight.power-bank", "充电宝"),
        item("overnight.water-flosser", "冲牙器"),
      ],
    },
    {
      id: "before-flight-going.backup",
      title: "备份 (3/3)（可提前）",
      items: [
        item("backup.white-vest", "白背心"),
        item("backup.shirt", "衬衫"),
        item("backup.epaulettes", "肩章"),
        item("backup.tie", "领带"),
        item("backup.coat", "外套"),
        item("backup.overcoat", "大衣"),
        item("backup.belt", "腰带"),
        item("backup.trousers", "西裤"),
        item("backup.shoes", "皮鞋"),
        item("backup.socks", "袜子"),
      ],
    },
    {
      id: "before-flight-going.dress",
      title: "着装",
      items: [item("dress.watch", "手表"), item("dress.hat", "帽子"), item("dress.tie-clip", "领带夹"), item("dress.badge", "胸章"), item("dress.epaulettes", "肩章"), item("dress.belt", "腰带")],
    },
    {
      id: "before-flight-going.carry-on",
      title: "随身",
      items: [item("carry-on.phone", "手机"), item("carry-on.pen", "笔"), item("carry-on.id", "身份证"), item("carry-on.boarding-pass", "登机牌"), item("carry-on.staff-card", "员工卡")],
    },
    {
      id: "before-flight-going.double-check",
      title: "Double Check",
      items: [
        item("double-check.ipad", "IPad"),
        item("double-check.hat", "帽子"),
        item("double-check.boarding-pass", "登机牌"),
        item("double-check.charger", "充电器"),
        item("double-check.vest", "反光背心"),
        item("double-check.flashlight", "手电筒"),
        item("double-check.outerwear", "外套/大衣"),
      ],
    },
    { id: "before-flight-going.final", title: "最后", items: [item("final.mask", "口罩"), item("final.keys", "钥匙"), item("final.overnight-bag", "过夜袋"), item("final.shoes", "皮鞋")] },
  ],
  sourceMarkdown,
);
