// 120 分金：每山 5 槽 × 3°，二十四山共 120 槽合 360°
// 分金地支 = 前一位地支山（二十四山序中紧邻其逆时针方向的地支山；地支山本身用自己）
// 吉凶按纳甲口诀：甲壬阳孤乙癸虚，龟甲空亡戊己推，丙丁庚辛虽旺相
import { mountains } from './luopan.js';
import { jiazi } from './jiazi.js';

export const FENJIN_ZHI = {
  子: '子',
  癸: '子',
  丑: '丑',
  艮: '丑',
  寅: '寅',
  甲: '寅',
  卯: '卯',
  乙: '卯',
  辰: '辰',
  巽: '辰',
  巳: '巳',
  丙: '巳',
  午: '午',
  丁: '午',
  未: '未',
  坤: '未',
  申: '申',
  庚: '申',
  酉: '酉',
  辛: '酉',
  戌: '戌',
  乾: '戌',
  亥: '亥',
  壬: '亥',
};

// 干序：阳支隔位排 甲丙戊庚壬，阴支隔位排 乙丁己辛癸
export const GAN_SEQ = {
  阳: ['甲', '丙', '戊', '庚', '壬'],
  阴: ['乙', '丁', '己', '辛', '癸'],
};

const LEVEL_BY_GAN = {
  甲: '孤',
  壬: '孤',
  乙: '虚',
  癸: '虚',
  戊: '龟甲',
  己: '龟甲',
  丙: '旺相',
  丁: '旺相',
  庚: '旺相',
  辛: '旺相',
};

const YANG_ZHI = new Set(['子', '寅', '辰', '午', '申', '戌']);

// 分金纳音：名 → 六十甲子纳音
const nianOf = (name) => jiazi.find((j) => j.name === name)?.nian ?? '';
const seqOf = (zhi) => GAN_SEQ[YANG_ZHI.has(zhi) ? '阳' : '阴'];

export const fenjin120 = mountains.flatMap((m) => {
  const zhi = FENJIN_ZHI[m.name];
  return seqOf(zhi).map((gan, i) => {
    const name = gan + zhi;
    return {
      mountain: m.name,
      index: i, // 0-4：第 1 槽=index0 … 第 5 槽=index4
      angle: (m.angle - 6 + i * 3 + 360) % 360, // 槽中心
      name,
      gan,
      zhi,
      level: LEVEL_BY_GAN[gan],
      nian: nianOf(name),
    };
  });
});

// 盘面只标 48 旺相（真罗盘即如此，孤虚/龟甲留空）
export const wangXiang48 = fenjin120.filter((f) => f.level === '旺相');
