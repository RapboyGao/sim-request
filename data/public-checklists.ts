import { publicDeicingChecklist } from './public-deicing'
import { createBuiltinChecklist } from './checklist-pages/_factory'
import type { Checklist } from '~/types/checklist'

const checklistId = 'no-engine-bleed-takeoff'

const itemIds = [
  'right-pack', 'isolation-valve', 'left-pack', 'engine-1-bleed', 'apu-bleed',
  'engine-2-bleed', 'engine-generators', 'probe-heat', 'start-switches', 'start-levers',
  'ground-clear', 'flaps', 'flight-controls', 'eng-sys', 'flap-position', 'recall',
  'weather-radar', 'packs', 'left-duct-pressure', 'before-taxi-checklist',
] as const

const localizedContent: Record<string, { title: string; description: string; sectionTitle: string; items: string[] }> = {
  'zh-CN': {
    title: '无发动机引气起飞程序', description: '适用于无需机翼防冰的情况。', sectionTitle: '滑行前程序',
    items: ['右组件 ...... AUTO', '隔离活门 ...... CLOSE', '左组件 ...... AUTO', '1 发引气 ...... OFF', 'APU 引气 ...... ON', '2 发引气 ...... OFF', '发动机发电机 ...... ON', '探头加温 ...... ON', '发动机起动电门 ...... CONT', '发动机起动手柄 ...... IDLE卡位', '地面人员和设备 ...... 核实移开', '襟翼 ...... 起飞襟翼', '飞行操纵 ...... 检查', 'ENG/SYS ...... 检查并情况', '襟翼位置 ...... 核实', '再现 ...... 检查', '气象雷达 ...... 调定', '组件(2个) ...... 核实 AUTO', 'L 管道压力 ...... 核实', '滑行前检查单 ...... 完成'],
  },
  en: {
    title: 'No Engine Bleed Takeoff Procedure', description: 'For conditions where wing anti-ice is not required.', sectionTitle: 'Before Taxi Procedure',
    items: ['Right pack ...... AUTO', 'Isolation valve ...... CLOSE', 'Left pack ...... AUTO', 'No. 1 engine bleed ...... OFF', 'APU bleed ...... ON', 'No. 2 engine bleed ...... OFF', 'Engine generators ...... ON', 'Probe heat ...... ON', 'Engine start switches ...... CONT', 'Engine start levers ...... IDLE detent', 'Ground personnel and equipment ...... Verify clear', 'Flaps ...... Takeoff flaps', 'Flight controls ...... Check', 'ENG/SYS ...... Check and clear', 'Flap position ...... Verify', 'Recall ...... Check', 'Weather radar ...... Set', 'Both packs ...... Verify AUTO', 'L duct pressure ...... Verify', 'Before taxi checklist ...... Complete'],
  },
  ja: {
    title: 'エンジンブリードなし離陸手順', description: '主翼防氷が不要な場合に適用します。', sectionTitle: 'タキシング前手順',
    items: ['右側パック ...... AUTO', 'アイソレーションバルブ ...... CLOSE', '左側パック ...... AUTO', '1 番エンジンブリード ...... OFF', 'APU ブリード ...... ON', '2 番エンジンブリード ...... OFF', 'エンジン発電機 ...... ON', 'プローブヒート ...... ON', 'エンジン始動スイッチ ...... CONT', 'エンジン始動レバー ...... IDLE デテント', '地上要員および機材 ...... 退避を確認', 'フラップ ...... 離陸フラップ', '飛行操縦装置 ...... 確認', 'ENG/SYS ...... 確認してクリア', 'フラップ位置 ...... 確認', 'リコール ...... 確認', '気象レーダー ...... セット', '両パック ...... AUTO を確認', 'L ダクト圧力 ...... 確認', 'タキシング前チェックリスト ...... 完了'],
  },
  ko: {
    title: '엔진 블리드 없이 이륙 절차', description: '날개 방빙이 필요하지 않은 경우에 적용합니다.', sectionTitle: '택시 전 절차',
    items: ['오른쪽 팩 ...... AUTO', '아이솔레이션 밸브 ...... CLOSE', '왼쪽 팩 ...... AUTO', '1번 엔진 블리드 ...... OFF', 'APU 블리드 ...... ON', '2번 엔진 블리드 ...... OFF', '엔진 발전기 ...... ON', '프로브 히트 ...... ON', '엔진 시동 스위치 ...... CONT', '엔진 시동 레버 ...... IDLE 걸림 위치', '지상 인원 및 장비 ...... 철수 확인', '플랩 ...... 이륙 플랩', '비행 조종 ...... 점검', 'ENG/SYS ...... 점검 및 클리어', '플랩 위치 ...... 확인', '리콜 ...... 점검', '기상 레이더 ...... 설정', '양쪽 팩 ...... AUTO 확인', 'L 덕트 압력 ...... 확인', '택시 전 체크리스트 ...... 완료'],
  },
  fr: {
    title: 'Procédure de décollage sans prélèvement moteur', description: 'S’applique lorsque l’antigivrage des ailes n’est pas requis.', sectionTitle: 'Procédure avant roulage',
    items: ['Pack droit ...... AUTO', 'Vanne d’isolement ...... CLOSE', 'Pack gauche ...... AUTO', 'Prélèvement moteur n° 1 ...... OFF', 'Prélèvement APU ...... ON', 'Prélèvement moteur n° 2 ...... OFF', 'Générateurs moteur ...... ON', 'Chauffage des sondes ...... ON', 'Interrupteurs de démarrage moteur ...... CONT', 'Manettes de démarrage moteur ...... cran IDLE', 'Personnel et matériel au sol ...... Vérifier dégagés', 'Volets ...... Volets de décollage', 'Commandes de vol ...... Vérifier', 'ENG/SYS ...... Vérifier et effacer', 'Position des volets ...... Vérifier', 'Recall ...... Vérifier', 'Radar météo ...... Régler', 'Les deux packs ...... Vérifier AUTO', 'Pression du conduit gauche ...... Vérifier', 'Checklist avant roulage ...... Terminée'],
  },
}

export function noEngineBleedTakeoffChecklist(locale: string): Checklist {
  const selected = localizedContent[locale] || localizedContent.en!
  return createBuiltinChecklist(checklistId, selected.title, selected.description, [{
    id: `${checklistId}.before-taxi`,
    title: selected.sectionTitle,
    items: itemIds.map((id, index) => ({ id: `${checklistId}.${id}`, title: selected.items[index] || id })),
  }], '')
}

export const noEngineBleedTakeoffChecklistDefault = noEngineBleedTakeoffChecklist('zh-CN')

export function publicBuiltinChecklists(locale: string): Checklist[] {
  return [publicDeicingChecklist(locale).checklist, noEngineBleedTakeoffChecklist(locale)]
}
