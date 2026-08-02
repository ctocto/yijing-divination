export function shuangshanAt(deg: number): string;
export function judgeJu(shanDeg: number): {
  ju: string;
  changshengName: string;
};
export function changshengMap(
  ju: string,
  flow: 'left' | 'right'
): Record<string, string>;
export function positionAt(
  map: Record<string, string>,
  deg: number
): string | null;
export interface ShuiResult {
  ju: string;
  changshengName: string;
  inDeg: number;
  outDeg: number;
  inPos: string | null;
  outPos: string | null;
  inLai: '吉' | '凶' | '慎' | null;
  inText: string;
  outQu: '吉' | '凶' | '慎' | '忌' | null;
  outText: string;
  summary: string;
}
export function judgeShui(
  shanDeg: number,
  inDeg: number,
  outDeg: number,
  flow: 'left' | 'right'
): ShuiResult;
