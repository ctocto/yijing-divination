// 纳水数据：双山五行（三合口径）+ 四大局长生位 + 十二长生 + 吉凶断语（文化参考）
// 双山 = 天盘 24 山并 12 组；中心角 = 地支宫中心（子0° 丑30° 寅60°…每 30°，壬子=0°）

// 12 双山（中心角每 30°；五行 = 三合五行，与四局一一对应）
export const shuangshan = [
  { name: '壬子', wuxing: '水', angle: 0 },
  { name: '癸丑', wuxing: '金', angle: 30 },
  { name: '艮寅', wuxing: '火', angle: 60 },
  { name: '甲卯', wuxing: '木', angle: 90 },
  { name: '乙辰', wuxing: '水', angle: 120 },
  { name: '巽巳', wuxing: '金', angle: 150 },
  { name: '丙午', wuxing: '火', angle: 180 },
  { name: '丁未', wuxing: '木', angle: 210 },
  { name: '坤申', wuxing: '水', angle: 240 },
  { name: '庚酉', wuxing: '金', angle: 270 },
  { name: '辛戌', wuxing: '火', angle: 300 },
  { name: '乾亥', wuxing: '木', angle: 330 },
];

// 四大局（三合五行即局名；长生/帝旺/墓库 = 双山名）
export const JUS = [
  {
    name: '木',
    sanhe: '亥卯未',
    changsheng: '乾亥',
    diwang: '甲卯',
    muku: '丁未',
  },
  {
    name: '火',
    sanhe: '寅午戌',
    changsheng: '艮寅',
    diwang: '丙午',
    muku: '辛戌',
  },
  {
    name: '水',
    sanhe: '申子辰',
    changsheng: '坤申',
    diwang: '壬子',
    muku: '乙辰',
  },
  {
    name: '金',
    sanhe: '巳酉丑',
    changsheng: '巽巳',
    diwang: '庚酉',
    muku: '癸丑',
  },
];

// 十二长生序（顺布/逆布均按此序取位名）
export const CHANGSHENG_ORDER = [
  '长生',
  '沐浴',
  '冠带',
  '临官',
  '帝旺',
  '衰',
  '病',
  '死',
  '墓',
  '绝',
  '胎',
  '养',
];

// 吉凶断语（lai = 来水档位，qu = 去水档位：吉/凶/慎）
export const CHANGSHENG_JUDGE = {
  长生: {
    lai: '吉',
    qu: '忌',
    text: '来水主文人功名、人丁兴旺；去水破生旺忌。',
  },
  沐浴: { lai: '慎', qu: '慎', text: '沐浴桃花，来去皆宜慎。' },
  冠带: { lai: '吉', qu: '忌', text: '来水出聪明人；去水不利儿童。' },
  临官: { lai: '吉', qu: '忌', text: '来水少年得志、主发财；去水凶。' },
  帝旺: { lai: '吉', qu: '忌', text: '来水出富贵之人；去水破旺冲生忌。' },
  衰: { lai: '吉', qu: '吉', text: '衰位水来去皆吉，最宜弯曲有情。' },
  病: { lai: '凶', qu: '吉', text: '来水防病；去水纳福。' },
  死: { lai: '凶', qu: '吉', text: '来水有祸；去水纳福。' },
  墓: { lai: '凶', qu: '吉', text: '来水不宜；去水半吉，墓库为水口。' },
  绝: { lai: '凶', qu: '吉', text: '忌来水；去水吉。' },
  胎: { lai: '慎', qu: '吉', text: '来水无儿；去水可生财。' },
  养: { lai: '吉', qu: '忌', text: '来水主初年发财；去水凶。' },
};
