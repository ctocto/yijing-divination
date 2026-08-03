// 公历 → 干支（年/月/日）纯函数（不触碰 DOM，node 脚本可直接 import 校验）
// 干支纪日：日干支序 = (JDN + 49) mod 60（甲子=0，适用于 1582-10-15 起的格里历）
// 年界立春（2/4）：立春前仍属上年；月建支按近似节气表（边界 ±1 天，文化参考）
import { jiazi } from '../data/jiazi.js';

const GANS = '甲乙丙丁戊己庚辛壬癸'.split('');
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'.split('');
const BRANCH_IDX = Object.fromEntries(BRANCHES.map((b, i) => [b, i]));

// 12 节近似公历日 → 月建支（标准俗节气口径，边界 ±1 天）
const JIE_ZHI = [
  { m: 1, d: 5, zhi: '丑' }, // 小寒
  { m: 2, d: 4, zhi: '寅' }, // 立春
  { m: 3, d: 5, zhi: '卯' }, // 惊蛰
  { m: 4, d: 5, zhi: '辰' }, // 清明
  { m: 5, d: 5, zhi: '巳' }, // 立夏
  { m: 6, d: 5, zhi: '午' }, // 芒种
  { m: 7, d: 7, zhi: '未' }, // 小暑
  { m: 8, d: 7, zhi: '申' }, // 立秋
  { m: 9, d: 7, zhi: '酉' }, // 白露
  { m: 10, d: 8, zhi: '戌' }, // 寒露
  { m: 11, d: 7, zhi: '亥' }, // 立冬
  { m: 12, d: 7, zhi: '子' }, // 大雪
];

// 五虎遁：年干 → 寅月干（甲己丙作首、乙庚戊为头、丙辛庚起、丁壬壬、戊癸甲）
const WU_HU_DUN = {
  甲: '丙',
  乙: '戊',
  丙: '庚',
  丁: '壬',
  戊: '甲',
  己: '丙',
  庚: '戊',
  辛: '庚',
  壬: '壬',
  癸: '甲',
};

const jiaziAt = (idx) => jiazi[((idx % 60) + 60) % 60];

// 格里历 → 儒略日数（适用于 1582-10-15 起的现行公历）
export function jdn(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// 日干支（精确）：(JDN + 49) mod 60
export function dayGanZhi(y, m, d) {
  const j = jiaziAt(jdn(y, m, d) + 49);
  return { name: j.name, nian: j.nian };
}

// 月建支：取最晚 ≤ 日期的节支；1/1-1/4 归上一轮大雪 → 子
export function jieZhi(y, m, d) {
  for (let i = JIE_ZHI.length - 1; i >= 0; i--) {
    const j = JIE_ZHI[i];
    if (m > j.m || (m === j.m && d >= j.d)) return j.zhi;
  }
  return '子';
}

// 年干支：立春（2/4）为年界，立春前归上年
export function yearGanZhiAt(y, m, d) {
  const yy = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  const j = jiaziAt((((yy - 4) % 60) + 60) % 60);
  return { name: j.name, nian: j.nian };
}

// 月干支：五虎遁（寅月起，月干顺排）
export function monthGanZhi(yearGan, monthZhi) {
  const g0 = WU_HU_DUN[yearGan];
  if (!g0) return '';
  const offset = (BRANCH_IDX[monthZhi] - BRANCH_IDX['寅'] + 12) % 12;
  return GANS[(GANS.indexOf(g0) + offset) % 10] + monthZhi;
}

// 公历 → 年/月/日干支聚合
export function ganzhiOf(y, m, d) {
  const year = yearGanZhiAt(y, m, d);
  const month = { name: monthGanZhi(year.name[0], jieZhi(y, m, d)) };
  const day = dayGanZhi(y, m, d);
  return { year, month, day };
}
