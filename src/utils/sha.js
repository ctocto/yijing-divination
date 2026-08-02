// 消砂纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
// 赖公砂法：坐山线度五行为主（我），八方砂峰宿主五行为宾，五行生克断五种砂
import { mansions } from '../data/mansions.js';
import { mountains } from '../data/luopan.js';
import { mountainAt } from './fengShui.js';
import {
  LINE_CYCLE,
  lineStart,
  baSha,
  BRANCH_ANGLE,
  sanYuanLong,
  shaJudgments,
} from '../data/shaData.js';

const normalize = (a) => ((a % 360) + 360) % 360;

// 角度 → 所在宿 + 宿内古度偏移（古度 366 按比例归一 360）
export function mansionAtDetail(deg) {
  const total = mansions.reduce((s, m) => s + m.degree, 0);
  const scaled = (normalize(deg) / 360) * total;
  let acc = 0;
  for (const m of mansions) {
    if (scaled < acc + m.degree) {
      return { mansion: m, offset: scaled - acc };
    }
    acc += m.degree;
  }
  return {
    mansion: mansions[mansions.length - 1],
    offset: mansions[mansions.length - 1].degree,
  };
}

// 角度 → 宿主五行（砂峰用）
export function mansionShengAt(deg) {
  return mansionAtDetail(deg).mansion.sheng;
}

// 角度 → 线度五行（坐山用）：宿内第 n 度 = LINE_CYCLE[(起度 + n - 1) % 5]
export function lineWuxingAt(deg) {
  const { mansion, offset } = mansionAtDetail(deg);
  const n = Math.min(mansion.degree, Math.floor(offset) + 1);
  return LINE_CYCLE[(lineStart[mansion.name] + n - 1) % 5];
}

// 坐山五行 vs 一方砂五行 → 五种砂 key
// SHENG[x]=y 表示 x生y；KE[x]=y 表示 x克y
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

export function judgeSha(shanWuxing, shaWuxing) {
  if (shanWuxing === shaWuxing) return 'wang'; // 宾同我 → 旺砂
  if (SHENG[shaWuxing] === shanWuxing) return 'sheng'; // 宾生我 → 生砂
  if (KE[shanWuxing] === shaWuxing) return 'cai'; // 我克宾 → 财砂
  if (SHENG[shanWuxing] === shaWuxing) return 'xie'; // 我生宾 → 泄砂
  return 'sha'; // 剩者：宾克我 → 煞砂
}

// 8 卦方位（坎艮震巽离坤兑乾，每 45°，0°=坎/北）+ 各卦宫 3 山（顺时针序）
export const SHA_DIRECTIONS = [
  { deg: 0, name: '坎·北', mountains: ['壬', '子', '癸'] },
  { deg: 45, name: '艮·东北', mountains: ['丑', '艮', '寅'] },
  { deg: 90, name: '震·东', mountains: ['甲', '卯', '乙'] },
  { deg: 135, name: '巽·东南', mountains: ['辰', '巽', '巳'] },
  { deg: 180, name: '离·南', mountains: ['丙', '午', '丁'] },
  { deg: 225, name: '坤·西南', mountains: ['未', '坤', '申'] },
  { deg: 270, name: '兑·西', mountains: ['庚', '酉', '辛'] },
  { deg: 315, name: '乾·西北', mountains: ['戌', '乾', '亥'] },
];

// 八方砂：坐山 vs 8 方位砂，各断一次
// 注意：方位名用 dir（避免与 ...shaJudgments 的 name=砂名 冲突）
export function judgeAllSha(shanDeg) {
  const shanLine = lineWuxingAt(shanDeg);
  return SHA_DIRECTIONS.map(({ deg, name, mountains }) => {
    const shaWx = mansionShengAt(deg);
    const relation = judgeSha(shanLine, shaWx);
    return {
      deg,
      dir: name, // 方位名（坎·北）
      mansion: mansionAtDetail(deg).mansion.name,
      shaWx,
      relation,
      fang: mountains.map((m) => ({ name: m, fang: fenFangByMountain(m) })),
      ...shaJudgments[relation], // name=砂名、level、text
    };
  });
}

// 坐山八煞曜：坐山卦 → 煞曜地支 → 方位角
export function baShaAt(shanDeg) {
  const m = mountains.find((x) => x.name === mountainAt(shanDeg));
  if (!m || !baSha[m.palace]) return null;
  const branch = baSha[m.palace];
  return { branch, angle: BRANCH_ANGLE[branch] };
}

// 山名 → 三元龙 → 应房
export function fenFangByMountain(name) {
  for (const { dirs, fang } of Object.values(sanYuanLong)) {
    if (dirs.includes(name)) return fang;
  }
  return [];
}

// 方位角 → 三元龙 → 应房（保留兼容；八方砂用 fenFangByMountain）
export function fenFang(deg) {
  return fenFangByMountain(mountainAt(deg));
}
