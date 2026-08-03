export function jdn(y: number, m: number, d: number): number;
export interface GanZhiName {
  name: string;
  nian: string;
}
export function dayGanZhi(y: number, m: number, d: number): GanZhiName;
export function jieZhi(y: number, m: number, d: number): string;
export function yearGanZhiAt(y: number, m: number, d: number): GanZhiName;
export function monthGanZhi(yearGan: string, monthZhi: string): string;
export interface GanZhiOfResult {
  year: GanZhiName;
  month: { name: string };
  day: GanZhiName;
}
export function ganzhiOf(y: number, m: number, d: number): GanZhiOfResult;
