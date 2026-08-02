// 易卦抽爻换象纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { hexagrams } from '../data/hexagrams.js';

// 爻名位序：index 0=初、1=二、2=三、3=四、4=五、5=上
const POSITIONS = ['初', '二', '三', '四', '五', '上'];

// 抽动爻：index 0=初爻 … 5=上爻，该位 0↔1 翻转
export function drawLine(binary, index) {
  const arr = binary.split('');
  arr[index] = arr[index] === '1' ? '0' : '1';
  return arr.join('');
}

// 爻名：位序 + 阴阳 → 初九/六二/…/上六
export function lineName(binary, index) {
  const yinYang = binary[index] === '1' ? '九' : '六';
  return POSITIONS[index] + yinYang;
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
  return {
    ben: ben.name,
    benPlain: ben.plain,
    line: ben.lines[index],
    bian: bian.name,
    bianText: bian.text,
    bianPlain: bian.plain,
  };
}
