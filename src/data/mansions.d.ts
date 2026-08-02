export interface Mansion {
  name: string;
  xiang: '东方青龙' | '南方朱雀' | '西方白虎' | '北方玄武';
  wuxing: string;
  degree: number;
}
export const mansions: Mansion[];
