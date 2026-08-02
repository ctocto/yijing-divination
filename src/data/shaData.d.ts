export const LINE_CYCLE: string[];
export const lineStart: Record<string, number>;
export const baSha: Record<string, string>;
export const BRANCH_ANGLE: Record<string, number>;
export interface SanYuanLong {
  dirs: string;
  fang: number[];
}
export const sanYuanLong: Record<string, SanYuanLong>;
export type ShaRelation = 'sheng' | 'wang' | 'cai' | 'xie' | 'sha';
export interface ShaJudgment {
  name: string;
  level: '吉' | '凶';
  text: string;
}
export const shaJudgments: Record<ShaRelation, ShaJudgment>;
export const baShaText: string;
