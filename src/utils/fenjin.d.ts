import { FenJin } from '../data/fenjin';
export type FenjinAtResult =
  | FenJin
  | { type: 'kongwang'; a: string; b: string };
export function fenjinAt(deg: number): FenjinAtResult;
export interface FenjinSide {
  mountain: string;
  name: string;
  gan: string;
  zhi: string;
  level: '旺相' | '孤' | '虚' | '龟甲' | '空亡';
  nian: string;
  ji: '吉' | '凶';
  text: string;
}
export interface FenjinResult {
  shan: FenjinSide;
  xiang: FenjinSide;
}
export function judgeFenjin(deg: number): FenjinResult;
