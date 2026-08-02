// 先天六十四卦圆环（共享卦序，供挂图与罗盘卦环使用）
// 角度约定：0° 顶、顺时针增加；乾(顶0°) → 左半(负角) → 坤(底180°) → 右半(正角) → 近顶
import { hexagrams } from '../data/hexagrams.js';

// 先天六十四卦序：binary 数值升序（parseInt 视二进制串自下而上为从高位到低位）
const fuXi = [...hexagrams].sort(
  (a, b) => parseInt(a.binary, 2) - parseInt(b.binary, 2)
);

const STEP = 360 / 64; // 5.625°

export const fuXiRing = (() => {
  const items = [];
  const push = (h, deg) =>
    items.push({
      name: h.name,
      binary: h.binary,
      angle: ((deg % 360) + 360) % 360,
    });
  push(fuXi[63], 0); // 乾
  for (let k = 1; k <= 31; k++) push(fuXi[63 - k], -k * STEP); // 左半 夬..复
  push(fuXi[0], 180); // 坤
  for (let j = 1; j <= 31; j++) push(fuXi[32 - j], j * STEP); // 右半 姤..剥
  return items;
})();
