export function dayBranch(jiaziName: string): string;
export function monthBranch(term: string): string;
export function jianChuIndex(monthB: string, dayB: string): number;
export interface ZeriResult {
  monthB: string;
  dayB: string;
  jianChu: { name: string; level: '吉' | '平' | '凶'; text: string };
  huangDao: { name: string; dao: '黄' | '黑'; level: '吉' | '凶' };
  nian: string;
}
export function judgeZeri(term: string, jiaziName: string): ZeriResult;
