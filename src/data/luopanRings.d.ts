export type RingType = 'ticks' | 'labels' | 'glyphs';
export type RingId =
  | 'trigram'
  | 'terms'
  | 'mansions'
  | 'hexagrams'
  | 'earth'
  | 'human'
  | 'heaven'
  | 'jiazi'
  | 'fenjin'
  | 'chuanShan'
  | 'touDi'
  | 'degrees';
export interface RingSpec {
  type: RingType;
  radius: number;
  labelSize?: number; // labels 圈字号覆盖（默认 17）
}
export type ModeId = 'ding' | 'xiao' | 'na' | 'ze' | 'gua';
export interface ModeSpec {
  id: ModeId;
  label: string;
}
export const RING_TYPES: Record<RingId, RingSpec>;
export const MODES: ModeSpec[];
export const modeRings: Record<ModeId, RingId[]>;
