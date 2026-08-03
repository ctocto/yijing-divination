// 公历 → 干支（年/月/日）纯函数（不触碰 DOM，node 脚本可直接 import 校验）
// 干支纪日：日干支序 = (JDN + 49) mod 60（甲子=0，适用于 1582-10-15 起的格里历）
// 年界立春（精确交节日）：立春前仍属上年；月建支按精确天文节气（太阳视黄经反推 12 节，UTC+8）
import { jiazi } from '../data/jiazi.js';

const GANS = '甲乙丙丁戊己庚辛壬癸'.split('');
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'.split('');
const BRANCH_IDX = Object.fromEntries(BRANCHES.map((b, i) => [b, i]));

// 12 节黄经 → 月建支（立春315寅 惊蛰345卯 清明15辰 立夏45巳 芒种75午 小暑105未
// 立秋135申 白露165酉 寒露195戌 立冬225亥 大雪255子 小寒285丑）
const JIE_LON = [
  { lon: 15, zhi: '辰' },
  { lon: 45, zhi: '巳' },
  { lon: 75, zhi: '午' },
  { lon: 105, zhi: '未' },
  { lon: 135, zhi: '申' },
  { lon: 165, zhi: '酉' },
  { lon: 195, zhi: '戌' },
  { lon: 225, zhi: '亥' },
  { lon: 255, zhi: '子' },
  { lon: 285, zhi: '丑' },
  { lon: 315, zhi: '寅' },
  { lon: 345, zhi: '卯' },
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

// —— 精确节气（太阳视黄经，NOAA/Meeus 低精度，精度 ~0.01°≈15 分钟）——
// 太阳视黄经（J2000 儒略世纪 T 起算，含光行差 -0.00569 与章动修正）
export function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T; // 平黄经
  const M = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI) / 180; // 平近点角
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M); // 中心差
  const Omega = ((125.04 - 1934.136 * T) * Math.PI) / 180;
  return (((L0 + C - 0.00569 - 0.00478 * Math.sin(Omega)) % 360) + 360) % 360;
}

// 本地（UTC+8）时刻 → JD（复用 jdn；hour 为本地小时 0-24）
export function localJd(y, m, d, hour) {
  return jdn(y, m, d) - 0.5 + (hour - 8) / 24;
}

// JD → 本地（UTC+8）格里历日期
export function jdToLocalDate(jd) {
  const n = Math.floor(jd + 0.5 + 8 / 24 + 1e-9); // 本地日期的 JDN
  const a = n + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    y: 100 * b + d - 4800 + Math.floor(m / 10),
    m: m + 3 - 12 * Math.floor(m / 10),
    d: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

// 角度差归一到 (-180, 180]
const diff360 = (a, b) => {
  const x = (((a - b) % 360) + 360) % 360;
  return x > 180 ? x - 360 : x;
};

// 牛顿迭代求太阳黄经 = targetLon 的时刻 JD（初值 guessJd 附近，太阳每日黄经 ~0.9856°）
function sunCross(targetLon, guessJd) {
  let jd = guessJd;
  for (let i = 0; i < 6; i++) {
    const f = diff360(sunLongitude(jd), targetLon);
    if (Math.abs(f) < 1e-5) break;
    jd -= f / 0.9856;
  }
  return jd;
}

// 某年某黄经交节（节或气）的本地日期 { y, m, d }
export function jieMoment(year, lon) {
  const jan1 = localJd(year, 1, 1, 12);
  const T = (jan1 - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  let jd = sunCross(lon, jan1 + diff360(lon, L0) / 0.9856); // 平黄经反推初值
  for (let i = 0; i < 3; i++) {
    const { y } = jdToLocalDate(jd);
    if (y === year) break;
    jd = sunCross(lon, jd + (year - y) * 365.2422); // 平移归位到该年份交节
  }
  return jdToLocalDate(jd);
}

// 日干支（精确）：(JDN + 49) mod 60
export function dayGanZhi(y, m, d) {
  const j = jiaziAt(jdn(y, m, d) + 49);
  return { name: j.name, nian: j.nian };
}

// 月建支（精确节气）：取最晚 ≤ 日期的交节；1 月初早于小寒归上一轮大雪 → 子
export function jieZhi(y, m, d) {
  const dateNum = y * 10000 + m * 100 + d;
  let bestNum = -Infinity;
  let bestZhi = '子';
  const consider = (yy, lon, zhi) => {
    const mo = jieMoment(yy, lon);
    const num = mo.y * 10000 + mo.m * 100 + mo.d;
    if (num <= dateNum && num > bestNum) {
      bestNum = num;
      bestZhi = zhi;
    }
  };
  JIE_LON.forEach((j) => consider(y, j.lon, j.zhi));
  consider(y - 1, 255, '子'); // 上年大雪（1 月初兜底）
  return bestZhi;
}

// 年干支：立春（精确）为年界，立春前归上年（如 2025 立春 2/3，则 2/3 起即乙巳年）
export function yearGanZhiAt(y, m, d) {
  const lichun = jieMoment(y, 315); // 该年立春精确交节日
  const yy = m < lichun.m || (m === lichun.m && d < lichun.d) ? y - 1 : y;
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
