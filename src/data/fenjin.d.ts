export interface FenJin {
  mountain: string;
  index: number; // 0-4 槽位
  angle: number;
  name: string;
  gan: string;
  zhi: string;
  level: '旺相' | '孤' | '虚' | '龟甲';
  nian: string;
}
export const FENJIN_ZHI: Record<string, string>;
export const GAN_SEQ: { 阳: string[]; 阴: string[] };
export const LEVEL_BY_GAN: Record<string, '旺相' | '孤' | '虚' | '龟甲'>;
export const fenjin120: FenJin[];
export const wangXiang48: FenJin[];
