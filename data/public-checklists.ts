import { publicDeicingChecklist } from './public-deicing'
import { createBuiltinChecklist } from './checklist-pages/_factory'
import type { Checklist } from '~/types/checklist'

export const noEngineBleedTakeoffChecklist = createBuiltinChecklist(
  'no-engine-bleed-takeoff',
  '无发动机引气起飞程序',
  '适用于无需机翼防冰的情况。',
  [
    {
      id: 'no-engine-bleed-takeoff.before-taxi',
      title: '滑行前程序',
      items: [
        { id: 'no-engine-bleed-takeoff.right-pack', title: '右组件 ...... AUTO' },
        { id: 'no-engine-bleed-takeoff.isolation-valve', title: '隔离活门 ...... CLOSE' },
        { id: 'no-engine-bleed-takeoff.left-pack', title: '左组件 ...... AUTO' },
        { id: 'no-engine-bleed-takeoff.engine-1-bleed', title: '1 发引气 ...... OFF' },
        { id: 'no-engine-bleed-takeoff.apu-bleed', title: 'APU 引气 ...... ON' },
        { id: 'no-engine-bleed-takeoff.engine-2-bleed', title: '2 发引气 ...... OFF' },
        { id: 'no-engine-bleed-takeoff.engine-generators', title: '发动机发电机 ...... ON' },
        { id: 'no-engine-bleed-takeoff.probe-heat', title: '探头加温 ...... ON' },
        { id: 'no-engine-bleed-takeoff.start-switches', title: '发动机起动电门 ...... CONT' },
        { id: 'no-engine-bleed-takeoff.start-levers', title: '发动机起动手柄 ...... IDLE卡位' },
        { id: 'no-engine-bleed-takeoff.ground-clear', title: '地面人员和设备 ...... 核实移开' },
        { id: 'no-engine-bleed-takeoff.flaps', title: '襟翼 ...... 起飞襟翼' },
        { id: 'no-engine-bleed-takeoff.flight-controls', title: '飞行操纵 ...... 检查' },
        { id: 'no-engine-bleed-takeoff.eng-sys', title: 'ENG/SYS ...... 检查并情况' },
        { id: 'no-engine-bleed-takeoff.flap-position', title: '襟翼位置 ...... 核实' },
        { id: 'no-engine-bleed-takeoff.recall', title: '再现 ...... 检查' },
        { id: 'no-engine-bleed-takeoff.weather-radar', title: '气象雷达 ...... 调定' },
        { id: 'no-engine-bleed-takeoff.packs', title: '组件(2个) ...... 核实 AUTO' },
        { id: 'no-engine-bleed-takeoff.left-duct-pressure', title: 'L 管道压力 ...... 核实' },
        { id: 'no-engine-bleed-takeoff.before-taxi-checklist', title: '滑行前检查单 ...... 完成' },
      ],
    },
  ],
  '',
)

export function publicBuiltinChecklists(locale: string): Checklist[] {
  return [publicDeicingChecklist(locale).checklist, noEngineBleedTakeoffChecklist]
}
