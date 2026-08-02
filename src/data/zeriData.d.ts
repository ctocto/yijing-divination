export interface JianChu {
  name: string;
  level: '吉' | '平' | '凶';
  text: string;
}
export const jianChu: JianChu[];
export interface HuangDao {
  name: string;
  dao: '黄' | '黑';
  level: '吉' | '凶';
}
export const huangDao: HuangDao[];
export const termMonth: Record<string, string>;
