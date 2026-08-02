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
