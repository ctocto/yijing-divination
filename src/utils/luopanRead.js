// 罗盘按角度读数（纯函数，不触碰 DOM，node 脚本可直接 import 校验）
import { solarTerms } from '../data/luopan.js';
import { mansions } from '../data/mansions.js';
import { jiazi } from '../data/jiazi.js';
import { fuXiRing } from './fuXiOrder.js';

function normalize(a) {
  return ((a % 360) + 360) % 360;
}

// 通用最近角度取项（循环距离）
export function itemAt(deg, items, angleKey = 'angle') {
  const d = normalize(deg);
  let best = items[0];
  let bestDiff = Infinity;
  for (const it of items) {
    let diff = Math.abs(normalize(it[angleKey]) - d);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = it;
    }
  }
  return best;
}

export const termAt = (deg) => itemAt(deg, solarTerms).name;
export const jiaziAt = (deg) => itemAt(deg, jiazi).name;
export const plateMountainAt = (deg, plate) => itemAt(deg, plate).name;
export const hexagramAt = (deg) => itemAt(deg, fuXiRing).name;

// 二十八宿：按古度比例归一至 360° 后做区间查找（角宿 0° 起）
export function mansionAt(deg) {
  const total = mansions.reduce((s, m) => s + m.degree, 0);
  const scaled = (normalize(deg) / 360) * total;
  let acc = 0;
  for (const m of mansions) {
    acc += m.degree;
    if (scaled < acc) return m.name;
  }
  return mansions[mansions.length - 1].name;
}
