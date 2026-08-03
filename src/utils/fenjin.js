// 分金判断：读盘直断坐/向分金吉凶（纯函数，node 可校验）
// 吉凶按纳甲口诀；骑缝空亡 = 距 15° 交界线（角度 ≡ 7.5 mod 15）循环距离 <0.5°
import { fenjin120 } from '../data/fenjin.js';
import { jiazi } from '../data/jiazi.js';
import { mountainAt } from './fengShui.js';

// 五行生克：SHENG[x]=y 表示 x生y；KE[x]=y 表示 x克y
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

// 仙命配分金断语（仙命为主、分金为从）
const XIAN_MING_META = {
  生: { ji: '吉', label: '生入', text: '分金生仙命，谓「生入」，可用。' },
  旺: { ji: '吉', label: '比和', text: '分金与仙命纳音比和，谓「旺」，可用。' },
  财: { ji: '吉', label: '财', text: '仙命克分金，谓「财」，可用。' },
  泄: { ji: '凶', label: '泄出', text: '仙命生分金，谓「泄出」，不可用。' },
  杀: { ji: '凶', label: '克入', text: '分金克仙命，谓「克入/杀」，不可用。' },
};

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

// 公历 → 年干支（1984 = 甲子 = 序 0）
export function yearGanZhi(year) {
  const idx = (((year - 4) % 60) + 60) % 60;
  const j = jiazi[idx];
  return { name: j.name, nian: j.nian };
}

// 纳音 → 五行（名末字：海中金→金、涧下水→水…）
export function nianWuxing(nian) {
  const w = nian.slice(-1);
  return '金木水火土'.includes(w) ? w : '';
}

// 仙命配分金：仙命纳音为体、分金纳音为用，五行生克断吉凶
// 生/旺/财 吉，泄/杀 凶
export function judgeXianMing(year, fenjinNian) {
  const xm = yearGanZhi(year);
  const xw = nianWuxing(xm.nian);
  const fw = nianWuxing(fenjinNian);
  if (!xw || !fw) return null;
  let relation;
  if (xw === fw) relation = '旺';
  else if (SHENG[fw] === xw) relation = '生';
  else if (KE[xw] === fw) relation = '财';
  else if (SHENG[xw] === fw) relation = '泄';
  else relation = '杀';
  return {
    xm: xm.name,
    xmNian: xm.nian,
    relation,
    ...XIAN_MING_META[relation],
  };
}
