// 校验 二十四山结构 + 飞星逻辑（随任务逐步扩充）
// 运行：node scripts/verify-fengshui.mjs
import { mountains, yunPeriods } from '../src/data/luopan.js';
import {
  stars,
  overallJudgments,
  specialPositions as specialPositionTexts,
} from '../src/data/flyingStars.js';
import {
  buildPan,
  yunPan,
  shanPan,
  xiangPan,
  PALACE_NUM,
  oppositeMountain,
  overallJudge,
  specialPositions,
  palaceJudges,
} from '../src/utils/fengShui.js';
import { fuXiRing } from '../src/utils/fuXiOrder.js';

let failed = false;
const check = (cond, msg) => {
  if (!cond) {
    console.error('✗ ' + msg);
    failed = true;
  }
};

// —— 三元九运 ——
check(yunPeriods.length === 9, `三元九运应为 9 条，实为 ${yunPeriods.length}`);

// —— 二十四山结构 ——
check(mountains.length === 24, `二十四山数量错误：${mountains.length}`);
const angles = mountains.map((m) => m.angle);
check(
  angles.every((a, i) => a === i * 15),
  '二十四山角度应每 15° 连续（0,15,…,345）'
);
const byPalace = {};
for (const m of mountains) (byPalace[m.palace] ||= []).push(m.name);
check(
  Object.keys(byPalace).length === 8,
  `应恰好 8 宫，实为 ${Object.keys(byPalace).length}`
);
for (const [pal, names] of Object.entries(byPalace)) {
  check(names.length === 3, `${pal}宫应管 3 山，实为 ${names.join(',')}`);
}

// 三元龙阴阳口诀：阴 = 子午卯酉 + 辰戌丑未 + 癸丁乙辛；阳 = 乾坤艮巽 + 甲庚丙壬 + 寅申巳亥
const YIN = new Set([
  '子',
  '午',
  '卯',
  '酉',
  '辰',
  '戌',
  '丑',
  '未',
  '癸',
  '丁',
  '乙',
  '辛',
]);
const YANG = new Set([
  '乾',
  '巽',
  '艮',
  '坤',
  '甲',
  '庚',
  '丙',
  '壬',
  '寅',
  '申',
  '巳',
  '亥',
]);
for (const m of mountains) {
  const okYin = YIN.has(m.name) && m.yinYang === '阴';
  const okYang = YANG.has(m.name) && m.yinYang === '阳';
  check(okYin || okYang, `${m.name} 三元龙阴阳与口诀不符`);
}

// —— 九星/断语表完整（Task 2 填充后生效）——
check(stars.length === 9, `九星表应为 9 条，实为 ${stars.length}`);
check(Object.keys(overallJudgments).length >= 7, '大局断语表不足 7 类');
check(Object.keys(specialPositionTexts).length >= 4, '特殊位文案不足 4 项');

// —— 飞星盘结构 ——
const isPermutation = (obj) => {
  const vals = Object.values(obj);
  return (
    vals.length === 9 &&
    new Set(vals).size === 9 &&
    vals.every((v) => v >= 1 && v <= 9)
  );
};
for (let period = 1; period <= 9; period++) {
  const yun = yunPan(period);
  check(yun['中'] === period, `${period}运 运盘中心应为 ${period}`);
  check(isPermutation(yun), `${period}运 运盘应为 1-9 排列`);
  for (const m of mountains) {
    check(
      isPermutation(shanPan(m.name, yun)),
      `${period}运 ${m.name}山 山盘应为 1-9 排列`
    );
    check(
      isPermutation(xiangPan(m.name, yun)),
      `${period}运 ${m.name}向 向盘应为 1-9 排列`
    );
  }
}
// 对宫互补抽样：子↔午、乾↔巽
check(oppositeMountain('子') === '午', '子之对宫应为午');
check(oppositeMountain('乾') === '巽', '乾之对宫应为巽');

// —— 判断函数 sanity ——
const pan9 = buildPan('子', '午', 9);
check(
  overallJudge(pan9, '子', '午', 9) !== 'wangshan',
  '九运子山午向不应为旺山旺向（一运九运无旺山旺向）'
);
check(palaceJudges(pan9, 9).length === 9, 'palaceJudges 应返回 9 宫');
check(
  palaceJudges(pan9, 9).every((j) => j.brief && j.brief.length > 0),
  '每宫断语 brief 不应为空'
);
const sp = specialPositions(pan9, 9);
check(
  sp.cai !== undefined &&
    sp.wen !== undefined &&
    sp.bing !== undefined &&
    sp.sha !== undefined,
  '九运盘应四特殊位齐备'
);

// 平局可达性：全扫 9运×24山×23向（向首须对宫之外的全组合），overallJudge 必须能产出 'ping' 且均为合法 key
// 注：向首=对宫的 216 例恒为四象限结果（旺山/上山/双星到向/双星到山），ping 只出现在非对宫组合中。
const judgeKeys = new Set(Object.keys(overallJudgments));
const seenJudges = new Set();
for (let period = 1; period <= 9; period++) {
  for (const shan of mountains) {
    for (const xiang of mountains) {
      if (shan.name === xiang.name) continue;
      const key = overallJudge(
        buildPan(shan.name, xiang.name, period),
        shan.name,
        xiang.name,
        period
      );
      seenJudges.add(key);
      check(
        judgeKeys.has(key),
        `${period}运 ${shan.name}山${xiang.name}向 大局 key 非法：${key}`
      );
    }
  }
}
check(seenJudges.has('ping'), 'overallJudge 全扫应能产出平局（ping 可达）');

// —— 已知案例回归（已手算 + 文献核对）——
// 五运子山午向 = 旺山旺向（山星1入中逆、向星9入中逆，旺星5双到山向）
{
  const pan = buildPan('子', '午', 5);
  check(
    overallJudge(pan, '子', '午', 5) === 'wangshan',
    '五运子山午向应为旺山旺向'
  );
  check(pan.shan['坎'] === 5, '五运子山午向 山盘旺星5应在坎(坐山)');
  check(pan.xiang['离'] === 5, '五运子山午向 向盘旺星5应在离(向首)');
}
// 八运乾山巽向 = 旺山旺向（山星9逆、向星7逆；区分同元龙法 vs 简化阴阳法）
{
  const pan = buildPan('乾', '巽', 8);
  check(
    overallJudge(pan, '乾', '巽', 8) === 'wangshan',
    '八运乾山巽向应为旺山旺向'
  );
  check(pan.shan['乾'] === 8, '八运乾山巽向 山盘旺星8应在乾(坐山)');
  check(pan.xiang['巽'] === 8, '八运乾山巽向 向盘旺星8应在巽(向首)');
}
// 七运子山午向 = 全局合十（每宫运星+山星=10）
{
  const pan = buildPan('子', '午', 7);
  for (const [pal, y] of Object.entries(pan.yun)) {
    check(
      y + pan.shan[pal] === 10,
      `七运子山午向 ${pal}宫 运星+山星应=10，实为 ${y + pan.shan[pal]}`
    );
  }
}
// 九运子山午向：山盘5入中逆、向盘4入中顺 —— 全盘核对
{
  const pan = buildPan('子', '午', 9);
  check(pan.shan['中'] === 5, '九运子山午向 山盘入中应为5');
  check(pan.xiang['中'] === 4, '九运子山午向 向盘入中应为4');
  const expectedShan = {
    中: 5,
    乾: 4,
    兑: 3,
    艮: 2,
    离: 1,
    坎: 9,
    坤: 8,
    震: 7,
    巽: 6,
  };
  for (const [pal, v] of Object.entries(expectedShan)) {
    check(
      pan.shan[pal] === v,
      `九运子山午向 山盘${pal}应为${v}，实为${pan.shan[pal]}`
    );
  }
  const expectedXiang = {
    中: 4,
    乾: 5,
    兑: 6,
    艮: 7,
    离: 8,
    坎: 9,
    坤: 1,
    震: 2,
    巽: 3,
  };
  for (const [pal, v] of Object.entries(expectedXiang)) {
    check(
      pan.xiang[pal] === v,
      `九运子山午向 向盘${pal}应为${v}，实为${pan.xiang[pal]}`
    );
  }
}

// —— 先天六十四卦圆环 ——
check(fuXiRing.length === 64, `先天卦环应为 64 卦，实为 ${fuXiRing.length}`);
check(new Set(fuXiRing.map((x) => x.name)).size === 64, '先天卦环卦名不应重复');
const g0 = fuXiRing.find((x) => x.angle === 0);
check(g0 && g0.name === '乾', '先天卦环 0° 应为乾');
const g180 = fuXiRing.find((x) => x.angle === 180);
check(g180 && g180.name === '坤', '先天卦环 180° 应为坤');
const ringAngles = fuXiRing.map((x) => x.angle).sort((a, b) => a - b);
check(
  ringAngles.every((a, i) => a === i * (360 / 64)),
  '先天卦环角度应每 5.625° 连续'
);

if (failed) process.exit(1);
console.log('✓ 二十四山结构 / 三元九运 / 断语表完整性 校验通过');
