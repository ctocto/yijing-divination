// 校验 二十四山结构 + 飞星逻辑（随任务逐步扩充）
// 运行：node scripts/verify-fengshui.mjs
import { mountains, yunPeriods } from '../src/data/luopan.js'
import { stars, overallJudgments, specialPositions } from '../src/data/flyingStars.js'

let failed = false
const check = (cond, msg) => {
  if (!cond) {
    console.error('✗ ' + msg)
    failed = true
  }
}

// —— 三元九运 ——
check(yunPeriods.length === 9, `三元九运应为 9 条，实为 ${yunPeriods.length}`)

// —— 二十四山结构 ——
check(mountains.length === 24, `二十四山数量错误：${mountains.length}`)
const angles = mountains.map(m => m.angle)
check(
  angles.every((a, i) => a === i * 15),
  '二十四山角度应每 15° 连续（0,15,…,345）'
)
const byPalace = {}
for (const m of mountains) (byPalace[m.palace] ||= []).push(m.name)
check(Object.keys(byPalace).length === 8, `应恰好 8 宫，实为 ${Object.keys(byPalace).length}`)
for (const [pal, names] of Object.entries(byPalace)) {
  check(names.length === 3, `${pal}宫应管 3 山，实为 ${names.join(',')}`)
}

// 三元龙阴阳口诀：阴 = 子午卯酉 + 辰戌丑未 + 癸丁乙辛；阳 = 乾坤艮巽 + 甲庚丙壬 + 寅申巳亥
const YIN = new Set(['子', '午', '卯', '酉', '辰', '戌', '丑', '未', '癸', '丁', '乙', '辛'])
const YANG = new Set(['乾', '巽', '艮', '坤', '甲', '庚', '丙', '壬', '寅', '申', '巳', '亥'])
for (const m of mountains) {
  const okYin = YIN.has(m.name) && m.yinYang === '阴'
  const okYang = YANG.has(m.name) && m.yinYang === '阳'
  check(okYin || okYang, `${m.name} 三元龙阴阳与口诀不符`)
}

// —— 九星/断语表完整（Task 2 填充后生效）——
check(stars.length === 9, `九星表应为 9 条，实为 ${stars.length}`)
check(Object.keys(overallJudgments).length >= 7, '大局断语表不足 7 类')
check(Object.keys(specialPositions).length >= 4, '特殊位文案不足 4 项')

if (failed) process.exit(1)
console.log('✓ 二十四山结构 / 三元九运 / 断语表完整性 校验通过')
