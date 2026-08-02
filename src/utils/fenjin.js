// 分金判断：读盘直断坐/向分金吉凶（纯函数，node 可校验）
// 吉凶按纳甲口诀；骑缝空亡 = 距 15° 交界线（角度 ≡ 7.5 mod 15）循环距离 <0.5°
import { fenjin120 } from '../data/fenjin.js';
import { mountainAt } from './fengShui.js';

function normalize(a) {
  return ((a % 360) + 360) % 360;
}

// 到最近 15° 交界线的循环距离
function boundaryDist(deg) {
  const d = normalize(deg);
  const rem = (d - 7.5 + 360) % 15;
  return Math.min(rem, 15 - rem);
}

// 最近分金槽（槽宽 3° 均匀铺满，中心距最小即所在槽）
function nearest(deg) {
  const d = normalize(deg);
  let best = fenjin120[0];
  let bestDiff = Infinity;
  for (const f of fenjin120) {
    let diff = Math.abs(normalize(f.angle) - d);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = f;
    }
  }
  return best;
}

// 十字线处所在分金：槽对象，或骑缝空亡 { type:'kongwang', a, b }
export function fenjinAt(deg) {
  if (boundaryDist(deg) < 0.5) {
    return {
      type: 'kongwang',
      a: mountainAt(deg - 0.5),
      b: mountainAt(deg + 0.5),
    };
  }
  return nearest(deg);
}

const LEVEL_META = {
  旺相: { ji: '吉', text: '旺相分金，可立向。' },
  孤: { ji: '凶', text: '阳孤分金，孤阳不生，不宜立向。' },
  虚: { ji: '凶', text: '阴虚分金，独阴不长，不宜立向。' },
  龟甲: { ji: '凶', text: '龟甲空亡，坐向正中一线，不宜立向。' },
  空亡: { ji: '凶', text: '骑缝空亡，两山交界之线，不宜立向。' },
};

function side(deg) {
  const r = fenjinAt(deg);
  if (r.type === 'kongwang') {
    return {
      mountain: `${r.a}/${r.b}`,
      name: '骑缝',
      gan: '',
      zhi: '',
      level: '空亡',
      nian: '',
      ...LEVEL_META['空亡'],
    };
  }
  return { ...r, ...LEVEL_META[r.level] };
}

// 坐 + 向分金断语（向 = 坐 + 180°）
export function judgeFenjin(deg) {
  return { shan: side(deg), xiang: side(deg + 180) };
}
