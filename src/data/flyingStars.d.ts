export interface Star {
  star: number
  name: string
  wuxing: string
  nature: '吉' | '平' | '凶'
  dangYun: string
  shiLing: string
}
export interface Judgment {
  name: string
  text: string
  advice: string
}
export interface SpecialPos {
  label: string
  text: string
}
export const stars: Star[]
export const overallJudgments: Record<string, Judgment>
export const specialPositions: Record<string, SpecialPos>
