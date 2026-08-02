import type { Mansion } from '../data/mansions';

export interface MansionDetail {
  mansion: Mansion;
  offset: number;
}
export function mansionAtDetail(deg: number): MansionDetail;
export function mansionShengAt(deg: number): string;
export function lineWuxingAt(deg: number): string;
export function judgeSha(
  shanWuxing: string,
  shaWuxing: string
): 'sheng' | 'wang' | 'cai' | 'xie' | 'sha';
export interface ShaDirection {
  deg: number;
  name: string;
  mountains: string[];
}
export const SHA_DIRECTIONS: ShaDirection[];
export interface ShaRow {
  deg: number;
  dir: string; // 方位名（坎·北）
  mansion: string;
  shaWx: string;
  relation: string;
  name: string; // 砂名（生砂/旺砂/…）
  level: '吉' | '凶';
  text: string;
  fang: { name: string; fang: number[] }[];
}
export function judgeAllSha(shanDeg: number): ShaRow[];
export function baShaAt(
  shanDeg: number
): { branch: string; angle: number } | null;
export function fenFangByMountain(name: string): number[];
export function fenFang(deg: number): number[];
