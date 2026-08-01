// 二十四山 + 三元九运 数据
// 顺时针从子(0°)起，每 15° 一山，共 24 山；卦管三山（每宫 45°）
export const mountains = [
  { name: '子', palace: '坎', dragon: '天', yinYang: '阴', angle: 0 },
  { name: '癸', palace: '坎', dragon: '人', yinYang: '阴', angle: 15 },
  { name: '丑', palace: '艮', dragon: '地', yinYang: '阴', angle: 30 },
  { name: '艮', palace: '艮', dragon: '天', yinYang: '阳', angle: 45 },
  { name: '寅', palace: '艮', dragon: '人', yinYang: '阳', angle: 60 },
  { name: '甲', palace: '震', dragon: '地', yinYang: '阳', angle: 75 },
  { name: '卯', palace: '震', dragon: '天', yinYang: '阴', angle: 90 },
  { name: '乙', palace: '震', dragon: '人', yinYang: '阴', angle: 105 },
  { name: '辰', palace: '巽', dragon: '地', yinYang: '阴', angle: 120 },
  { name: '巽', palace: '巽', dragon: '天', yinYang: '阳', angle: 135 },
  { name: '巳', palace: '巽', dragon: '人', yinYang: '阳', angle: 150 },
  { name: '丙', palace: '离', dragon: '地', yinYang: '阳', angle: 165 },
  { name: '午', palace: '离', dragon: '天', yinYang: '阴', angle: 180 },
  { name: '丁', palace: '离', dragon: '人', yinYang: '阴', angle: 195 },
  { name: '未', palace: '坤', dragon: '地', yinYang: '阴', angle: 210 },
  { name: '坤', palace: '坤', dragon: '天', yinYang: '阳', angle: 225 },
  { name: '申', palace: '坤', dragon: '人', yinYang: '阳', angle: 240 },
  { name: '庚', palace: '兑', dragon: '地', yinYang: '阳', angle: 255 },
  { name: '酉', palace: '兑', dragon: '天', yinYang: '阴', angle: 270 },
  { name: '辛', palace: '兑', dragon: '人', yinYang: '阴', angle: 285 },
  { name: '戌', palace: '乾', dragon: '地', yinYang: '阴', angle: 300 },
  { name: '乾', palace: '乾', dragon: '天', yinYang: '阳', angle: 315 },
  { name: '亥', palace: '乾', dragon: '人', yinYang: '阳', angle: 330 },
  { name: '壬', palace: '坎', dragon: '地', yinYang: '阳', angle: 345 },
]

// 三元九运年份区间
export const yunPeriods = [
  { period: 1, start: 1864, end: 1883, yuan: '上元' },
  { period: 2, start: 1884, end: 1903, yuan: '上元' },
  { period: 3, start: 1904, end: 1923, yuan: '上元' },
  { period: 4, start: 1924, end: 1943, yuan: '中元' },
  { period: 5, start: 1944, end: 1963, yuan: '中元' },
  { period: 6, start: 1964, end: 1983, yuan: '中元' },
  { period: 7, start: 1984, end: 2003, yuan: '下元' },
  { period: 8, start: 2004, end: 2023, yuan: '下元' },
  { period: 9, start: 2024, end: 2043, yuan: '下元' },
]
