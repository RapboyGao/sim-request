import { createBuiltinChecklist, type BuiltinSectionInput } from './checklist-factory'
import type { Checklist } from "~/types/checklist";

type LocalizedPreflight = {
  title: string;
  sections: BuiltinSectionInput[];
};

const item = (section: string, id: string, title: string, description = "") => ({
  id: `public-preflight.${section}.${id}`,
  title,
  description,
});

const localizedContent: Record<string, LocalizedPreflight> = {
  "zh-CN": {
    title: "航前检查单",
    sections: [
      {
        id: "public-preflight.before-sleep",
        title: "睡前",
        items: [
          item("before-sleep", "alarm", "定闹钟(注意国内/国际)"),
          item("before-sleep", "prepare-net", "准备网"),
          item("before-sleep", "efb-data-update", "EFB数据更新"),
          item("before-sleep", "route-materials", "下载航线相关资料"),
          item("before-sleep", "flight-items", "飞行物品准备"),
          item("before-sleep", "ipad-charge", "iPad充电"),
          item("before-sleep", "flashlight-charge", "手电筒充电"),
          item("before-sleep", "phone-charge", "手机充电"),
          item("before-sleep", "sleep-do-not-disturb", "睡眠/勿扰模式"),
        ],
      },
      {
        id: "public-preflight.before-departure",
        title: "出发前",
        items: [
          item("before-departure", "delay-cancellation", "延误/取消 ...... 检查"),
          item("before-departure", "group-messages", "群消息 ...... 发送"),
          item("before-departure", "ipad", "iPad"),
          item("before-departure", "cap", "帽子"),
          item("before-departure", "boarding-pass", "登机牌"),
          item("before-departure", "charger", "充电器"),
          item("before-departure", "reflective-vest", "反光背心"),
          item("before-departure", "flashlight", "手电筒"),
          item("before-departure", "voice-recorder", "录音笔"),
          item("before-departure", "watch", "手表"),
          item("before-departure", "tie", "领带"),
          item("before-departure", "shoulder-boards", "肩章"),
          item("before-departure", "belt", "腰带"),
          item("before-departure", "leather-shoes", "皮鞋"),
          item("before-departure", "overnight-bag", "过夜带"),
          item("before-departure", "keys", "钥匙"),
          item("before-departure", "identity-card", "身份证"),
        ],
      },
    ],
  },
  en: {
    title: "Preflight Checklist",
    sections: [
      {
        id: "public-preflight.before-sleep",
        title: "Before Sleep",
        items: [
          item("before-sleep", "alarm", "Set alarm (domestic/international)"),
          item("before-sleep", "prepare-net", "Prepare the net"),
          item("before-sleep", "efb-data-update", "Update EFB data"),
          item("before-sleep", "route-materials", "Download route-related materials"),
          item("before-sleep", "flight-items", "Prepare flight items"),
          item("before-sleep", "ipad-charge", "Charge iPad"),
          item("before-sleep", "flashlight-charge", "Charge flashlight"),
          item("before-sleep", "phone-charge", "Charge phone"),
          item("before-sleep", "sleep-do-not-disturb", "Sleep / Do Not Disturb mode"),
        ],
      },
      {
        id: "public-preflight.before-departure",
        title: "Before Departure",
        items: [
          item("before-departure", "delay-cancellation", "Delay/cancellation ...... Check"),
          item("before-departure", "group-messages", "Group messages ...... Send"),
          item("before-departure", "ipad", "iPad"),
          item("before-departure", "cap", "Cap"),
          item("before-departure", "boarding-pass", "Boarding pass"),
          item("before-departure", "charger", "Charger"),
          item("before-departure", "reflective-vest", "Reflective vest"),
          item("before-departure", "flashlight", "Flashlight"),
          item("before-departure", "voice-recorder", "Voice recorder"),
          item("before-departure", "watch", "Watch"),
          item("before-departure", "tie", "Tie"),
          item("before-departure", "shoulder-boards", "Shoulder boards"),
          item("before-departure", "belt", "Belt"),
          item("before-departure", "leather-shoes", "Leather shoes"),
          item("before-departure", "overnight-bag", "Overnight bag"),
          item("before-departure", "keys", "Keys"),
          item("before-departure", "identity-card", "Identity card"),
        ],
      },
    ],
  },
  ja: {
    title: "出発前チェックリスト",
    sections: [
      {
        id: "public-preflight.before-sleep",
        title: "就寝前",
        items: [
          item("before-sleep", "alarm", "アラームを設定（国内線／国際線に注意）"),
          item("before-sleep", "prepare-net", "準備ネット"),
          item("before-sleep", "efb-data-update", "EFB データ更新"),
          item("before-sleep", "route-materials", "飛行経路関連資料をダウンロード"),
          item("before-sleep", "flight-items", "飛行用品を準備"),
          item("before-sleep", "ipad-charge", "iPad を充電"),
          item("before-sleep", "flashlight-charge", "懐中電灯を充電"),
          item("before-sleep", "phone-charge", "携帯電話を充電"),
          item("before-sleep", "sleep-do-not-disturb", "睡眠／おやすみモード"),
        ],
      },
      {
        id: "public-preflight.before-departure",
        title: "出発前",
        items: [
          item("before-departure", "delay-cancellation", "遅延／欠航 ...... 確認"),
          item("before-departure", "group-messages", "グループメッセージ ...... 送信"),
          item("before-departure", "ipad", "iPad"),
          item("before-departure", "cap", "帽子"),
          item("before-departure", "boarding-pass", "搭乗券"),
          item("before-departure", "charger", "充電器"),
          item("before-departure", "reflective-vest", "反射ベスト"),
          item("before-departure", "flashlight", "懐中電灯"),
          item("before-departure", "voice-recorder", "ボイスレコーダー"),
          item("before-departure", "watch", "腕時計"),
          item("before-departure", "tie", "ネクタイ"),
          item("before-departure", "shoulder-boards", "肩章"),
          item("before-departure", "belt", "ベルト"),
          item("before-departure", "leather-shoes", "革靴"),
          item("before-departure", "overnight-bag", "宿泊用品"),
          item("before-departure", "keys", "鍵"),
          item("before-departure", "identity-card", "身分証明書"),
        ],
      },
    ],
  },
  ko: {
    title: "출발 전 체크리스트",
    sections: [
      {
        id: "public-preflight.before-sleep",
        title: "취침 전",
        items: [
          item("before-sleep", "alarm", "알람 설정 (국내선/국제선 주의)"),
          item("before-sleep", "prepare-net", "준비 네트"),
          item("before-sleep", "efb-data-update", "EFB 데이터 업데이트"),
          item("before-sleep", "route-materials", "항로 관련 자료 다운로드"),
          item("before-sleep", "flight-items", "비행 물품 준비"),
          item("before-sleep", "ipad-charge", "iPad 충전"),
          item("before-sleep", "flashlight-charge", "손전등 충전"),
          item("before-sleep", "phone-charge", "휴대전화 충전"),
          item("before-sleep", "sleep-do-not-disturb", "수면/방해 금지 모드"),
        ],
      },
      {
        id: "public-preflight.before-departure",
        title: "출발 전",
        items: [
          item("before-departure", "delay-cancellation", "지연/취소 ...... 확인"),
          item("before-departure", "group-messages", "단체 메시지 ...... 발송"),
          item("before-departure", "ipad", "iPad"),
          item("before-departure", "cap", "모자"),
          item("before-departure", "boarding-pass", "탑승권"),
          item("before-departure", "charger", "충전기"),
          item("before-departure", "reflective-vest", "반사 조끼"),
          item("before-departure", "flashlight", "손전등"),
          item("before-departure", "voice-recorder", "녹음기"),
          item("before-departure", "watch", "시계"),
          item("before-departure", "tie", "넥타이"),
          item("before-departure", "shoulder-boards", "견장"),
          item("before-departure", "belt", "벨트"),
          item("before-departure", "leather-shoes", "구두"),
          item("before-departure", "overnight-bag", "숙박용 가방"),
          item("before-departure", "keys", "열쇠"),
          item("before-departure", "identity-card", "신분증"),
        ],
      },
    ],
  },
  fr: {
    title: "Checklist avant vol",
    sections: [
      {
        id: "public-preflight.before-sleep",
        title: "Avant de dormir",
        items: [
          item("before-sleep", "alarm", "Régler l’alarme (vol national/international)"),
          item("before-sleep", "prepare-net", "Préparer le filet"),
          item("before-sleep", "efb-data-update", "Mettre à jour les données EFB"),
          item("before-sleep", "route-materials", "Télécharger les documents liés à la route"),
          item("before-sleep", "flight-items", "Préparer les affaires de vol"),
          item("before-sleep", "ipad-charge", "Charger l’iPad"),
          item("before-sleep", "flashlight-charge", "Charger la lampe torche"),
          item("before-sleep", "phone-charge", "Charger le téléphone"),
          item("before-sleep", "sleep-do-not-disturb", "Mode sommeil / Ne pas déranger"),
        ],
      },
      {
        id: "public-preflight.before-departure",
        title: "Avant le départ",
        items: [
          item("before-departure", "delay-cancellation", "Retard/annulation ...... Vérifier"),
          item("before-departure", "group-messages", "Messages du groupe ...... Envoyer"),
          item("before-departure", "ipad", "iPad"),
          item("before-departure", "cap", "Casquette"),
          item("before-departure", "boarding-pass", "Carte d’embarquement"),
          item("before-departure", "charger", "Chargeur"),
          item("before-departure", "reflective-vest", "Gilet réfléchissant"),
          item("before-departure", "flashlight", "Lampe torche"),
          item("before-departure", "voice-recorder", "Enregistreur vocal"),
          item("before-departure", "watch", "Montre"),
          item("before-departure", "tie", "Cravate"),
          item("before-departure", "shoulder-boards", "Épaulettes"),
          item("before-departure", "belt", "Ceinture"),
          item("before-departure", "leather-shoes", "Chaussures en cuir"),
          item("before-departure", "overnight-bag", "Sac de nuit"),
          item("before-departure", "keys", "Clés"),
          item("before-departure", "identity-card", "Pièce d’identité"),
        ],
      },
    ],
  },
};

export function publicPreflightChecklist(locale: string): Checklist {
  const selected = localizedContent[locale] || localizedContent.en!;
  return createBuiltinChecklist("preflight", selected.title, "", selected.sections, "");
}

export const publicPreflightChecklistDefault = publicPreflightChecklist("zh-CN");
