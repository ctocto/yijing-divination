// 择日读盘直断纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { jiazi } from '../data/jiazi.js';
import { termMonth, jianChu, huangDao } from '../data/zeriData.js';

// 十二地支序（子0 丑1 寅2 … 亥11）
const BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

// 甲子名末字 = 日支（甲子→子、乙丑→丑…癸亥→亥）
export function dayBranch(jiaziName) {
  return jiaziName.slice(-1);
}

// 节气 → 月建支
export function monthBranch(term) {
  return termMonth[term] ?? '';
}

// 序差：月支起建，顺数到日支 → 建除索引（0=建、10=开）
export function jianChuIndex(monthB, dayB) {
  const m = BRANCHES.indexOf(monthB);
  const d = BRANCHES.indexOf(dayB);
  return (d - m + 12) % 12;
}

// 择日判断：建除十二神（含宜忌）+ 黄道黑道（含吉凶）+ 纳音
export function judgeZeri(term, jiaziName) {
  const mB = monthBranch(term);
  const dB = dayBranch(jiaziName);
  const idx = jianChuIndex(mB, dB);
  const jz = jiazi.find((j) => j.name === jiaziName);
  return {
    monthB: mB,
    dayB: dB,
    jianChu: jianChu[idx],
    huangDao: huangDao[idx],
    nian: jz ? jz.nian : '',
  };
}
