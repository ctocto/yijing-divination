// 易卦抽爻换象纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { hexagrams } from '../data/hexagrams.js';
import { fuXiRing } from './fuXiOrder.js';
import { trigrams } from '../data/trigrams.js';

// 玄空大卦先天配洛书数（与后天卦配洛书是两套系统，抽爻换象取前者）
const XUAN_KONG_LUO = {
  乾: 9,
  兑: 4,
  离: 3,
  震: 8,
  巽: 2,
  坎: 7,
  艮: 6,
  坤: 1,
};
// 三爻 binary（自下而上）→ 卦名
const TRIGRAM_BIN = {
  111: '乾',
  110: '兑',
  101: '离',
  100: '震',
  '011': '巽',
  '010': '坎',
  '001': '艮',
  '000': '坤',
};
// 河图生成数对（生数-成数）
const SHENGCHENG = { 1: 6, 2: 7, 3: 8, 4: 9, 6: 1, 7: 2, 8: 3, 9: 4 };
const SHENGCHENG_LABEL = {
  1: '一六共宗',
  2: '二七同道',
  3: '三八为朋',
  4: '四九为友',
};

const normalize = (a) => ((a % 360) + 360) % 360;
const STEP = 360 / 64; // 每卦 5.625°

// 爻名位序：index 0=初、1=二、2=三、3=四、4=五、5=上
const POSITIONS = ['初', '二', '三', '四', '五', '上'];

// 抽动爻：index 0=初爻 … 5=上爻，该位 0↔1 翻转
export function drawLine(binary, index) {
  if (index < 0 || index > 5) return binary;
  const arr = binary.split('');
  arr[index] = arr[index] === '1' ? '0' : '1';
  return arr.join('');
}

// 爻名：初/上两爻「位序+阴阳」（初九/上六），中位爻「阴阳+位序」（九二/六二）
export function lineName(binary, index) {
  if (index < 0 || index > 5) return '';
  const yinYang = binary[index] === '1' ? '九' : '六';
  if (index === 0 || index === 5) return POSITIONS[index] + yinYang;
  return yinYang + POSITIONS[index];
}

// 找卦：binary → hexagram 对象
export function hexagramByBinary(binary) {
  return hexagrams.find((h) => h.binary === binary);
}

// 抽爻断语：本卦卦辞/白话 + 动爻爻辞 + 变卦卦辞/白话
// lines[index] 已含「九二：」爻名前缀，直接复用
export function judgeChouYao(binary, index) {
  const ben = hexagramByBinary(binary);
  const bian = hexagramByBinary(drawLine(binary, index));
  if (!ben || !bian) return null;
  return {
    ben: ben.name,
    benPlain: ben.plain,
    line: ben.lines[index],
    bian: bian.name,
    bianText: bian.text,
    bianPlain: bian.plain,
  };
}

// 十字线角度 → 所压卦爻：最近卦中心 ±STEP/2 扇区内均分 6 爻（每爻 STEP/6 = 0.9375°）
// 简化口径：初爻居卦位起角（低角侧）、上爻止于终角（高角侧）；真实顺逆随内外卦阴阳，见设计文档范围边界。
export function yaoAt(deg) {
  const d = normalize(deg);
  let best = fuXiRing[0];
  let bestDiff = Infinity;
  for (const h of fuXiRing) {
    let diff = Math.abs(normalize(h.angle) - d);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = h;
    }
  }
  let off = d - best.angle;
  if (off > 180) off -= 360;
  if (off < -180) off += 360;
  const index = Math.min(
    5,
    Math.max(0, Math.floor(((off + STEP / 2) / STEP) * 6))
  );
  return { name: best.name, binary: best.binary, index };
}

// 变卦卦气吉凶：内外卦先天配洛书数 合五/合十/合十五/生成数 → 吉；
// 不合数理兼看内外卦五行相克 → 凶，否则平
export function judgeGuaQi(binary) {
  const lower = TRIGRAM_BIN[binary.slice(0, 3)];
  const upper = TRIGRAM_BIN[binary.slice(3, 6)];
  if (!lower || !upper) return null;
  const lowerNum = XUAN_KONG_LUO[lower];
  const upperNum = XUAN_KONG_LUO[upper];
  const sum = lowerNum + upperNum;
  let rel = '';
  if (sum === 10) rel = '合十';
  else if (sum === 5) rel = '合五';
  else if (sum === 15) rel = '合十五';
  else if (SHENGCHENG[lowerNum] === upperNum) rel = '生成数';
  let ji;
  let text;
  if (rel === '生成数') {
    ji = '吉';
    text = `上${upper}${upperNum} 下${lower}${lowerNum} · ${SHENGCHENG_LABEL[Math.min(lowerNum, upperNum)]}（生成数），可用`;
  } else if (rel) {
    ji = '吉';
    text = `上${upper}${upperNum} 下${lower}${lowerNum} · ${rel}，可用`;
  } else {
    // 不合数理：兼看内外卦五行，相克 → 凶
    const wxLower = trigrams.find((t) => t.name === lower)?.wuxing;
    const wxUpper = trigrams.find((t) => t.name === upper)?.wuxing;
    const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
    if (KE[wxUpper] === wxLower || KE[wxLower] === wxUpper) {
      ji = '凶';
      const attacker = KE[wxUpper] === wxLower ? wxUpper : wxLower;
      const victim = attacker === wxUpper ? wxLower : wxUpper;
      text = `上${upper}${upperNum} 下${lower}${lowerNum} · 不合数理，${attacker}克${victim}，不可用`;
    } else {
      ji = '平';
      text = `上${upper}${upperNum} 下${lower}${lowerNum} · 不合数理，慎用`;
    }
  }
  return { upper, upperNum, lower, lowerNum, rel, ji, text };
}
