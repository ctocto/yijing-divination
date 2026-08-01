export interface Mountain {
  name: string
  palace: string
  dragon: '天' | '地' | '人'
  yinYang: '阴' | '阳'
  angle: number
}
export interface YunPeriod {
  period: number
  start: number
  end: number
  yuan: '上元' | '中元' | '下元'
}
export const mountains: Mountain[]
export const yunPeriods: YunPeriod[]
