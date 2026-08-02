export interface Shuangshan {
  name: string;
  wuxing: string;
  angle: number;
}
export const shuangshan: Shuangshan[];
export interface Ju {
  name: string;
  sanhe: string;
  changsheng: string;
  diwang: string;
  muku: string;
}
export const JUS: Ju[];
export const CHANGSHENG_ORDER: string[];
export interface ChangshengJudge {
  lai: '吉' | '凶' | '慎';
  qu: '吉' | '凶' | '慎';
  text: string;
}
export const CHANGSHENG_JUDGE: Record<string, ChangshengJudge>;
