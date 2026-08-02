// 纳水纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
// 三合水法：坐山定局 → 十二长生阳顺阴逆 → 来水/去水吉凶判断
import { itemAt } from './luopanRead.js';
import {
  shuangshan,
  JUS,
  CHANGSHENG_ORDER,
  CHANGSHENG_JUDGE,
} from '../data/shuiData.js';

// 角度 → 双山（按双山中心角循环距离取最近）
// 注：双山 = 地支宫（30° 一宫），天盘缝针 +7.5° 与地盘在此口径下落在同一宫，定局结果一致，
// 故直接用「角度 → 地支宫中心」判定，不依赖天/地盘偏移。坐山取地盘角，来水/去水取十字线角度。
export function shuangshanAt(deg) {
  return itemAt(deg, shuangshan).name;
}

// 坐山 → 双山 → 五行 → 定局（双山五行即局名：水/金/火/木）
export function judgeJu(shanDeg) {
  const ss = shuangshan.find((s) => s.name === shuangshanAt(shanDeg));
  const ju = JUS.find((j) => j.name === ss.wuxing);
  return { ju: ss.wuxing, changshengName: ju.changsheng };
}

// 局 + 顺逆 → 双山名 → 十二长生位 map
// flow: 'left'（左水倒右，阳局顺排）| 'right'（右水倒左，阴局逆排）
// 顺排 = 从长生位沿地支宫 +30° 递增；逆排 = −30° 递减
export function changshengMap(ju, flow) {
  const juInfo = JUS.find((j) => j.name === ju);
  const startAngle = shuangshan.find((s) => s.name === juInfo.changsheng).angle;
  const map = {};
  CHANGSHENG_ORDER.forEach((pos, k) => {
    const angle = (startAngle + (flow === 'left' ? k : -k) * 30 + 360) % 360;
    map[shuangshan.find((s) => s.angle === angle).name] = pos;
  });
  return map;
}

// 角度 → 十二长生位（按双山 map）
export function positionAt(map, deg) {
  const name = shuangshanAt(deg);
  return map[name] || null;
}

// 纳水判断：定局 → 来水/去水长生位 → 各自吉凶 + 总评
// flow: 'left' | 'right'
export function judgeShui(shanDeg, inDeg, outDeg, flow) {
  const { ju, changshengName } = judgeJu(shanDeg);
  const map = changshengMap(ju, flow);
  const inPos = positionAt(map, inDeg);
  const outPos = positionAt(map, outDeg);
  const inInfo = inPos ? CHANGSHENG_JUDGE[inPos] : null;
  const outInfo = outPos ? CHANGSHENG_JUDGE[outPos] : null;
  const goodLai = ['长生', '冠带', '临官', '帝旺'].includes(inPos);
  const goodQu = ['衰', '病', '死', '墓'].includes(outPos);
  const summary =
    goodLai && goodQu
      ? '迎生接旺，水归墓库，来去皆吉。'
      : goodLai
        ? '来水合局吉，去水方位欠佳，宜择吉口。'
        : goodQu
          ? '去水合局吉，来水方位欠佳，宜收生旺。'
          : '来去水方位均欠合局，宜谨慎。';
  return {
    ju,
    changshengName,
    inDeg: Math.round(inDeg) % 360,
    outDeg: Math.round(outDeg) % 360,
    inPos,
    outPos,
    inLai: inInfo ? inInfo.lai : null,
    inText: inInfo ? inInfo.text : '',
    outQu: outInfo ? outInfo.qu : null,
    outText: outInfo ? outInfo.text : '',
    summary,
  };
}
