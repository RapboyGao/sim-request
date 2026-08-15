import { b737DeicingEnChecklist } from "./checklist-pages/b737-deicing-en";
import { b737DeicingZhChecklist } from "./checklist-pages/b737-deicing-zh";
import type { Checklist } from "~/types/checklist";

type PublicDeicingSection = { title: string; items: string[] };
type PublicDeicingLabels = {
  title: string;
  description: string;
  noteTitle: string;
  note: string;
  sections: PublicDeicingSection[];
};

const englishSections: PublicDeicingSection[] = [
  {
    title: "1. Before Taxi Procedure",
    items: [
      "GENERATOR ...... ON",
      "GEN OFF BUS lights ...... Verify OFF",
      "If engine shutdown is possible: APU generator ...... ON",
      "Probe heat ...... ON",
      "Engine start switches ...... CONT",
      "Engine anti-ice ...... As required",
      "Isolation valve ...... AUTO",
      "All bleeds ...... OFF",
      "If engine-idle deicing is confirmed: APU ...... OFF",
      "Ground personnel / equipment ...... Clear",
      "Recall ...... Check",
      "ENG/SYS ...... Check and clear",
    ],
  },
  { title: "2. Approaching De-icing Pad", items: ["All bleeds ...... OFF"] },
  {
    title: "3a. At De-icing Pad - Engine-Off Deicing",
    items: [
      "All bleeds ...... OFF",
      "APU generator ...... ON",
      "Engine start switches ...... OFF",
      "Engine start levers ...... CUTOFF",
      "(Ready for deicing)",
      "Engine anti-ice ...... OFF",
      "Isolation valve ...... OPEN",
    ],
  },
  { title: "3b. At De-icing Pad - Engine-Idle Deicing", items: ["All bleeds ...... OFF", "(Ready for deicing)", "Engine generators ...... ON", "APU ...... OFF"] },
  {
    title: "4a. After Engine-Off Deicing",
    items: [
      "Timer ...... 60 seconds",
      "Anti-collision light ...... ON",
      "Before start checklist ...... Complete",
      "After at least 60 seconds",
      "Engine bleeds ...... ON",
      "APU bleed ...... ON",
      "DUAL BLEED light ...... Illuminated",
      "Packs ...... OFF",
      "Ground personnel / equipment ...... Clear",
      "Engines ...... Start",
      "Before taxi procedure and checklist (including Flaps 40 - UP - Takeoff flaps) ...... Complete",
    ],
  },
  {
    title: "4b. After Engine-Idle Deicing",
    items: [
      "Ground personnel / equipment ...... Clear",
      "Timing ...... 60 seconds",
      "Anti-collision light ...... ON",
      "Flaps ...... 40°",
      "Engine anti-ice ...... As required",
      "Flight controls ...... Check",
      "After the Flaps 40 green light",
      "Flaps ...... UP",
      "After at least 60 seconds",
      "Engine bleeds ...... ON",
      "Packs ...... AUTO",
      "After the flaps-up light is out",
      "Flaps ...... Takeoff flaps",
      "Recall ...... Check",
      "Weather radar ...... Set",
      "ENG/SYS ...... Check and clear",
      "Before taxi checklist ...... Complete",
    ],
  },
];

const chineseSections: PublicDeicingSection[] = [
  {
    title: "1. 滑行前程序",
    items: [
      "发电机 ...... ON",
      "GEN OFF BUS 灯 ...... 灭",
      "如可能关车: APU 发电机 ...... ON",
      "探头加温 ...... ON",
      "发动机起动电门 ...... 连续",
      "发动机防冰 ...... 按需",
      "隔离活门 ...... AUTO",
      "所有引气 ...... OFF",
      "如确认慢车除冰: APU ...... OFF",
      "地面人员／设备 ...... 移开",
      "再现 ...... 检查",
      "ENG/SYS ...... 检查并清空",
    ],
  },
  { title: "2. 即将到达除冰位", items: ["所有引气 ...... OFF"] },
  {
    title: "3a. 如关车除冰",
    items: ["所有引气 ...... OFF", "APU 发电机 ...... ON", "发动机起动电门 ...... OFF", "发动机起动手柄 ...... CUTOFF", "(已准备好除冰)", "发动机防冰 ...... OFF", "隔离活门 ...... OPEN"],
  },
  { title: "3b. 如慢车除冰", items: ["所有引气 ...... OFF", "(已准备好除冰)", "发动机发电机 ...... 接通", "APU ...... OFF"] },
  {
    title: "4a. 发动机关车除冰后",
    items: [
      "计时器 ...... 60 秒",
      "防撞灯 ...... ON",
      "起动前检查单 ...... 完成",
      "至少60秒后",
      "发动机引气 ...... ON",
      "APU 引气 ...... ON",
      "双引气灯（Dual Bleed） ...... 亮",
      "组件（Packs） ...... OFF",
      "地面人员／设备 ...... 移开",
      "发动机 ...... 起动",
      "滑行前程序和检查单（其中襟翼40-UP-起飞襟翼） ...... 完成",
    ],
  },
  {
    title: "4b. 发动机慢车除冰后",
    items: [
      "地面人员／设备 ...... 移开",
      "计时 ...... 60 秒",
      "防撞灯 ...... ON",
      "襟翼 - 40°",
      "发动机防冰 ...... 按需",
      "操纵 ...... 检查",
      "襟翼40绿灯后",
      "襟翼 ...... UP",
      "至少60秒后",
      "发动机引气 ...... ON",
      "空调组件（Packs） ...... AUTO",
      "襟翼收上无灯后",
      "襟翼 ...... 起飞襟翼",
      "再现 ...... 检查",
      "气象雷达 ...... 调定",
      "ENG/SYS ...... 检查并清空",
      "滑行前检查单 ...... 完成",
    ],
  },
];

const labels: Record<string, PublicDeicingLabels> = {
  en: {
    title: "737 Deicing Procedures",
    description: "Applicable for engine-off or engine-idle deicing after taxiing to a de-icing pad.",
    noteTitle: "APU Note",
    note: "CAUTION: When engine-off deicing is required, or when unsure whether to shut down for deicing:\n\n- Keep APU generator ON.\n- Keep APU ON.",
    sections: englishSections,
  },
  "zh-CN": {
    title: "737 除冰程序",
    description: "适用于滑行至除冰位后进行的发动机关车或慢车除冰。",
    noteTitle: "APU 说明",
    note: "注意当需要发动机关车除冰，或不确定是否关车除冰：\n\n- 保持 APU 发电机接通。\n- 保持 APU 接通。",
    sections: chineseSections,
  },
  ja: {
    title: "737 除氷手順",
    description: "除氷パッドまでタキシングした後に行う、エンジン停止またはアイドル状態での除氷に適用します。",
    noteTitle: "APU の注意事項",
    note: "注意：エンジン停止除氷が必要な場合、またはエンジンを停止して除氷するか不明な場合：\n\n- APU 発電機を ON に保持する。\n- APU を ON に保持する。",
    sections: [
      {
        title: "1. タキシング前手順",
        items: [
          "発電機 ...... ON",
          "GEN OFF BUS ライト ...... 消灯を確認",
          "エンジン停止の可能性がある場合：APU 発電機 ...... ON",
          "プローブヒート ...... ON",
          "エンジン始動スイッチ ...... CONT",
          "エンジン防氷 ...... 必要に応じて",
          "アイソレーションバルブ ...... AUTO",
          "すべてのブリード ...... OFF",
          "アイドル除氷が確定した場合：APU ...... OFF",
          "地上要員／機材 ...... クリア",
          "リコール ...... 確認",
          "ENG/SYS ...... 確認してクリア",
        ],
      },
      { title: "2. 除氷パッド接近時", items: ["すべてのブリード ...... OFF"] },
      {
        title: "3a. 除氷パッド到着時 - エンジン停止除氷",
        items: [
          "すべてのブリード ...... OFF",
          "APU 発電機 ...... ON",
          "エンジン始動スイッチ ...... OFF",
          "エンジン始動レバー ...... CUTOFF",
          "（除氷準備完了）",
          "エンジン防氷 ...... OFF",
          "アイソレーションバルブ ...... OPEN",
        ],
      },
      { title: "3b. 除氷パッド到着時 - エンジンアイドル除氷", items: ["すべてのブリード ...... OFF", "（除氷準備完了）", "エンジン発電機 ...... ON", "APU ...... OFF"] },
      {
        title: "4a. エンジン停止除氷後",
        items: [
          "タイマー ...... 60 秒",
          "アンチコリジョンライト ...... ON",
          "始動前チェックリスト ...... 完了",
          "少なくとも 60 秒経過後",
          "エンジンブリード ...... ON",
          "APU ブリード ...... ON",
          "DUAL BLEED ライト ...... 点灯",
          "パック ...... OFF",
          "地上要員／機材 ...... クリア",
          "エンジン ...... 始動",
          "タキシング前手順およびチェックリスト（フラップ 40 - UP - 離陸フラップを含む） ...... 完了",
        ],
      },
      {
        title: "4b. エンジンアイドル除氷後",
        items: [
          "地上要員／機材 ...... クリア",
          "計時 ...... 60 秒",
          "アンチコリジョンライト ...... ON",
          "フラップ ...... 40°",
          "エンジン防氷 ...... 必要に応じて",
          "操縦系統 ...... 確認",
          "フラップ 40 緑色ライト後",
          "フラップ ...... UP",
          "少なくとも 60 秒経過後",
          "エンジンブリード ...... ON",
          "パック ...... AUTO",
          "フラップアップライト消灯後",
          "フラップ ...... 離陸フラップ",
          "リコール ...... 確認",
          "気象レーダー ...... セット",
          "ENG/SYS ...... 確認してクリア",
          "タキシング前チェックリスト ...... 完了",
        ],
      },
    ],
  },
  ko: {
    title: "737 제빙 절차",
    description: "제빙 패드까지 택시한 후 엔진 정지 또는 공회전 상태로 제빙할 때 적용합니다.",
    noteTitle: "APU 주의사항",
    note: "주의: 엔진 정지 제빙이 필요하거나 엔진을 정지하고 제빙할지 확실하지 않은 경우:\n\n- APU 발전기를 ON 상태로 유지합니다.\n- APU를 ON 상태로 유지합니다.",
    sections: [
      {
        title: "1. 택시 전 절차",
        items: [
          "발전기 ...... ON",
          "GEN OFF BUS 등 ...... 소등 확인",
          "엔진 정지 가능 시: APU 발전기 ...... ON",
          "프로브 히트 ...... ON",
          "엔진 시동 스위치 ...... CONT",
          "엔진 방빙 ...... 필요 시",
          "아이솔레이션 밸브 ...... AUTO",
          "모든 블리드 ...... OFF",
          "엔진 공회전 제빙이 확정된 경우: APU ...... OFF",
          "지상 인원／장비 ...... 이동",
          "리콜 ...... 확인",
          "ENG/SYS ...... 확인 및 클리어",
        ],
      },
      { title: "2. 제빙 패드 접근 시", items: ["모든 블리드 ...... OFF"] },
      {
        title: "3a. 제빙 패드 도착 - 엔진 정지 제빙",
        items: [
          "모든 블리드 ...... OFF",
          "APU 발전기 ...... ON",
          "엔진 시동 스위치 ...... OFF",
          "엔진 시동 레버 ...... CUTOFF",
          "(제빙 준비 완료)",
          "엔진 방빙 ...... OFF",
          "아이솔레이션 밸브 ...... OPEN",
        ],
      },
      { title: "3b. 제빙 패드 도착 - 엔진 공회전 제빙", items: ["모든 블리드 ...... OFF", "(제빙 준비 완료)", "엔진 발전기 ...... ON", "APU ...... OFF"] },
      {
        title: "4a. 엔진 정지 제빙 후",
        items: [
          "타이머 ...... 60초",
          "충돌방지등 ...... ON",
          "시동 전 체크리스트 ...... 완료",
          "최소 60초 후",
          "엔진 블리드 ...... ON",
          "APU 블리드 ...... ON",
          "DUAL BLEED 등 ...... 점등",
          "팩 ...... OFF",
          "지상 인원／장비 ...... 이동",
          "엔진 ...... 시동",
          "택시 전 절차 및 체크리스트（Flaps 40 - UP - Takeoff flaps 포함） ...... 완료",
        ],
      },
      {
        title: "4b. 엔진 공회전 제빙 후",
        items: [
          "지상 인원／장비 ...... 이동",
          "시간 측정 ...... 60초",
          "충돌방지등 ...... ON",
          "플랩 ...... 40°",
          "엔진 방빙 ...... 필요 시",
          "비행 조종면 ...... 확인",
          "Flaps 40 녹색등 후",
          "플랩 ...... UP",
          "최소 60초 후",
          "엔진 블리드 ...... ON",
          "팩 ...... AUTO",
          "플랩 업 등 소등 후",
          "플랩 ...... 이륙 플랩",
          "리콜 ...... 확인",
          "기상 레이더 ...... 설정",
          "ENG/SYS ...... 확인 및 클리어",
          "택시 전 체크리스트 ...... 완료",
        ],
      },
    ],
  },
  fr: {
    title: "Procédures de dégivrage du 737",
    description: "S’applique au dégivrage moteur arrêté ou au ralenti après le roulage jusqu’à une aire de dégivrage.",
    noteTitle: "Note APU",
    note: "ATTENTION : lorsque le dégivrage moteur arrêté est requis, ou en cas de doute sur l’arrêt moteur pour le dégivrage :\n\n- Maintenir le générateur APU sur ON.\n- Maintenir l’APU sur ON.",
    sections: [
      {
        title: "1. Procédure avant roulage",
        items: [
          "GÉNÉRATEUR ...... ON",
          "Voyants GEN OFF BUS ...... Vérifier éteints",
          "Si l’arrêt moteur est possible : générateur APU ...... ON",
          "Chauffage des sondes ...... ON",
          "Interrupteurs de démarrage moteur ...... CONT",
          "Antigivrage moteur ...... Selon besoin",
          "Vanne d’isolement ...... AUTO",
          "Toutes les purges ...... OFF",
          "Si le dégivrage au ralenti est confirmé : APU ...... OFF",
          "Personnel / matériel au sol ...... Dégagés",
          "Recall ...... Vérifier",
          "ENG/SYS ...... Vérifier et effacer",
        ],
      },
      { title: "2. À l’approche de l’aire de dégivrage", items: ["Toutes les purges ...... OFF"] },
      {
        title: "3a. Sur l’aire - dégivrage moteur arrêté",
        items: [
          "Toutes les purges ...... OFF",
          "Générateur APU ...... ON",
          "Interrupteurs de démarrage moteur ...... OFF",
          "Manettes de démarrage moteur ...... CUTOFF",
          "(Prêt pour le dégivrage)",
          "Antigivrage moteur ...... OFF",
          "Vanne d’isolement ...... OPEN",
        ],
      },
      { title: "3b. Sur l’aire - dégivrage moteur au ralenti", items: ["Toutes les purges ...... OFF", "(Prêt pour le dégivrage)", "Générateurs moteur ...... ON", "APU ...... OFF"] },
      {
        title: "4a. Après dégivrage moteur arrêté",
        items: [
          "Minuterie ...... 60 secondes",
          "Feu anticollision ...... ON",
          "Checklist avant démarrage ...... Terminée",
          "Après au moins 60 secondes",
          "Purges moteur ...... ON",
          "Purge APU ...... ON",
          "Voyant DUAL BLEED ...... Allumé",
          "Packs ...... OFF",
          "Personnel / matériel au sol ...... Dégagés",
          "Moteurs ...... Démarrer",
          "Procédure et checklist avant roulage (y compris volets 40 - UP - volets de décollage) ...... Terminées",
        ],
      },
      {
        title: "4b. Après dégivrage moteur au ralenti",
        items: [
          "Personnel / matériel au sol ...... Dégagés",
          "Chronométrage ...... 60 secondes",
          "Feu anticollision ...... ON",
          "Volets ...... 40°",
          "Antigivrage moteur ...... Selon besoin",
          "Commandes de vol ...... Vérifier",
          "Après le voyant vert des volets 40",
          "Volets ...... UP",
          "Après au moins 60 secondes",
          "Purges moteur ...... ON",
          "Packs ...... AUTO",
          "Après extinction du voyant volets rentrés",
          "Volets ...... Volets de décollage",
          "Recall ...... Vérifier",
          "Radar météo ...... Régler",
          "ENG/SYS ...... Vérifier et effacer",
          "Checklist avant roulage ...... Terminée",
        ],
      },
    ],
  },
};

const afterDeicingLabels: Record<string, string> = {
  en: "After deicing",
  "zh-CN": "除冰完成后",
  ja: "除氷完了後",
  ko: "제빙 완료 후",
  fr: "Après le dégivrage",
};

function mergedPublicSections(selected: PublicDeicingLabels, locale: string) {
  if (selected.sections.length < 6) return selected.sections;
  const afterDeicing = afterDeicingLabels[locale] || afterDeicingLabels.en;
  return [
    selected.sections[0]!,
    selected.sections[1]!,
    {
      ...selected.sections[2]!,
      items: [...selected.sections[2]!.items, afterDeicing, ...selected.sections[4]!.items],
    },
    {
      ...selected.sections[3]!,
      items: [...selected.sections[3]!.items, afterDeicing, ...selected.sections[5]!.items],
    },
  ];
}

export function publicDeicingChecklist(locale: string): { checklist: Checklist; noteTitle: string; note: string } {
  const selected = labels[locale] || labels.en!;
  const source = locale === "zh-CN" ? b737DeicingZhChecklist : b737DeicingEnChecklist;
  const localizedSections = mergedPublicSections(selected, locale);
  return {
    checklist: {
      ...source,
      id: `public-${source.id}`,
      title: selected.title,
      description: selected.description,
      sections: source.sections.map((section, sectionIndex) => ({
        ...section,
        title: localizedSections[sectionIndex]?.title || section.title,
        items: section.items.map((item, itemIndex) => ({
          ...item,
          title: localizedSections[sectionIndex]?.items[itemIndex] || item.title,
        })),
      })),
    },
    noteTitle: selected.noteTitle,
    note: selected.note,
  };
}
