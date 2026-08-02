export interface Mansion {
  name: string;
  xiang: '东方青龙' | '南方朱雀' | '西方白虎' | '北方玄武';
  wuxing: string;
  sheng: string; // 宿主五行（消砂用，七曜中 日/月 → 火）
  degree: number;
}
export const mansions: Mansion[];
