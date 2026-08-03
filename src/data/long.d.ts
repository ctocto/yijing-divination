export interface ChuanShan {
  name: string; // 空串 = 大空亡
  gan: string;
  zhi: string;
  level: '旺相' | '孤' | '虚' | '龟甲' | '大空亡';
  ji: '吉' | '凶';
  nian: string;
  angle: number;
}
export interface TouDi {
  name: string;
  nian: string;
  qi: '冷' | '正' | '败' | '旺' | '退';
  level: '孤' | '旺' | '煞' | '相' | '虚';
  ji: '吉' | '凶';
  angle: number;
}
export const chuanShan72: ChuanShan[];
export const touDi60: TouDi[];
