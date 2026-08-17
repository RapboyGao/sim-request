import { createBuiltinChecklist, type BuiltinSectionInput } from './checklist-factory'
import { publicFirstLegChecklist } from './public-first-leg'
import type { Checklist } from '~/types/checklist'

type LocalizedTurnaround = {
  title: string
  description: string
  sections: BuiltinSectionInput[]
}

const item = (section: string, id: string, title: string, description = '') => ({
  id: `public-turnaround.${section}.${id}`,
  title,
  description,
})

const localizedContent: Record<string, LocalizedTurnaround> = {
  'zh-CN': {
    title: '过站航段',
    description: '',
    sections: [
      {
        id: 'public-turnaround.deplaning',
        title: '下客时',
        items: [
          item('deplaning', 'remaining-fuel', '记录剩余油量'),
          item('deplaning', 'ground-contact', '联系现场(按需)'),
          item('deplaning', 'logbook', 'Logbooks'),
          item('deplaning', 'task-book', '任务书'),
          item('deplaning', 'cloud-license', '云执照', '如果没有网络，应该先打印时间条，等后续航段结束填写'),
          item('deplaning', 'time-log', '时间条(Time Log)'),
          item('deplaning', 'dual-carbon', '双碳'),
          item('deplaning', 'flight-plan', '飞行计划'),
          item('deplaning', 'performance-calculation', '性能计算'),
          item('deplaning', 'notam', 'NOTAM'),
          item('deplaning', 'delay-information', '延误信息'),
          item('deplaning', 'other-required-work', '大队/中队要求的其他工作'),
          item('deplaning', 'equipment-charging', '设备充电', '录音笔、EFB、手机等'),
          item('deplaning', 'cleaning-bags-as-needed', '清洁袋 ...... 按需更换'),
        ],
      },
      {
        id: 'public-turnaround.turnaround-cockpit',
        title: '驾驶舱',
        items: [
          item('turnaround-cockpit', 'deicing-request', '除冰Request ...... 已申请 (冬季)'),
          item('turnaround-cockpit', 'cockpit-preparation', '驾驶舱准备 ...... 检查'),
          item('turnaround-cockpit', 'flt-land-alt', 'FLT/LAND ALT ...... 检查'),
          item('turnaround-cockpit', 'flight-director', '飞行指引 ...... 接通'),
          item('turnaround-cockpit', 'autobrake', '自动刹车 ...... RTO'),
          item('turnaround-cockpit', 'fuel-used', '油耗 ...... 已重置'),
        ],
      },
    ],
  },
  en: {
    title: 'Turnaround Leg',
    description: '',
    sections: [
      {
        id: 'public-turnaround.deplaning',
        title: 'During Disembarkation',
        items: [
          item('deplaning', 'remaining-fuel', 'Record remaining fuel'),
          item('deplaning', 'ground-contact', 'Contact ground staff (as needed)'),
          item('deplaning', 'logbook', 'Logbooks'),
          item('deplaning', 'task-book', 'Task book'),
          item('deplaning', 'cloud-license', 'Cloud license', 'If there is no network, print the time log first and complete it after the subsequent leg.'),
          item('deplaning', 'time-log', 'Time Log'),
          item('deplaning', 'dual-carbon', 'Dual carbon'),
          item('deplaning', 'flight-plan', 'Flight plan'),
          item('deplaning', 'performance-calculation', 'Performance calculation'),
          item('deplaning', 'notam', 'NOTAM'),
          item('deplaning', 'delay-information', 'Delay information'),
          item('deplaning', 'other-required-work', 'Other work required by the group/squadron'),
          item('deplaning', 'equipment-charging', 'Charge equipment', 'Voice recorder, EFB, mobile phone, etc.'),
          item('deplaning', 'cleaning-bags-as-needed', 'Cleaning bags ...... Replace as needed'),
        ],
      },
      {
        id: 'public-turnaround.turnaround-cockpit',
        title: 'Cockpit',
        items: [
          item('turnaround-cockpit', 'deicing-request', 'Deicing request ...... Requested (winter)'),
          item('turnaround-cockpit', 'cockpit-preparation', 'Cockpit preparation ...... Check'),
          item('turnaround-cockpit', 'flt-land-alt', 'FLT/LAND ALT ...... Check'),
          item('turnaround-cockpit', 'flight-director', 'Flight director ...... ON'),
          item('turnaround-cockpit', 'autobrake', 'Autobrake ...... RTO'),
          item('turnaround-cockpit', 'fuel-used', 'Fuel used ...... Reset'),
        ],
      },
    ],
  },
  ja: {
    title: '乗継レグ',
    description: '',
    sections: [
      {
        id: 'public-turnaround.deplaning',
        title: '降機中',
        items: [
          item('deplaning', 'remaining-fuel', '残燃料を記録'),
          item('deplaning', 'ground-contact', '必要に応じて地上係員に連絡'),
          item('deplaning', 'logbook', 'ログブック'),
          item('deplaning', 'task-book', '業務指示書'),
          item('deplaning', 'cloud-license', 'クラウドライセンス', 'ネットワークがない場合は先にタイムログを印刷し、次のレグ終了後に記入する。'),
          item('deplaning', 'time-log', 'タイムログ (Time Log)'),
          item('deplaning', 'dual-carbon', 'デュアルカーボン'),
          item('deplaning', 'flight-plan', 'フライトプラン'),
          item('deplaning', 'performance-calculation', '性能計算'),
          item('deplaning', 'notam', 'NOTAM'),
          item('deplaning', 'delay-information', '遅延情報'),
          item('deplaning', 'other-required-work', 'グループ / 中隊が要求するその他の作業'),
          item('deplaning', 'equipment-charging', '機器の充電', 'ボイスレコーダー、EFB、携帯電話など'),
          item('deplaning', 'cleaning-bags-as-needed', '清掃袋 ...... 必要に応じて交換'),
        ],
      },
      {
        id: 'public-turnaround.turnaround-cockpit',
        title: 'コックピット',
        items: [
          item('turnaround-cockpit', 'deicing-request', '除氷リクエスト ...... 申請済み (冬季)'),
          item('turnaround-cockpit', 'cockpit-preparation', 'コックピット準備 ...... 確認'),
          item('turnaround-cockpit', 'flt-land-alt', 'FLT/LAND ALT ...... 確認'),
          item('turnaround-cockpit', 'flight-director', 'フライトディレクター ...... ON'),
          item('turnaround-cockpit', 'autobrake', 'オートブレーキ ...... RTO'),
          item('turnaround-cockpit', 'fuel-used', '使用燃料 ...... リセット済み'),
        ],
      },
    ],
  },
  ko: {
    title: '턴어라운드 레그',
    description: '',
    sections: [
      {
        id: 'public-turnaround.deplaning',
        title: '하기 중',
        items: [
          item('deplaning', 'remaining-fuel', '잔여 연료 기록'),
          item('deplaning', 'ground-contact', '필요 시 지상 직원에게 연락'),
          item('deplaning', 'logbook', '로그북'),
          item('deplaning', 'task-book', '업무 지시서'),
          item('deplaning', 'cloud-license', '클라우드 라이선스', '네트워크가 없으면 먼저 타임 로그를 출력하고 다음 레그 종료 후 작성합니다.'),
          item('deplaning', 'time-log', '타임 로그 (Time Log)'),
          item('deplaning', 'dual-carbon', '듀얼 카본'),
          item('deplaning', 'flight-plan', '비행계획'),
          item('deplaning', 'performance-calculation', '성능 계산'),
          item('deplaning', 'notam', 'NOTAM'),
          item('deplaning', 'delay-information', '지연 정보'),
          item('deplaning', 'other-required-work', '그룹/중대에서 요구한 기타 작업'),
          item('deplaning', 'equipment-charging', '장비 충전', '음성 녹음기, EFB, 휴대전화 등'),
          item('deplaning', 'cleaning-bags-as-needed', '청소 봉투 ...... 필요 시 교체'),
        ],
      },
      {
        id: 'public-turnaround.turnaround-cockpit',
        title: '조종실',
        items: [
          item('turnaround-cockpit', 'deicing-request', '제빙 요청 ...... 신청 완료 (겨울철)'),
          item('turnaround-cockpit', 'cockpit-preparation', '조종실 준비 ...... 확인'),
          item('turnaround-cockpit', 'flt-land-alt', 'FLT/LAND ALT ...... 확인'),
          item('turnaround-cockpit', 'flight-director', '비행 지시기 ...... ON'),
          item('turnaround-cockpit', 'autobrake', '자동 브레이크 ...... RTO'),
          item('turnaround-cockpit', 'fuel-used', '사용 연료 ...... 리셋 완료'),
        ],
      },
    ],
  },
  fr: {
    title: 'Secteur de transit',
    description: '',
    sections: [
      {
        id: 'public-turnaround.deplaning',
        title: 'Pendant le débarquement',
        items: [
          item('deplaning', 'remaining-fuel', 'Noter le carburant restant'),
          item('deplaning', 'ground-contact', 'Contacter le personnel au sol si nécessaire'),
          item('deplaning', 'logbook', 'Carnets de bord'),
          item('deplaning', 'task-book', 'Cahier de mission'),
          item('deplaning', 'cloud-license', 'Licence cloud', 'En l’absence de réseau, imprimer d’abord le time log et le remplir après le secteur suivant.'),
          item('deplaning', 'time-log', 'Time Log'),
          item('deplaning', 'dual-carbon', 'Double carbone'),
          item('deplaning', 'flight-plan', 'Plan de vol'),
          item('deplaning', 'performance-calculation', 'Calcul des performances'),
          item('deplaning', 'notam', 'NOTAM'),
          item('deplaning', 'delay-information', 'Informations de retard'),
          item('deplaning', 'other-required-work', 'Autres tâches demandées par le groupe / l’escadron'),
          item('deplaning', 'equipment-charging', 'Recharger les équipements', 'Enregistreur vocal, EFB, téléphone portable, etc.'),
          item('deplaning', 'cleaning-bags-as-needed', 'Sacs de nettoyage ...... Remplacer si nécessaire'),
        ],
      },
      {
        id: 'public-turnaround.turnaround-cockpit',
        title: 'Cockpit',
        items: [
          item('turnaround-cockpit', 'deicing-request', 'Demande de dégivrage ...... Demandée (hiver)'),
          item('turnaround-cockpit', 'cockpit-preparation', 'Préparation cockpit ...... Vérifier'),
          item('turnaround-cockpit', 'flt-land-alt', 'FLT/LAND ALT ...... Vérifier'),
          item('turnaround-cockpit', 'flight-director', 'Directeur de vol ...... ON'),
          item('turnaround-cockpit', 'autobrake', 'Freinage automatique ...... RTO'),
          item('turnaround-cockpit', 'fuel-used', 'Carburant consommé ...... Réinitialisé'),
        ],
      },
    ],
  },
}

function cloneFirstLegSections(checklist: Checklist): BuiltinSectionInput[] {
  return checklist.sections
    .filter((section) => !['public-first-leg.aircraft-exterior', 'public-first-leg.third-position', 'public-first-leg.cockpit'].includes(section.id))
    .map((section) => ({
      ...section,
      id: section.id.replace(/^public-first-leg\./, 'public-turnaround.'),
      items: section.items
        .filter((item) => item.id !== 'public-first-leg.documents.pins-covers')
        .map((item) => ({
          ...item,
          id: item.id.replace(/^public-first-leg\./, 'public-turnaround.'),
        })),
    }))
}

export function publicTurnaroundChecklist(locale: string): Checklist {
  const selected = localizedContent[locale] || localizedContent.en!
  const firstLeg = publicFirstLegChecklist(locale)
  return createBuiltinChecklist(
    'turnaround',
    selected.title,
    selected.description,
    [...selected.sections, ...cloneFirstLegSections(firstLeg)],
    '',
  )
}

export const publicTurnaroundChecklistDefault = publicTurnaroundChecklist('zh-CN')
