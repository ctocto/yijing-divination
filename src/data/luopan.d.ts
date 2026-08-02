export interface Mountain {
  name: string;
  palace: string;
  dragon: '天' | '地' | '人';
  yinYang: '阴' | '阳';
  angle: number;
}
export interface YunPeriod {
  period: number;
  start: number;
  end: number;
  yuan: '上元' | '中元' | '下元';
}
export const mountains: Mountain[];
export const yunPeriods: YunPeriod[];
export interface SolarTerm {
  name: string;
  angle: number;
}
export interface DegreeTick {
  angle: number;
  major: boolean;
  big: boolean;
  label: string;
}
export const humanMountains: Mountain[];
export const heavenMountains: Mountain[];
export const solarTerms: SolarTerm[];
export const degreeTicks: DegreeTick[];
