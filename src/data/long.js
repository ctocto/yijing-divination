// 穿山七十二龙 / 透地六十龙（罗盘立向龙神层）
// 穿山（正针七十二龙）：每山 3 龙 × 5°，60 甲子 + 12 大空亡（八干四维正中）
//   甲子起地盘正针壬山最末一格（中心 350°），支分组排布：
//   地支山 = 丙/戊/庚（阳支）或 丁/己/辛（阴支）；干维山 = [前支后边干, 大空亡, 后支前边干]
// 透地（平分六十龙）：60 龙 × 6°，甲子起正针壬初（中心 340.5°），杨公五气脉断吉凶
import { mountains } from './luopan.js';
import { jiazi } from './jiazi.js';
import { LEVEL_BY_GAN } from './fenjin.js';

const ZHI_LIST = '子丑寅卯辰巳午未申酉戌亥'.split('');
const YANG_ZHI = new Set(['子', '寅', '辰', '午', '申', '戌']);
// 地支山中间三龙：阳支 丙戊庚 / 阴支 丁己辛
const MID_GAN = { 阳: ['丙', '戊', '庚'], 阴: ['丁', '己', '辛'] };
// 支组边干：前边干进「前干维山」末槽，后边干进「后干维山」首槽
const BEFORE_GAN = { 阳: '甲', 阴: '乙' };
const AFTER_GAN = { 阳: '壬', 阴: '癸' };

const nianOf = (name) => jiazi.find((j) => j.name === name)?.nian ?? '';

// 支分组填名：逐支 12 组，三龙入地支山，两边干入相邻干维山边槽
const nameGrid = Array.from({ length: 24 }, () => ['', '', '']);
ZHI_LIST.forEach((z, k) => {
  const gy = YANG_ZHI.has(z) ? '阳' : '阴';
  const mid = MID_GAN[gy].map((g) => g + z);
  const zhiM = 2 * k; // 地支山索引（子0 丑2 … 亥22）
  const preM = (2 * k - 1 + 24) % 24; // 前干维山（该支组前边干入末槽）
  const postM = (2 * k + 1) % 24; // 后干维山（后边干入首槽）
  nameGrid[zhiM] = mid;
  nameGrid[preM][2] = BEFORE_GAN[gy] + z;
  nameGrid[postM][0] = AFTER_GAN[gy] + z;
});
// 八干四维正中槽 = 大空亡（name 留空，罗盘标"正"或留空）
for (let i = 1; i < 24; i += 2) nameGrid[i][1] = '';

export const chuanShan72 = mountains.flatMap((m, mi) =>
  [0, 1, 2].map((si) => {
    const name = nameGrid[mi][si];
    const gan = name ? name[0] : '';
    const zhi = name ? name[1] : '';
    return {
      name,
      gan,
      zhi,
      level: gan ? LEVEL_BY_GAN[gan] : '大空亡',
      ji: gan ? (LEVEL_BY_GAN[gan] === '旺相' ? '吉' : '凶') : '凶',
      nian: gan ? nianOf(name) : '',
      angle: (m.angle - 5 + si * 5 + 360) % 360, // 槽中心
    };
  })
);

// 透地六十龙：杨公五气脉（甲子序每 12 一组：冷/正/败/旺/退）
const QI = ['冷', '正', '败', '旺', '退'];
const QI_LEVEL = ['孤', '旺', '煞', '相', '虚'];

export const touDi60 = jiazi.map((j, i) => {
  const g = Math.floor(i / 12);
  return {
    name: j.name,
    nian: j.nian,
    qi: QI[g],
    level: QI_LEVEL[g],
    ji: g === 1 || g === 3 ? '吉' : '凶', // 丙子旬/庚子旬 = 珠宝全吉
    angle: (j.angle + 340.5) % 360, // 甲子起壬初（中心 340.5°）
  };
});
