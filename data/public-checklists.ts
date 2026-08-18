import { publicDeicingChecklist } from './public-deicing'
import { publicFirstLegChecklist } from './public-first-leg'
import { publicTurnaroundChecklist } from './public-turnaround'
import { publicPreflightChecklist } from './public-preflight'
import { createBuiltinChecklist } from './checklist-factory'
import type { Checklist } from '~/types/checklist'

const checklistId = 'no-engine-bleed-takeoff'

const itemIds = [
  'right-pack', 'isolation-valve', 'left-pack', 'engine-1-bleed', 'apu-bleed',
  'engine-2-bleed', 'engine-generators', 'probe-heat', 'start-switches', 'start-levers',
  'ground-clear', 'flaps', 'flight-controls', 'eng-sys', 'flap-position', 'recall',
  'weather-radar', 'packs', 'left-duct-pressure', 'before-taxi-checklist',
] as const

const afterTakeoffItemIds = [
  'after-engine-2-bleed', 'right-duct-pressure', 'after-apu-bleed', 'cabin-climb-rate',
  'after-engine-1-bleed', 'after-isolation-valve', 'pressurization', 'apu', 'after-takeoff-checklist',
] as const

type LocalizedItem = {
  title: string
  description?: string
}

const publicChecklistIcons: Record<string, string> = {
  deicing: 'mdi-snowflake-melt',
  'no-engine-bleed-takeoff': 'mdi-engine-off-outline',
  'first-leg': 'mdi-airplane-takeoff',
  turnaround: 'mdi-airplane-landing',
  preflight: 'mdi-airplane-check',
}

const publicDisclaimers: Record<string, string> = {
  'zh-CN': '本检查单/程序仅供参考，应以公司、飞机制造商、机场等公布的资料与飞机实际状态完成飞行。',
  en: 'This checklist/procedure is for reference only. The flight should be conducted based on materials published by the company, aircraft manufacturer, airport, and the actual condition of the aircraft.',
  ja: '本チェックリスト／手順は参考用です。会社、航空機製造者、空港などが公表する資料および航空機の実際の状態に基づいて飛行を実施してください。',
  ko: '본 체크리스트/절차는 참고용입니다. 회사, 항공기 제작사, 공항 등이 공표한 자료와 항공기의 실제 상태를 바탕으로 비행을 수행해야 합니다.',
  fr: 'Cette checklist/procédure est fournie à titre indicatif. Le vol doit être effectué sur la base des documents publiés par la compagnie, le constructeur aéronautique, l’aéroport, ainsi que de l’état réel de l’avion.',
}

export function decoratePublicChecklist(checklist: Checklist, locale: string): Checklist {
  const disclaimer = publicDisclaimers[locale] || publicDisclaimers.en!
  const description = checklist.description.includes(disclaimer)
    ? checklist.description
    : [checklist.description, disclaimer].filter(Boolean).join('\n')
  return {
    ...checklist,
    title: checklist.id === 'preflight' || /^737(?:\s|$)/.test(checklist.title)
      ? checklist.title
      : `737 ${checklist.title}`,
    description,
    icon: publicChecklistIcons[checklist.id],
  }
}

type LocalizedChecklistContent = {
  title: string
  description: string
  sectionTitle: string
  afterTakeoffDescription: string
  items: string[]
  afterTakeoffTitle: string
  afterTakeoffItems: LocalizedItem[]
}

const localizedContent: Record<string, LocalizedChecklistContent> = {
  'zh-CN': {
    title: '无发动机引气起飞程序', description: '适用于无需机翼防冰的情况。', sectionTitle: '滑行前程序', afterTakeoffTitle: '起飞后程序', afterTakeoffDescription: '注：如果发动机失效，在到达 1,500 英尺或到达越障高度前，不要接通发动机引气电门。\n建议最晚FL150完成起飞后程序。',
    items: ['右组件 ...... AUTO', '隔离活门 ...... CLOSE', '左组件 ...... AUTO', '1 发引气 ...... OFF', 'APU 引气 ...... ON', '2 发引气 ...... OFF', '发动机发电机 ...... ON', '探头加温 ...... ON', '发动机起动电门 ...... CONT', '发动机起动手柄 ...... IDLE卡位', '地面人员和设备 ...... 核实移开', '襟翼 ...... 起飞襟翼', '飞行操纵 ...... 检查', 'ENG/SYS ...... 检查并情况', '襟翼位置 ...... 核实', '再现 ...... 检查', '气象雷达 ...... 调定', '组件(2个) ...... 核实 AUTO', 'L 管道压力 ...... 核实', '滑行前检查单 ...... 完成'],
    afterTakeoffItems: [
      { title: '2 发引气 ...... ON', description: '(737-Max)襟翼收上后45s，两个发动机引气都未接通，两个BLEED灯亮' },
      { title: 'R 管道压力 ...... 检查' },
      { title: 'APU 引气 ...... OFF', description: '最晚FL170' },
      { title: '核实座舱升降率稳定', description: '可以等 30s' },
      { title: '1 发引气 ...... ON' },
      { title: '隔离活门 ...... AUTO' },
      { title: '增压 ...... 检查' },
      { title: 'APU ...... OFF' },
      { title: '起飞后检查单 ...... 完成' },
    ],
  },
  en: {
    title: 'No Engine Bleed Takeoff Procedure', description: 'For conditions where wing anti-ice is not required.', sectionTitle: 'Before Taxi Procedure', afterTakeoffTitle: 'After Takeoff Procedure', afterTakeoffDescription: 'Note: If an engine fails, do not turn on the engine bleed switches before reaching 1,500 ft or the obstacle clearance altitude.\nIt is recommended to complete the after takeoff procedure by FL150 at the latest.',
    items: ['Right pack ...... AUTO', 'Isolation valve ...... CLOSE', 'Left pack ...... AUTO', 'No. 1 engine bleed ...... OFF', 'APU bleed ...... ON', 'No. 2 engine bleed ...... OFF', 'Engine generators ...... ON', 'Probe heat ...... ON', 'Engine start switches ...... CONT', 'Engine start levers ...... IDLE detent', 'Ground personnel and equipment ...... Verify clear', 'Flaps ...... Takeoff flaps', 'Flight controls ...... Check', 'ENG/SYS ...... Check and clear', 'Flap position ...... Verify', 'Recall ...... Check', 'Weather radar ...... Set', 'Both packs ...... Verify AUTO', 'L duct pressure ...... Verify', 'Before taxi checklist ...... Complete'],
    afterTakeoffItems: [
      { title: 'No. 2 engine bleed ...... ON', description: '(737 MAX) 45 s after flap retraction, if neither engine bleed is on, both BLEED lights are illuminated' },
      { title: 'R duct pressure ...... Check' },
      { title: 'APU bleed ...... OFF', description: 'By FL170 at the latest' },
      { title: 'Verify cabin rate of climb is stable', description: 'May wait 30 s' },
      { title: 'No. 1 engine bleed ...... ON' },
      { title: 'Isolation valve ...... AUTO' },
      { title: 'Pressurization ...... Check' },
      { title: 'APU ...... OFF' },
      { title: 'After takeoff checklist ...... Complete' },
    ],
  },
  ja: {
    title: 'エンジンブリードなし離陸手順', description: '主翼防氷が不要な場合に適用します。', sectionTitle: 'タキシング前手順', afterTakeoffTitle: '離陸後手順', afterTakeoffDescription: '注：エンジン故障時は、1,500 フィートまたは障害物クリアランス高度に到達する前に、エンジンブリードスイッチを ON にしないでください。\n遅くとも FL150 までに離陸後手順を完了することを推奨します。',
    items: ['右側パック ...... AUTO', 'アイソレーションバルブ ...... CLOSE', '左側パック ...... AUTO', '1 番エンジンブリード ...... OFF', 'APU ブリード ...... ON', '2 番エンジンブリード ...... OFF', 'エンジン発電機 ...... ON', 'プローブヒート ...... ON', 'エンジン始動スイッチ ...... CONT', 'エンジン始動レバー ...... IDLE デテント', '地上要員および機材 ...... 退避を確認', 'フラップ ...... 離陸フラップ', '飛行操縦装置 ...... 確認', 'ENG/SYS ...... 確認してクリア', 'フラップ位置 ...... 確認', 'リコール ...... 確認', '気象レーダー ...... セット', '両パック ...... AUTO を確認', 'L ダクト圧力 ...... 確認', 'タキシング前チェックリスト ...... 完了'],
    afterTakeoffItems: [
      { title: '2 番エンジンブリード ...... ON', description: '(737 MAX) フラップ格納後 45 秒経過しても両エンジンのブリードが ON になっていない場合、両方の BLEED ライトが点灯' },
      { title: 'R ダクト圧力 ...... 確認' },
      { title: 'APU ブリード ...... OFF', description: '遅くとも FL170 までに' },
      { title: '客室上昇率が安定していることを確認', description: '30 秒待ってもよい' },
      { title: '1 番エンジンブリード ...... ON' },
      { title: 'アイソレーションバルブ ...... AUTO' },
      { title: '与圧 ...... 確認' },
      { title: 'APU ...... OFF' },
      { title: '離陸後チェックリスト ...... 完了' },
    ],
  },
  ko: {
    title: '엔진 블리드 없이 이륙 절차', description: '날개 방빙이 필요하지 않은 경우에 적용합니다.', sectionTitle: '택시 전 절차', afterTakeoffTitle: '이륙 후 절차', afterTakeoffDescription: '주의: 엔진 고장 시 1,500피트 또는 장애물 회피 고도에 도달하기 전에는 엔진 블리드 스위치를 켜지 마십시오.\n늦어도 FL150까지 이륙 후 절차를 완료하는 것을 권장합니다.',
    items: ['오른쪽 팩 ...... AUTO', '아이솔레이션 밸브 ...... CLOSE', '왼쪽 팩 ...... AUTO', '1번 엔진 블리드 ...... OFF', 'APU 블리드 ...... ON', '2번 엔진 블리드 ...... OFF', '엔진 발전기 ...... ON', '프로브 히트 ...... ON', '엔진 시동 스위치 ...... CONT', '엔진 시동 레버 ...... IDLE 걸림 위치', '지상 인원 및 장비 ...... 철수 확인', '플랩 ...... 이륙 플랩', '비행 조종 ...... 점검', 'ENG/SYS ...... 점검 및 클리어', '플랩 위치 ...... 확인', '리콜 ...... 점검', '기상 레이더 ...... 설정', '양쪽 팩 ...... AUTO 확인', 'L 덕트 압력 ...... 확인', '택시 전 체크리스트 ...... 완료'],
    afterTakeoffItems: [
      { title: '2번 엔진 블리드 ...... ON', description: '(737 MAX) 플랩을 접은 후 45초가 지나도 두 엔진 블리드가 모두 켜지지 않으면 두 BLEED 표시등이 점등됨' },
      { title: 'R 덕트 압력 ...... 점검' },
      { title: 'APU 블리드 ...... OFF', description: '늦어도 FL170까지' },
      { title: '객실 상승률 안정 여부 확인', description: '30초 기다려도 됨' },
      { title: '1번 엔진 블리드 ...... ON' },
      { title: '아이솔레이션 밸브 ...... AUTO' },
      { title: '여압 ...... 점검' },
      { title: 'APU ...... OFF' },
      { title: '이륙 후 체크리스트 ...... 완료' },
    ],
  },
  fr: {
    title: 'Procédure de décollage sans prélèvement moteur', description: 'S’applique lorsque l’antigivrage des ailes n’est pas requis.', sectionTitle: 'Procédure avant roulage', afterTakeoffTitle: 'Procédure après décollage', afterTakeoffDescription: 'Remarque : en cas de panne moteur, ne pas mettre les interrupteurs de prélèvement moteur sur ON avant d’atteindre 1 500 ft ou l’altitude de franchissement des obstacles.\nIl est recommandé de terminer la procédure après décollage au plus tard au FL150.',
    items: ['Pack droit ...... AUTO', 'Vanne d’isolement ...... CLOSE', 'Pack gauche ...... AUTO', 'Prélèvement moteur n° 1 ...... OFF', 'Prélèvement APU ...... ON', 'Prélèvement moteur n° 2 ...... OFF', 'Générateurs moteur ...... ON', 'Chauffage des sondes ...... ON', 'Interrupteurs de démarrage moteur ...... CONT', 'Manettes de démarrage moteur ...... cran IDLE', 'Personnel et matériel au sol ...... Vérifier dégagés', 'Volets ...... Volets de décollage', 'Commandes de vol ...... Vérifier', 'ENG/SYS ...... Vérifier et effacer', 'Position des volets ...... Vérifier', 'Recall ...... Vérifier', 'Radar météo ...... Régler', 'Les deux packs ...... Vérifier AUTO', 'Pression du conduit gauche ...... Vérifier', 'Checklist avant roulage ...... Terminée'],
    afterTakeoffItems: [
      { title: 'Prélèvement moteur n° 2 ...... ON', description: '(737 MAX) 45 s après la rentrée des volets, si aucun des deux prélèvements moteur n’est enclenché, les deux voyants BLEED sont allumés' },
      { title: 'Pression du conduit droit ...... Vérifier' },
      { title: 'Prélèvement APU ...... OFF', description: 'Au plus tard au FL170' },
      { title: 'Vérifier que le taux de montée cabine est stable', description: 'Attendre 30 s si nécessaire' },
      { title: 'Prélèvement moteur n° 1 ...... ON' },
      { title: 'Vanne d’isolement ...... AUTO' },
      { title: 'Pressurisation ...... Vérifier' },
      { title: 'APU ...... OFF' },
      { title: 'Checklist après décollage ...... Terminée' },
    ],
  },
}

export function noEngineBleedTakeoffChecklist(locale: string): Checklist {
  const selected = localizedContent[locale] || localizedContent.en!
  return createBuiltinChecklist(checklistId, selected.title, selected.description, [{
    id: `${checklistId}.before-taxi`,
    title: selected.sectionTitle,
    items: itemIds.map((id, index) => ({ id: `${checklistId}.${id}`, title: selected.items[index] || id })),
  }, {
    id: `${checklistId}.after-takeoff`,
    title: selected.afterTakeoffTitle,
    description: selected.afterTakeoffDescription,
    items: afterTakeoffItemIds.map((id, index) => ({
      id: `${checklistId}.${id}`,
      title: selected.afterTakeoffItems[index]?.title || id,
      description: selected.afterTakeoffItems[index]?.description || '',
    })),
  }])
}

export const noEngineBleedTakeoffChecklistDefault = noEngineBleedTakeoffChecklist('zh-CN')

export function publicBuiltinChecklists(locale: string): Checklist[] {
  return [publicDeicingChecklist(locale).checklist, noEngineBleedTakeoffChecklist(locale), publicPreflightChecklist(locale), publicFirstLegChecklist(locale), publicTurnaroundChecklist(locale)]
    .map((checklist) => decoratePublicChecklist(checklist, locale))
}
