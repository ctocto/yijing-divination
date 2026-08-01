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
