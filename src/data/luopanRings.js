// 罗盘圈配置 + 模式→圈集映射（数据驱动；半径按可读性可调）
export const RING_TYPES = {
  trigram: { type: 'glyphs', radius: 148 }, // 后天八卦（常驻）
  terms: { type: 'labels', radius: 176 }, // 二十四节气
  mansions: { type: 'labels', radius: 176 }, // 二十八宿
  hexagrams: { type: 'glyphs', radius: 184 }, // 六十四卦（先天圆环）
  earth: { type: 'labels', radius: 198 }, // 地盘正针
  human: { type: 'labels', radius: 198 }, // 人盘中针
  heaven: { type: 'labels', radius: 198 }, // 天盘缝针
  jiazi: { type: 'labels', radius: 208, labelSize: 10 }, // 六十甲子（6°/个，2 字须小字号避免重叠）
  fenjin: { type: 'labels', radius: 212, labelSize: 10 }, // 120 分金·只标 48 旺相
  chuanShan: { type: 'labels', radius: 212, labelSize: 10 }, // 穿山七十二龙（与分金同圈位）
  touDi: { type: 'labels', radius: 212, labelSize: 10 }, // 透地六十龙（与分金同圈位）
  degrees: { type: 'ticks', radius: 220 }, // 周天度数
};

export const MODES = [
  { id: 'ding', label: '定向' },
  { id: 'xiao', label: '消砂' },
  { id: 'na', label: '纳水' },
  { id: 'ze', label: '择日' },
  { id: 'gua', label: '易卦' },
];

export const modeRings = {
  ding: ['trigram', 'terms', 'earth', 'fenjin', 'degrees'],
  xiao: ['trigram', 'mansions', 'human', 'degrees'],
  na: ['trigram', 'heaven', 'degrees'],
  ze: ['trigram', 'terms', 'jiazi'],
  gua: ['trigram', 'hexagrams', 'degrees'],
};
