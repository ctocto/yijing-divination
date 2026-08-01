export interface Pan {
  yun: Record<string, number>;
  shan: Record<string, number>;
  xiang: Record<string, number>;
}
export const PALACES: string[];
export const PALACE_NUM: Record<string, number>;
export const FLY_ORDER: string[];
export const STAR_TRIGRAM: Record<number, string>;
export function mountainAt(deg: number): string;
export function oppositeMountain(name: string): string;
export function flyFromCenter(
  centerStar: number,
  forward: boolean
): Record<string, number>;
export function yunPan(period: number): Record<string, number>;
export function shanPan(
  shan: string,
  yun: Record<string, number>
): Record<string, number>;
export function xiangPan(
  xiang: string,
  yun: Record<string, number>
): Record<string, number>;
export function buildPan(shan: string, xiang: string, period: number): Pan;
export interface PalaceJudge {
  palace: string;
  yun: number;
  shan: number;
  xiang: number;
  level: '旺' | '吉' | '平' | '凶' | '煞';
  brief: string;
}
export interface SpecialMap {
  cai?: string;
  wen?: string;
  bing?: string;
  sha?: string;
}
export function overallJudge(
  pan: Pan,
  shan: string,
  xiang: string,
  period: number
): string;
export function specialPositions(pan: Pan, period: number): SpecialMap;
export function palaceJudges(pan: Pan, period: number): PalaceJudge[];
