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
import { mansions } from '../src/data/mansions.js';
import { jiazi } from '../src/data/jiazi.js';
import {
  humanMountains,
  heavenMountains,
  solarTerms,
  degreeTicks,
} from '../src/data/luopan.js';
import {
  termAt,
  jiaziAt,
  hexagramAt,
  mansionAt,
  plateMountainAt,
} from '../src/utils/luopanRead.js';
import { RING_TYPES, MODES, modeRings } from '../src/data/luopanRings.js';
import {
  LINE_CYCLE,
  lineStart,
  baSha,
  BRANCH_ANGLE,
  sanYuanLong,
  shaJudgments,
  baShaText,
} from '../src/data/shaData.js';
import {
  mansionShengAt,
  lineWuxingAt,
  judgeSha,
  judgeAllSha,
  baShaAt,
  fenFang,
  fenFangByMountain,
  mansionAtDetail,
} from '../src/utils/sha.js';
import {
  shuangshan,
  JUS,
  CHANGSHENG_ORDER,
  CHANGSHENG_JUDGE,
} from '../src/data/shuiData.js';
import {
  shuangshanAt,
  judgeJu,
  changshengMap,
  positionAt,
  judgeShui,
} from '../src/utils/shui.js';

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

// —— 三盘三针 ——
check(
  humanMountains.length === 24,
  `人盘中针应 24 山，实为 ${humanMountains.length}`
);
check(
  heavenMountains.length === 24,
  `天盘缝针应 24 山，实为 ${heavenMountains.length}`
);
check(
  humanMountains.every(
    (m) => m.name === mountains[humanMountains.indexOf(m)].name
  ),
  '人盘中针山名应与地盘一致'
);
check(
  humanMountains[0].angle === 352.5,
  `人盘中针子山应为 352.5°（-7.5），实为 ${humanMountains[0].angle}`
);
check(
  heavenMountains[0].angle === 7.5,
  `天盘缝针子山应为 7.5°（+7.5），实为 ${heavenMountains[0].angle}`
);

// —— 二十四节气 ——
check(
  solarTerms.length === 24,
  `二十四节气应为 24 条，实为 ${solarTerms.length}`
);
check(
  solarTerms[0].name === '冬至' && solarTerms[0].angle === 0,
  '冬至应在 0°'
);
check(
  solarTerms.every((t, i) => t.angle === i * 15),
  '二十四节气应每 15° 连续'
);

// —— 周天度数 ——
check(
  degreeTicks.length === 360,
  `周天度数应为 360 刻度，实为 ${degreeTicks.length}`
);
check(degreeTicks[0].big && degreeTicks[0].label === '0', '0° 应为大字标注');
check(
  degreeTicks.filter((t) => t.major).length === 24,
  `15° 主刻度应 24 个，实为 ${degreeTicks.filter((t) => t.major).length}`
);
check(
  degreeTicks.filter((t) => t.big).length === 4,
  `90° 大字应 4 个，实为 ${degreeTicks.filter((t) => t.big).length}`
);

// —— 二十八宿 ——
check(mansions.length === 28, `二十八宿应为 28 条，实为 ${mansions.length}`);
const xiangSet = new Set(mansions.map((m) => m.xiang));
check(xiangSet.size === 4, `二十八宿应分四象，实为 ${xiangSet.size} 象`);
const sumDeg = mansions.reduce((s, m) => s + m.degree, 0);
check(
  sumDeg >= 355 && sumDeg <= 370,
  `二十八宿古度和应约 360（含闰度），实为 ${sumDeg}`
);
const names = mansions.map((m) => m.name);
check(new Set(names).size === 28, '二十八宿宿名不应重复');
// 四象各恰 7 宿
for (const x of xiangSet) {
  const cnt = mansions.filter((m) => m.xiang === x).length;
  check(cnt === 7, `${x} 应恰 7 宿，实为 ${cnt}`);
}

// —— 六十甲子 ——
check(jiazi.length === 60, `六十甲子应为 60 条，实为 ${jiazi.length}`);
check(jiazi[0].name === '甲子' && jiazi[0].angle === 0, '甲子应在 0°');
check(
  jiazi.every((j, i) => j.angle === i * 6),
  '六十甲子应每 6° 连续'
);
check(
  jiazi.every((j) => j.nian && j.nian.length > 0),
  '每柱应有纳音'
);
// 每两柱共享同一纳音（甲子/乙丑同、丙寅/丁卯同…），相邻组纳音不同
for (let i = 0; i < jiazi.length; i += 2) {
  check(
    jiazi[i].nian === jiazi[i + 1].nian,
    `${jiazi[i].name} 与 ${jiazi[i + 1].name} 应共享纳音`
  );
  if (i + 2 < jiazi.length) {
    check(
      jiazi[i].nian !== jiazi[i + 2].nian,
      `${jiazi[i].name} 与 ${jiazi[i + 2].name} 相邻组纳音应不同`
    );
  }
}

// —— 读数工具 ——
check(termAt(0) === '冬至', '0° 节气应为冬至');
check(termAt(90) === '春分', '90° 节气应为春分');
check(jiaziAt(0) === '甲子', '0° 甲子应为甲子');
check(jiaziAt(12) === '丙寅', '12° 甲子应为丙寅');
check(hexagramAt(0) === '乾', '0° 卦应为乾');
check(hexagramAt(180) === '坤', '180° 卦应为坤');
check(mansionAt(0) === '角', '0° 宿应为角');
check(plateMountainAt(352.5, humanMountains) === '子', '人盘 352.5° 应为子');

// —— 圈配置与模式映射 ——
check(MODES.length === 5, `应 5 个模式，实为 ${MODES.length}`);
check(new Set(MODES.map((m) => m.id)).size === 5, '模式 id 不应重复');
for (const m of MODES) {
  const rings = modeRings[m.id];
  check(rings && rings.length > 0, `模式 ${m.id} 应有圈集`);
  for (const r of rings) {
    check(r in RING_TYPES, `模式 ${m.id} 引用了未定义圈 ${r}`);
  }
}
check(modeRings.ding.includes('earth'), '定向模式应含地盘正针');
check(modeRings.gua.includes('hexagrams'), '易卦模式应含六十四卦');

// —— 宿主五行（消砂）——
check(
  mansions.length === 28 && mansions.every((m) => m.sheng),
  '二十八宿应全部有宿主五行'
);
const HOST = {
  角: '木',
  亢: '金',
  氐: '土',
  房: '火',
  心: '火',
  尾: '火',
  箕: '水',
  斗: '木',
  牛: '金',
  女: '土',
  虚: '火',
  危: '火',
  室: '火',
  壁: '水',
  奎: '木',
  娄: '金',
  胃: '土',
  昴: '火',
  毕: '火',
  觜: '火',
  参: '水',
  井: '木',
  鬼: '金',
  柳: '土',
  星: '火',
  张: '火',
  翼: '火',
  轸: '水',
};
check(
  mansions.every((m) => m.sheng === HOST[m.name]),
  '宿主五行应满足 木金土火火火水 循环（日/月→火）'
);
// 宿主五行 = 七曜 日/月→火，其余同 wuxing
check(
  mansions.every((m) =>
    m.wuxing === '日' || m.wuxing === '月'
      ? m.sheng === '火'
      : m.sheng === m.wuxing
  ),
  '宿主五行应满足：七曜 日/月→火，其余同 wuxing'
);

// —— 消砂数据 ——
check(LINE_CYCLE.join('') === '金木水火土', '线度五行循环应为 金木水火土');
check(
  Object.keys(lineStart).length === 28,
  `线度五行起度应覆盖 28 宿，实为 ${Object.keys(lineStart).length}`
);
check(
  mansions.every((m) => m.name in lineStart),
  '每宿都应有线度五行起度'
);
// 五组起度五行核对（星属木组、虚属金组）
const startWuxing = { 金: 0, 木: 1, 水: 2, 火: 3, 土: 4 };
const GROUP = {
  金: ['井', '鬼', '室', '参', '娄', '亢', '虚', '氐', '箕', '斗'],
  木: ['心', '星', '房'],
  水: ['张', '奎', '胃', '昴', '牛', '尾'],
  火: ['角', '壁', '毕', '柳'],
  土: ['翼', '轸', '觜', '危', '女'],
};
for (const [wx, names] of Object.entries(GROUP)) {
  check(
    names.every((n) => lineStart[n] === startWuxing[wx]),
    `${wx}组起度应为 ${wx}`
  );
}
const allStart = Object.values(GROUP).flat();
check(new Set(allStart).size === 28, '五组应覆盖 28 宿且不重复');
check(
  Object.keys(baSha).length === 8,
  `八煞应 8 卦，实为 ${Object.keys(baSha).length}`
);
check(Object.keys(BRANCH_ANGLE).length === 12, '地支方位应 12 支');
check(
  Object.values(BRANCH_ANGLE)
    .sort((a, b) => a - b)
    .every((a, i) => a === i * 30),
  '十二地支应每 30° 连续'
);
const sanYuanDirs = [
  ...sanYuanLong.天元.dirs,
  ...sanYuanLong.地元.dirs,
  ...sanYuanLong.人元.dirs,
];
check(new Set(sanYuanDirs).size === 24, '三元龙应覆盖 24 山');
check(
  ['sheng', 'wang', 'cai', 'xie', 'sha'].every(
    (k) => shaJudgments[k] && shaJudgments[k].text
  ),
  '五种砂断语应齐全'
);
check(baShaText.length > 0, '八煞提示文案不应为空');

// —— 消砂算法 ——
// 宿度边界按古度 366 比例归一至 360°：角0-11.8 亢11.8-20.7 …（verify 断言按归一后边界取角）
check(mansionAtDetail(0).mansion.name === '角', '0° 应在角宿');
check(
  mansionAtDetail(180).mansion.name === '奎',
  '180° 归一后应在奎宿（古度 168-186）'
);
check(mansionShengAt(0) === '木', '0°（角宿）宿主五行应为木');
check(
  mansionShengAt(45) === '火',
  '45° 归一后在心宿（40-45°），宿主五行应为火'
);
check(
  lineWuxingAt(0) === '火',
  '坐子（角宿第 1 度）线度五行应为火（角属火组起度火）'
);
check(judgeSha('木', '木') === 'wang', '同我 → 旺砂');
check(judgeSha('木', '水') === 'sheng', '水生木 → 生砂');
check(judgeSha('木', '土') === 'cai', '木克土 → 财砂');
check(judgeSha('木', '火') === 'xie', '木生火 → 泄砂');
check(judgeSha('木', '金') === 'sha', '金克木 → 煞砂');
const allSha = judgeAllSha(0);
check(allSha.length === 8, `八方砂应 8 条，实为 ${allSha.length}`);
check(
  allSha.every((s) => s.dir && s.name && s.text),
  '每条砂应含 方位/砂名/断语'
);
check(baShaAt(0) && baShaAt(0).branch === '辰', '坐坎八煞应为辰');
check(fenFang(0).length === 3, '子方应属天元龙（应 3 房）');
check(fenFangByMountain('子').join('/') === '1/4/7', '天元山应房应为 1/4/7');
check(fenFangByMountain('壬').join('/') === '2/5/8', '地元山应房应为 2/5/8');
check(fenFangByMountain('癸').join('/') === '3/6/9', '人元山应房应为 3/6/9');
const shaRow0 = judgeAllSha(0)[0];
check(shaRow0.fang.length === 3, '每卦宫应房应含 3 山');
check(
  shaRow0.fang.every((f) => Array.isArray(f.fang) && f.fang.length === 3),
  '每山应房应为 3 个数'
);
check(
  new Set(shaRow0.fang.map((f) => f.fang.join('/'))).size === 3,
  '卦宫 3 山应房应有区分度（地/天/人元各一）'
);

// —— 纳水数据 ——
check(shuangshan.length === 12, `双山应 12 组，实为 ${shuangshan.length}`);
check(
  shuangshan.every((s, i) => s.angle === i * 30),
  '双山中心角应每 30° 连续'
);
// 三合五行 → 局归属：水局=坤申壬子乙辰、火局=艮寅丙午辛戌、金局=巽巳庚酉癸丑、木局=乾亥甲卯丁未
const JU_GROUP = {
  水: ['坤申', '壬子', '乙辰'],
  火: ['艮寅', '丙午', '辛戌'],
  金: ['巽巳', '庚酉', '癸丑'],
  木: ['乾亥', '甲卯', '丁未'],
};
for (const [ju, names] of Object.entries(JU_GROUP)) {
  check(
    names.every((n) => shuangshan.find((s) => s.name === n)?.wuxing === ju),
    `${ju}局双山五行应全部为 ${ju}`
  );
}
const allShuangshan = Object.values(JU_GROUP).flat();
check(new Set(allShuangshan).size === 12, '四局应覆盖 12 双山且不重复');
check(JUS.length === 4, `应 4 局，实为 ${JUS.length}`);
const JU_ANCHOR = {
  木: { changsheng: '乾亥', diwang: '甲卯', muku: '丁未' },
  火: { changsheng: '艮寅', diwang: '丙午', muku: '辛戌' },
  水: { changsheng: '坤申', diwang: '壬子', muku: '乙辰' },
  金: { changsheng: '巽巳', diwang: '庚酉', muku: '癸丑' },
};
check(
  JUS.every((j) => {
    const a = JU_ANCHOR[j.name];
    return (
      a &&
      j.changsheng === a.changsheng &&
      j.diwang === a.diwang &&
      j.muku === a.muku
    );
  }),
  '四局长生/帝旺/墓库应与权威表一致'
);
check(
  CHANGSHENG_ORDER.length === 12 &&
    CHANGSHENG_ORDER[0] === '长生' &&
    CHANGSHENG_ORDER[11] === '养',
  '十二长生序应 12 位（长生起养止）'
);
check(
  CHANGSHENG_ORDER.every((p) => CHANGSHENG_JUDGE[p]),
  '十二长生每位都应有吉凶断语'
);

// —— 纳水算法 ——
check(shuangshanAt(0) === '壬子', '0° 应在壬子双山');
check(shuangshanAt(240) === '坤申', '240° 应在坤申双山');
check(judgeJu(0).ju === '水', '坐壬子应定水局');
check(judgeJu(0).changshengName === '坤申', '水局长生应为坤申');
// 水局顺排（左水倒右）：长生坤申 帝旺壬子 墓库乙辰
const leftMap = changshengMap('水', 'left');
check(leftMap['坤申'] === '长生', '水局左倒右坤申应为长生');
check(leftMap['壬子'] === '帝旺', '水局左倒右壬子应为帝旺');
check(leftMap['乙辰'] === '墓', '水局左倒右乙辰应为墓');
// 水局逆排（右水倒左）：长生坤申 逆布，沐浴在丁未
const rightMap = changshengMap('水', 'right');
check(rightMap['坤申'] === '长生', '水局右倒左坤申仍为长生');
check(rightMap['丁未'] === '沐浴', '水局右倒左丁未应为沐浴（逆布）');
check(leftMap['丁未'] !== rightMap['丁未'], '阳顺阴逆排布应有差异');
check(positionAt(leftMap, 240) === '长生', '240° 水局顺排应为长生');
// 完整用例：坐壬子水局 左倒右 来水坤申(长生吉) 去水乙辰(墓库吉)
const r = judgeShui(0, 240, 120, 'left');
check(
  r.ju === '水' && r.inPos === '长生' && r.outPos === '墓',
  '坐壬子来坤申去乙辰 应为 长生/墓'
);
check(r.inLai === '吉' && r.outQu === '吉', '长生来水吉 墓库去水吉');
check(r.summary.includes('迎生接旺'), '总评应含迎生接旺');

if (failed) process.exit(1);
console.log(
  '✓ 二十四山/三盘三针/节气/度数/二十八宿/六十甲子/卦环/读数/圈映射/飞星逻辑/纳水数据 校验通过'
);
