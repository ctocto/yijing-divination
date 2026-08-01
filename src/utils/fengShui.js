// 玄空飞星纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { mountains } from '../data/luopan.js';
import { stars } from '../data/flyingStars.js';

// 宫位：3×3 盘面按行展开（南在上）
export const PALACES = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];
// 宫 → 洛书数
export const PALACE_NUM = {
  坎: 1,
  坤: 2,
  震: 3,
  巽: 4,
  中: 5,
  乾: 6,
  兑: 7,
  艮: 8,
  离: 9,
};
// 洛书飞布顺序：从中出发，顺飞星数 +1 递增；逆飞星数 −1 递减（宫位顺序不变）
export const FLY_ORDER = ['中', '乾', '兑', '艮', '离', '坎', '坤', '震', '巽'];
// 元旦盘原卦：星 → 卦宫（五黄居中无原卦）
export const STAR_TRIGRAM = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
};

const mtn = (name) => mountains.find((m) => m.name === name);

// 角度 → 最近 15° 山名
export function mountainAt(deg) {
  const norm = ((deg % 360) + 360) % 360;
  const snapped = (Math.round(norm / 15) * 15) % 360;
  return mountains.find((m) => m.angle === snapped).name;
}

// 对宫（相差 180°）
export function oppositeMountain(name) {
  return mountainAt((mtn(name).angle + 180) % 360);
}

// 入中星飞布：forward=true 顺飞（+1），false 逆飞（−1），星数 1..9 循环
export function flyFromCenter(centerStar, forward) {
  const res = {};
  FLY_ORDER.forEach((palace, i) => {
    const raw = centerStar + (forward ? i : -i);
    res[palace] = ((((raw - 1) % 9) + 9) % 9) + 1;
  });
  return res;
}

// 运盘：元星入中顺飞
export function yunPan(period) {
  return flyFromCenter(period, true);
}

// 山盘/向盘顺逆判定 —— 玄空「同元龙法」
// 入中星 ≠ 5：查该星元旦盘原卦，取原卦三山中与坐山/向首同元龙的一山，其阴阳定顺逆。
// 入中星 = 5：五黄无原卦，依坐山/向首本身阴阳定顺逆。
function directionOf(mountain, centerStar) {
  const m = mtn(mountain);
  if (centerStar === 5) return m.yinYang === '阳';
  const trigram = STAR_TRIGRAM[centerStar];
  const sameDragon = mountains.find(
    (x) => x.palace === trigram && x.dragon === m.dragon
  );
  return sameDragon.yinYang === '阳';
}

// 山盘：坐山宫位的运星入中
export function shanPan(shan, yun) {
  const center = yun[mtn(shan).palace];
  return flyFromCenter(center, directionOf(shan, center));
}

// 向盘：向首宫位的运星入中
export function xiangPan(xiang, yun) {
  const center = yun[mtn(xiang).palace];
  return flyFromCenter(center, directionOf(xiang, center));
}

// 完整盘
export function buildPan(shan, xiang, period) {
  const yun = yunPan(period);
  return { yun, shan: shanPan(shan, yun), xiang: xiangPan(xiang, yun) };
}

// 大局判断：按当运旺星落点四象限 + 伏吟/反吟
export function overallJudge(pan, shan, xiang, period) {
  const shanPalace = mtn(shan).palace;
  const xiangPalace = mtn(xiang).palace;
  const findStar = (which, star) =>
    Object.keys(pan[which]).find((k) => pan[which][k] === star);
  const shanStarPalace = findStar('shan', period);
  const xiangStarPalace = findStar('xiang', period);
  const atShan = (p) => p === shanPalace;
  const atXiang = (p) => p === xiangPalace;
  if (atShan(shanStarPalace) && atXiang(xiangStarPalace)) return 'wangshan';
  if (atXiang(shanStarPalace) && atShan(xiangStarPalace)) return 'shangshan';
  if (atXiang(shanStarPalace) && atXiang(xiangStarPalace)) return 'shuangXiang';
  if (atShan(shanStarPalace) && atShan(xiangStarPalace)) return 'shuangShan';
  // 伏吟：星与宫同数；反吟：星与宫数合十
  const fu = PALACES.find(
    (p) => pan.shan[p] === PALACE_NUM[p] || pan.xiang[p] === PALACE_NUM[p]
  );
  if (fu) return 'fuyin';
  const fan = PALACES.find(
    (p) =>
      pan.shan[p] + PALACE_NUM[p] === 10 || pan.xiang[p] + PALACE_NUM[p] === 10
  );
  if (fan) return 'fanyin';
  return 'ping';
}

// 特殊位：财位（向盘当运旺星或生气星所到宫）、文昌（运盘四绿）、病符（运盘二黑）、五黄煞（运盘五黄）
export function specialPositions(pan, period) {
  const shengQi = (period % 9) + 1;
  const findStar = (which, star) =>
    Object.keys(pan[which]).find((k) => pan[which][k] === star);
  return {
    cai: findStar('xiang', period) || findStar('xiang', shengQi),
    wen: findStar('yun', 4),
    bing: findStar('yun', 2),
    sha: findStar('yun', 5),
  };
}

// 每宫断语：档位 + 主星当运/失令文案
export function palaceJudges(pan, period) {
  const shengQi = (period % 9) + 1;
  return PALACES.map((palace) => {
    const y = pan.yun[palace];
    const s = pan.shan[palace];
    const x = pan.xiang[palace];
    let level;
    if (s === 5 || x === 5) level = '煞';
    else if (s === period || x === period) level = '旺';
    else if (s === shengQi || x === shengQi) level = '吉';
    else if (s === 2 || x === 2) level = '凶';
    else level = '平';
    const pick =
      level === '煞'
        ? 5
        : level === '旺'
          ? period
          : level === '吉'
            ? shengQi
            : level === '凶'
              ? 2
              : x;
    const info = stars.find((v) => v.star === pick);
    const isDang = pick === period || pick === shengQi;
    return {
      palace,
      yun: y,
      shan: s,
      xiang: x,
      level,
      brief: isDang ? info.dangYun : info.shiLing,
    };
  });
}
