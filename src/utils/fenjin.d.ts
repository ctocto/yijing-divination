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
export interface GanZhiResult {
  name: string;
  nian: string;
}
export function yearGanZhi(year: number): GanZhiResult;
export function nianWuxing(nian: string): string;
export interface XianMingResult {
  xm: string;
  xmNian: string;
  relation: '生' | '旺' | '财' | '泄' | '杀';
  ji: '吉' | '凶';
  label: string;
  text: string;
}
export function judgeXianMing(
  year: number,
  fenjinNian: string
): XianMingResult | null;
