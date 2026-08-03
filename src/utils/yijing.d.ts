export function drawLine(binary: string, index: number): string;
export function lineName(binary: string, index: number): string;
export function hexagramByBinary(binary: string):
  | {
      binary: string;
      name: string;
      text: string;
      plain: string;
      lines: string[];
    }
  | undefined;
export interface ChouYaoResult {
  ben: string;
  benPlain: string;
  line: string;
  bian: string;
  bianText: string;
  bianPlain: string;
}
export function judgeChouYao(
  binary: string,
  index: number
): ChouYaoResult | null;
export interface YaoAtResult {
  name: string;
  binary: string;
  index: number;
}
export function yaoAt(deg: number): YaoAtResult;
export interface GuaQiResult {
  upper: string;
  upperNum: number;
  lower: string;
  lowerNum: number;
  rel: '' | '合五' | '合十' | '合十五' | '生成数';
  ji: '吉' | '凶' | '平';
  text: string;
}
export function judgeGuaQi(binary: string): GuaQiResult | null;
