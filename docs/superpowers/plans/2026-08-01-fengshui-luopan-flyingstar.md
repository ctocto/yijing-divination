# 风水罗盘 + 宅运飞星盘 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增全屏「风水 · 罗盘宅运」功能——可旋转罗盘选坐向 → 生成 3×3 宅运飞星盘（运/山/向三星 + 大局判断 + 特殊位 + 每宫断语），延续挂轴/宣纸/金石美学。

**Architecture:** 数据层新增 `src/data/luopan.js`（二十四山 + 三元九运）与 `src/data/flyingStars.js`（九星/大局/特殊位文案）；纯逻辑放 `src/utils/fengShui.js`（洛书飞布、运/山/向三盘、大局/特殊位/每宫判断）；UI 新增 `src/components/fengshui/` 三个组件（FengShuiView 全屏页、Luopan 旋转罗盘、FlyingStarPan 盘面）。Home.vue 底部加「风水罗盘 ▸」入口，与卦库同 overlay 模式。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、纯 CSS（无 UI 库）、`@/` 路径别名（Vite）、`pnpm`、node 校验脚本（无测试框架）。

## Global Constraints

- **无测试框架**（Vitest 未配置，不引入）。逻辑 TDD 用 node 脚本 `scripts/verify-fengshui.mjs`（仿 `scripts/verify-hexagrams.mjs`）承载断言；编译/风格验证用 `pnpm build` + `npx prettier --check <涉及文件>`。
- **eslint 仓库级损坏（既存基建问题，非本计划引入）**：ESLint 9 需 `eslint.config.js`（flat config），仓库仅有 `.eslintrc.js`，`npx eslint` 对任何文件都在启动即失败。本计划**不修复**该配置（超出功能范围）；各任务步骤中出现的 `npx eslint` 一律替换为 `npx prettier --check <涉及文件>`。
- **格式化**：计划代码块为阅读简洁省略分号；仓库 `.prettierrc` 为 `semi: true`。实现者写完须 `npx prettier --write <涉及文件>`（仅格式）。验证用 `npx prettier --check <涉及文件>`，不要对全仓 `--check .`（既有文件本就不过 prettier）。
- 界面文案一律中文；代码注释用中文。
- JS 实现 + 兄弟 `.d.ts` 类型声明（见 `src/data/trigrams.d.ts` 风格）。
- **不改动任何现有 `src/data/*.js` 数据文件**；仅新增文件与 Home.vue。
- **`src/utils/fengShui.js` 用相对导入**（`../data/luopan`）而非 `@/`，保证 node 脚本可直接 import 校验（Vite 同样支持相对导入）。其余组件可用 `@/`。
- 不新增任何依赖。
- 工作区存在**未提交改动**（`.gitignore`、`HexagramSquareCircle.vue`、`Home.vue`）。Task 9 改 Home.vue 时用 Edit 精确插入、不整文件重写；`.gitignore` 与 `HexagramSquareCircle.vue` 的改动保持不动、不纳入本计划提交。

---

### Task 1: `src/data/luopan.js` + `.d.ts` + 校验脚本骨架（结构不变量）

**Files:**
- Create: `src/data/luopan.js`
- Create: `src/data/luopan.d.ts`
- Create: `scripts/verify-fengshui.mjs`（本期只含二十四山结构断言）

**Interfaces:**
- Produces: `mountains: Mountain[]`（24 条，按角度升序）、`yunPeriods: YunPeriod[]`（9 条）。后续 Task 3/4 的 `fengShui.js` 依赖它们。

- [ ] **Step 1: 创建 `src/data/luopan.js`**

```js
// 二十四山 + 三元九运 数据
// 顺时针从子(0°)起，每 15° 一山，共 24 山；卦管三山（每宫 45°）
export const mountains = [
  { name: '子', palace: '坎', dragon: '天', yinYang: '阴', angle: 0 },
  { name: '癸', palace: '坎', dragon: '人', yinYang: '阴', angle: 15 },
  { name: '丑', palace: '艮', dragon: '地', yinYang: '阴', angle: 30 },
  { name: '艮', palace: '艮', dragon: '天', yinYang: '阳', angle: 45 },
  { name: '寅', palace: '艮', dragon: '人', yinYang: '阳', angle: 60 },
  { name: '甲', palace: '震', dragon: '地', yinYang: '阳', angle: 75 },
  { name: '卯', palace: '震', dragon: '天', yinYang: '阴', angle: 90 },
  { name: '乙', palace: '震', dragon: '人', yinYang: '阴', angle: 105 },
  { name: '辰', palace: '巽', dragon: '地', yinYang: '阴', angle: 120 },
  { name: '巽', palace: '巽', dragon: '天', yinYang: '阳', angle: 135 },
  { name: '巳', palace: '巽', dragon: '人', yinYang: '阳', angle: 150 },
  { name: '丙', palace: '离', dragon: '地', yinYang: '阳', angle: 165 },
  { name: '午', palace: '离', dragon: '天', yinYang: '阴', angle: 180 },
  { name: '丁', palace: '离', dragon: '人', yinYang: '阴', angle: 195 },
  { name: '未', palace: '坤', dragon: '地', yinYang: '阴', angle: 210 },
  { name: '坤', palace: '坤', dragon: '天', yinYang: '阳', angle: 225 },
  { name: '申', palace: '坤', dragon: '人', yinYang: '阳', angle: 240 },
  { name: '庚', palace: '兑', dragon: '地', yinYang: '阳', angle: 255 },
  { name: '酉', palace: '兑', dragon: '天', yinYang: '阴', angle: 270 },
  { name: '辛', palace: '兑', dragon: '人', yinYang: '阴', angle: 285 },
  { name: '戌', palace: '乾', dragon: '地', yinYang: '阴', angle: 300 },
  { name: '乾', palace: '乾', dragon: '天', yinYang: '阳', angle: 315 },
  { name: '亥', palace: '乾', dragon: '人', yinYang: '阳', angle: 330 },
  { name: '壬', palace: '坎', dragon: '地', yinYang: '阳', angle: 345 },
]

// 三元九运年份区间
export const yunPeriods = [
  { period: 1, start: 1864, end: 1883, yuan: '上元' },
  { period: 2, start: 1884, end: 1903, yuan: '上元' },
  { period: 3, start: 1904, end: 1923, yuan: '上元' },
  { period: 4, start: 1924, end: 1943, yuan: '中元' },
  { period: 5, start: 1944, end: 1963, yuan: '中元' },
  { period: 6, start: 1964, end: 1983, yuan: '中元' },
  { period: 7, start: 1984, end: 2003, yuan: '下元' },
  { period: 8, start: 2004, end: 2023, yuan: '下元' },
  { period: 9, start: 2024, end: 2043, yuan: '下元' },
]
```

- [ ] **Step 2: 创建 `src/data/luopan.d.ts`**

```ts
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
```

- [ ] **Step 3: 创建 `scripts/verify-fengshui.mjs`（先跑，验证数据）**

```js
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
```

> 注：此脚本此刻 import 的 `flyingStars.js` 尚不存在，运行会报错。按 TDD，先让它在缺失文件上报错（失败态），随后 Task 2 补齐。

- [ ] **Step 4: 运行确认失败态**

Run: `node scripts/verify-fengshui.mjs`
Expected: 因 `../src/data/flyingStars.js` 不存在而报模块解析错误（失败态成立）。

- [ ] **Step 5: 提交**

```bash
git add src/data/luopan.js src/data/luopan.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 二十四山 + 三元九运数据模块（含结构校验脚本骨架）"
```

---

### Task 2: `src/data/flyingStars.js` + `.d.ts`（九星/大局/特殊位文案）

**Files:**
- Create: `src/data/flyingStars.js`
- Create: `src/data/flyingStars.d.ts`

**Interfaces:**
- Produces: `stars: Star[]`（9 条，`star` 字段为 1-9）、`overallJudgments: Record<string, Judgment>`、`specialPositions: Record<string, SpecialPos>`。Task 4 的 `palaceJudges`/`specialPositions` 依赖这些文案。

- [ ] **Step 1: 创建 `src/data/flyingStars.js`**

```js
// 玄空九星表 + 大局断语 + 特殊位文案
// 星性文本：当运（旺/生气）用 dangYun，失令用 shiLing。内容为文化参考。

export const stars = [
  { star: 1, name: '一白贪狼', wuxing: '水', nature: '吉',
    dangYun: '一白当运，文思敏捷，人缘桃花俱旺，主聪明才智、声名进益。',
    shiLing: '一白失令，防酒色口舌与桃花是非，情绪易生波澜。' },
  { star: 2, name: '二黑巨门', wuxing: '土', nature: '凶',
    dangYun: '二黑当运，聚财有库，反主财源稳固。',
    shiLing: '二黑失令为病符，防肠胃与慢性疾患，此方宜静不宜动。' },
  { star: 3, name: '三碧禄存', wuxing: '木', nature: '凶',
    dangYun: '三碧当运，官非口舌反成利器，主威权名声。',
    shiLing: '三碧失令主是非争斗，防诉讼争执，少在此方议事。' },
  { star: 4, name: '四绿文曲', wuxing: '木', nature: '平',
    dangYun: '四绿当运，文昌得力，利读书考试、文思进益。',
    shiLing: '四绿失令主是非桃花，文章虽利而慎言语，防文书之损。' },
  { star: 5, name: '五黄廉贞', wuxing: '土', nature: '凶',
    dangYun: '五黄本为极凶，纵当运亦宜化解，主灾病意外。',
    shiLing: '五黄煞气所到，主血光病灾，动土修造尤须避忌。' },
  { star: 6, name: '六白武曲', wuxing: '金', nature: '吉',
    dangYun: '六白当运，武曲主权威与金融，利仕途进财。',
    shiLing: '六白失令主是非与退财，防投资失利、金类破耗。' },
  { star: 7, name: '七赤破军', wuxing: '金', nature: '凶',
    dangYun: '七赤当运，口才与竞争得利，主武职与决断。',
    shiLing: '七赤失令主贼盗口舌，防金属利刃之伤、小人暗算。' },
  { star: 8, name: '八白左辅', wuxing: '土', nature: '吉',
    dangYun: '八白当运，土星主财，田宅不动产兴旺，最利守财。',
    shiLing: '八白失令仍主安稳，财来较缓，宜守成不宜冒进。' },
  { star: 9, name: '九紫右弼', wuxing: '火', nature: '吉',
    dangYun: '九紫当运，喜气盈门，主喜庆婚嫁、声名远扬。',
    shiLing: '九紫失令主急躁眼疾，防火灾血光，宜静心养性。' },
]

// 大局断语（key 供整体判断返回）
export const overallJudgments = {
  wangshan: { name: '旺山旺向', text: '山星得坐、向星得向，人丁与财运皆得其位，为难得的大吉之局。', advice: '坐山处宜聚气，向首处宜开阔纳财，居之丁财两旺。' },
  shuangXiang: { name: '双星到向', text: '旺星双双聚于向首，主财运特旺、门前热闹。', advice: '向首宜开阔明亮，但旺财不旺丁，注意人丁健康。' },
  shuangShan: { name: '双星到山', text: '旺星双双聚于坐山，主人丁兴旺、背后有靠。', advice: '坐山宜高宜静，旺丁而不旺财，理财宜稳健。' },
  shangshan: { name: '上山下水', text: '山星到向、向星到山，人丁与财运失位，为大凶之局。', advice: '宜用风水布局化解，或择吉调整门户朝向。' },
  fuyin: { name: '伏吟', text: '星临本位，气机郁滞，主进展迟缓、事多反复。', advice: '宜在旺方用力，伏吟之宫作静区。' },
  fanyin: { name: '反吟', text: '星与宫位相冲，气机动荡，主变动不安、多是非。', advice: '此方宜静不宜动，大事缓行，以静制动。' },
  ping: { name: '平局', text: '山向旺星未能同到本位，吉凶参半，中平之局。', advice: '可借流年飞星择吉方用事，趋吉避凶。' },
}

// 特殊位文案（key 供 specialPositions 返回的宫位对应）
export const specialPositions = {
  cai: { label: '财位', text: '当运财星所到之方，宜设收银台或财神位，常驻生气以聚财。' },
  wen: { label: '文昌位', text: '四绿文曲所到，利读书考试，宜设书桌文昌。' },
  bing: { label: '病符位', text: '二黑病符所到，宜保持整洁安静，防健康受损。' },
  sha: { label: '五黄煞', text: '五黄煞气所到，切忌动土装修，宜以静化煞。' },
}
```

- [ ] **Step 2: 创建 `src/data/flyingStars.d.ts`**

```ts
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
```

- [ ] **Step 3: 运行校验脚本**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（`✓ 二十四山结构 / 三元九运 / 断语表完整性 校验通过`）

- [ ] **Step 4: 提交**

```bash
git add src/data/flyingStars.js src/data/flyingStars.d.ts
git commit -m "feat: 玄空九星/大局/特殊位断语文案数据"
```

---

### Task 3: `src/utils/fengShui.js` 核心（飞布 + 三盘）+ `.d.ts`

**Files:**
- Create: `src/utils/fengShui.js`
- Create: `src/utils/fengShui.d.ts`
- Modify: `scripts/verify-fengshui.mjs`（追加三盘断言）

**Interfaces:**
- Produces:
  - `PALACES: string[]`（`['巽','离','坤','震','中','兑','艮','坎','乾']`，3×3 按行展开）
  - `PALACE_NUM: Record<string, number>`（宫 → 洛书数）
  - `FLY_ORDER: string[]`（`['中','乾','兑','艮','离','坎','坤','震','巽']`）
  - `STAR_TRIGRAM: Record<number, string>`（星 → 元旦盘原卦；无 5）
  - `mountainAt(deg): string`、`oppositeMountain(name): string`
  - `flyFromCenter(centerStar, forward): Record<string, number>`
  - `yunPan(period)`、`shanPan(shan, yun)`、`xiangPan(xiang, yun)`、`buildPan(shan, xiang, period)` → `{ yun, shan, xiang }`

- [ ] **Step 1: 创建 `src/utils/fengShui.js`（核心函数）**

```js
// 玄空飞星纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { mountains } from '../data/luopan.js'

// 宫位：3×3 盘面按行展开（南在上）
export const PALACES = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾']
// 宫 → 洛书数
export const PALACE_NUM = { 坎: 1, 坤: 2, 震: 3, 巽: 4, 中: 5, 乾: 6, 兑: 7, 艮: 8, 离: 9 }
// 洛书飞布顺序：从中出发，顺飞星数 +1 递增；逆飞星数 −1 递减（宫位顺序不变）
export const FLY_ORDER = ['中', '乾', '兑', '艮', '离', '坎', '坤', '震', '巽']
// 元旦盘原卦：星 → 卦宫（五黄居中无原卦）
export const STAR_TRIGRAM = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' }

const mtn = (name) => mountains.find(m => m.name === name)

// 角度 → 最近 15° 山名
// 注：snapped 是角度（数字），必须按 angle 查找，不能走 mtn(name)
export function mountainAt(deg) {
  const norm = ((deg % 360) + 360) % 360
  const snapped = (Math.round(norm / 15) * 15) % 360
  return mountains.find(m => m.angle === snapped).name
}

// 对宫（相差 180°）
export function oppositeMountain(name) {
  return mountainAt((mtn(name).angle + 180) % 360)
}

// 入中星飞布：forward=true 顺飞（+1），false 逆飞（−1），星数 1..9 循环
export function flyFromCenter(centerStar, forward) {
  const res = {}
  FLY_ORDER.forEach((palace, i) => {
    const raw = centerStar + (forward ? i : -i)
    res[palace] = ((raw - 1) % 9 + 9) % 9 + 1
  })
  return res
}

// 运盘：元星入中顺飞
export function yunPan(period) {
  return flyFromCenter(period, true)
}

// 山盘/向盘顺逆判定 —— 玄空「同元龙法」
// 入中星 ≠ 5：查该星元旦盘原卦，取原卦三山中与坐山/向首同元龙的一山，其阴阳定顺逆。
// 入中星 = 5：五黄无原卦，依坐山/向首本身阴阳定顺逆。
function directionOf(mountain, centerStar) {
  const m = mtn(mountain)
  if (centerStar === 5) return m.yinYang === '阳'
  const trigram = STAR_TRIGRAM[centerStar]
  const sameDragon = mountains.find(x => x.palace === trigram && x.dragon === m.dragon)
  return sameDragon.yinYang === '阳'
}

// 山盘：坐山宫位的运星入中
export function shanPan(shan, yun) {
  const center = yun[mtn(shan).palace]
  return flyFromCenter(center, directionOf(shan, center))
}

// 向盘：向首宫位的运星入中
export function xiangPan(xiang, yun) {
  const center = yun[mtn(xiang).palace]
  return flyFromCenter(center, directionOf(xiang, center))
}

// 完整盘
export function buildPan(shan, xiang, period) {
  const yun = yunPan(period)
  return { yun, shan: shanPan(shan, yun), xiang: xiangPan(xiang, yun) }
}
```

> 用相对导入 `../data/luopan.js`：确保 `scripts/verify-fengshui.mjs`（node）能直接 import。

- [ ] **Step 2: 创建 `src/utils/fengShui.d.ts`**

```ts
export interface Pan {
  yun: Record<string, number>
  shan: Record<string, number>
  xiang: Record<string, number>
}
export const PALACES: string[]
export const PALACE_NUM: Record<string, number>
export const FLY_ORDER: string[]
export const STAR_TRIGRAM: Record<number, string>
export function mountainAt(deg: number): string
export function oppositeMountain(name: string): string
export function flyFromCenter(centerStar: number, forward: boolean): Record<string, number>
export function yunPan(period: number): Record<string, number>
export function shanPan(shan: string, yun: Record<string, number>): Record<string, number>
export function xiangPan(xiang: string, yun: Record<string, number>): Record<string, number>
export function buildPan(shan: string, xiang: string, period: number): Pan
```

- [ ] **Step 3: 校验脚本追加三盘断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { buildPan, yunPan, shanPan, xiangPan, PALACE_NUM, oppositeMountain } from '../src/utils/fengShui.js'
```

在文件末尾（`if (failed)` 之前）追加：

```js
// —— 飞星盘结构 ——
const isPermutation = (obj) => {
  const vals = Object.values(obj)
  return vals.length === 9 && new Set(vals).size === 9 && vals.every(v => v >= 1 && v <= 9)
}
for (let period = 1; period <= 9; period++) {
  const yun = yunPan(period)
  check(yun['中'] === period, `${period}运 运盘中心应为 ${period}`)
  check(isPermutation(yun), `${period}运 运盘应为 1-9 排列`)
  for (const m of mountains) {
    check(isPermutation(shanPan(m.name, yun)), `${period}运 ${m.name}山 山盘应为 1-9 排列`)
    check(isPermutation(xiangPan(m.name, yun)), `${period}运 ${m.name}向 向盘应为 1-9 排列`)
  }
}
// 对宫互补抽样：子↔午、乾↔巽
check(oppositeMountain('子') === '午', '子之对宫应为午')
check(oppositeMountain('乾') === '巽', '乾之对宫应为巽')
```

- [ ] **Step 4: 运行校验脚本**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（含三盘排列断言与对宫抽样）。

- [ ] **Step 5: 编译与 lint**

Run: `pnpm build && npx eslint src/utils/fengShui.js src/utils/fengShui.d.ts`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 6: 提交**

```bash
git add src/utils/fengShui.js src/utils/fengShui.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 玄空飞星纯逻辑 —— 洛书飞布/运山向三盘（同元龙顺逆）"
```

---

### Task 4: `fengShui.js` 判断函数（大局/特殊位/每宫）

**Files:**
- Modify: `src/utils/fengShui.js`（追加三个函数）
- Modify: `src/utils/fengShui.d.ts`
- Modify: `scripts/verify-fengshui.mjs`（追加 sanity 断言）

**Interfaces:**
- Produces:
  - `overallJudge(pan, shan, xiang, period): string`（返回 `overallJudgments` 的 key：`wangshan`/`shuangXiang`/`shuangShan`/`shangshan`/`fuyin`/`fanyin`/`ping`）
  - `specialPositions(pan, period): { cai?, wen?, bing?, sha? }`（宫位名）
  - `palaceJudges(pan, period): PalaceJudge[]`（9 条：`{ palace, yun, shan, xiang, level, brief }`，`level` ∈ 旺/吉/平/凶/煞）

- [ ] **Step 1: 追加判断函数到 `fengShui.js` 末尾**

在 `src/utils/fengShui.js` 顶部 import 区追加 `stars`：

```js
import { stars } from '../data/flyingStars.js'
```

再在文件末尾追加判断函数：

```js
// 大局判断：按当运旺星落点四象限 + 伏吟/反吟
export function overallJudge(pan, shan, xiang, period) {
  const shanPalace = mtn(shan).palace
  const xiangPalace = mtn(xiang).palace
  const findStar = (which, star) => Object.keys(pan[which]).find(k => pan[which][k] === star)
  const shanStarPalace = findStar('shan', period)
  const xiangStarPalace = findStar('xiang', period)
  const atShan = (p) => p === shanPalace
  const atXiang = (p) => p === xiangPalace
  if (atShan(shanStarPalace) && atXiang(xiangStarPalace)) return 'wangshan'
  if (atXiang(shanStarPalace) && atShan(xiangStarPalace)) return 'shangshan'
  if (atXiang(shanStarPalace) && atXiang(xiangStarPalace)) return 'shuangXiang'
  if (atShan(shanStarPalace) && atShan(xiangStarPalace)) return 'shuangShan'
  // 伏吟/反吟仅查坐山宫与向首宫（标准玄空口径；全盘扫描会让平局不可达）
  const fu = [shanPalace, xiangPalace].find(p => pan.shan[p] === PALACE_NUM[p] || pan.xiang[p] === PALACE_NUM[p])
  if (fu) return 'fuyin'
  const fan = [shanPalace, xiangPalace].find(p => pan.shan[p] + PALACE_NUM[p] === 10 || pan.xiang[p] + PALACE_NUM[p] === 10)
  if (fan) return 'fanyin'
  return 'ping'
}

// 特殊位：财位（向盘当运旺星或生气星所到宫）、文昌（运盘四绿）、病符（运盘二黑）、五黄煞（运盘五黄）
export function specialPositions(pan, period) {
  const shengQi = period % 9 + 1
  const findStar = (which, star) => Object.keys(pan[which]).find(k => pan[which][k] === star)
  return {
    cai: findStar('xiang', period) || findStar('xiang', shengQi),
    wen: findStar('yun', 4),
    bing: findStar('yun', 2),
    sha: findStar('yun', 5),
  }
}

// 每宫断语：档位 + 主星当运/失令文案
export function palaceJudges(pan, period) {
  const shengQi = period % 9 + 1
  return PALACES.map(palace => {
    const y = pan.yun[palace]
    const s = pan.shan[palace]
    const x = pan.xiang[palace]
    let level
    if (s === 5 || x === 5) level = '煞'
    else if (s === period || x === period) level = '旺'
    else if (s === shengQi || x === shengQi) level = '吉'
    else if (s === 2 || x === 2) level = '凶'
    else level = '平'
    const pick = level === '煞' ? 5 : level === '旺' ? period : level === '吉' ? shengQi : level === '凶' ? 2 : x
    const info = stars.find(v => v.star === pick)
    const isDang = pick === period || pick === shengQi
    return { palace, yun: y, shan: s, xiang: x, level, brief: isDang ? info.dangYun : info.shiLing }
  })
}
```

> 特殊位文案（`specialPositions` 数据）由 UI 层（Task 8）直接引 `@/data/flyingStars`，本文件只返回宫位名，不引文案，故 import 仅需 `stars`。

- [ ] **Step 2: 更新 `fengShui.d.ts`**

追加：

```ts
export interface PalaceJudge {
  palace: string
  yun: number
  shan: number
  xiang: number
  level: '旺' | '吉' | '平' | '凶' | '煞'
  brief: string
}
export interface SpecialMap {
  cai?: string
  wen?: string
  bing?: string
  sha?: string
}
export function overallJudge(pan: Pan, shan: string, xiang: string, period: number): string
export function specialPositions(pan: Pan, period: number): SpecialMap
export function palaceJudges(pan: Pan, period: number): PalaceJudge[]
```

- [ ] **Step 3: 校验脚本追加 sanity 断言**

在 `scripts/verify-fengshui.mjs` 末尾（`if (failed)` 之前）追加：

```js
import { overallJudge, specialPositions, palaceJudges } from '../src/utils/fengShui.js'
// ↑ 追加在顶部 import 区

// —— 判断函数 sanity ——
const pan9 = buildPan('子', '午', 9)
check(overallJudge(pan9, '子', '午', 9) !== 'wangshan', '九运子山午向不应为旺山旺向（一运九运无旺山旺向）')
check(palaceJudges(pan9, 9).length === 9, 'palaceJudges 应返回 9 宫')
check(palaceJudges(pan9, 9).every(j => j.brief && j.brief.length > 0), '每宫断语 brief 不应为空')
const sp = specialPositions(pan9, 9)
check(sp.cai !== undefined && sp.wen !== undefined && sp.bing !== undefined && sp.sha !== undefined, '九运盘应四特殊位齐备')
```

- [ ] **Step 4: 运行校验脚本**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 编译与 lint**

Run: `pnpm build && npx eslint src/utils/fengShui.js src/utils/fengShui.d.ts`
Expected: 构建成功，无 lint 报错。（若 `specialTexts` 未用报错，临时删除该 import，Task 8 用到时再加回。）

- [ ] **Step 6: 提交**

```bash
git add src/utils/fengShui.js src/utils/fengShui.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 玄空大局判断/特殊位/每宫断语纯函数"
```

---

### Task 5: 已知案例回归（校验脚本固化）

**Files:**
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Consumes: `buildPan`、`overallJudge`（Task 3/4 产物）

- [ ] **Step 1: 追加案例回归断言**

在 `scripts/verify-fengshui.mjs` 末尾（`if (failed)` 之前）追加：

```js
// —— 已知案例回归（已手算 + 文献核对）——
// 五运子山午向 = 旺山旺向（山星1入中逆、向星9入中逆，旺星5双到山向）
{
  const pan = buildPan('子', '午', 5)
  check(overallJudge(pan, '子', '午', 5) === 'wangshan', '五运子山午向应为旺山旺向')
  check(pan.shan['坎'] === 5, '五运子山午向 山盘旺星5应在坎(坐山)')
  check(pan.xiang['离'] === 5, '五运子山午向 向盘旺星5应在离(向首)')
}
// 八运乾山巽向 = 旺山旺向（山星9逆、向星7逆；区分同元龙法 vs 简化阴阳法）
{
  const pan = buildPan('乾', '巽', 8)
  check(overallJudge(pan, '乾', '巽', 8) === 'wangshan', '八运乾山巽向应为旺山旺向')
  check(pan.shan['乾'] === 8, '八运乾山巽向 山盘旺星8应在乾(坐山)')
  check(pan.xiang['巽'] === 8, '八运乾山巽向 向盘旺星8应在巽(向首)')
}
// 七运子山午向 = 全局合十（每宫运星+山星=10）
{
  const pan = buildPan('子', '午', 7)
  for (const [pal, y] of Object.entries(pan.yun)) {
    check(y + pan.shan[pal] === 10, `七运子山午向 ${pal}宫 运星+山星应=10，实为 ${y + pan.shan[pal]}`)
  }
}
// 九运子山午向：山盘5入中逆、向盘4入中顺 —— 全盘核对
{
  const pan = buildPan('子', '午', 9)
  check(pan.shan['中'] === 5, '九运子山午向 山盘入中应为5')
  check(pan.xiang['中'] === 4, '九运子山午向 向盘入中应为4')
  const expectedShan = { 中: 5, 乾: 4, 兑: 3, 艮: 2, 离: 1, 坎: 9, 坤: 8, 震: 7, 巽: 6 }
  for (const [pal, v] of Object.entries(expectedShan)) {
    check(pan.shan[pal] === v, `九运子山午向 山盘${pal}应为${v}，实为${pan.shan[pal]}`)
  }
  const expectedXiang = { 中: 4, 乾: 5, 兑: 6, 艮: 7, 离: 8, 坎: 9, 坤: 1, 震: 2, 巽: 3 }
  for (const [pal, v] of Object.entries(expectedXiang)) {
    check(pan.xiang[pal] === v, `九运子山午向 向盘${pal}应为${v}，实为${pan.xiang[pal]}`)
  }
}
```

- [ ] **Step 2: 运行校验脚本**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（4 组案例全过）。

- [ ] **Step 3: 提交**

```bash
git add scripts/verify-fengshui.mjs
git commit -m "test: 玄空飞星已知案例回归（五/七/八/九运）"
```

---

### Task 6: `Luopan.vue` 旋转罗盘

**Files:**
- Create: `src/components/fengshui/Luopan.vue`

**Interfaces:**
- Props: `mountain: string`（当前红针所指 24 山）
- Emits: `select(name: string)`（选中/拖拽吸附后上报）
- Consumes: `mountains`（`@/data/luopan`）、`trigrams`（`@/data/trigrams`）、`mountainAt`（`@/utils/fengShui`）

- [ ] **Step 1: 创建 `Luopan.vue`**

```vue
<template>
  <div class="luopan">
    <svg ref="svgEl" class="luopan-svg" viewBox="0 0 520 520" :style="{ cursor: dragging ? 'grabbing' : 'grab' }">
      <!-- 外装饰环（固定） -->
      <circle :cx="C" :cy="C" :r="228" fill="none" :stroke="theme.gold" stroke-width="1.6" />
      <circle :cx="C" :cy="C" :r="222" fill="none" :stroke="theme.goldLight" stroke-width="0.7" stroke-dasharray="2 5" />
      <circle :cx="C" :cy="C" :r="92" fill="none" :stroke="theme.goldLight" stroke-width="0.7" />

      <!-- 旋转内盘：24 山 + 八卦方位 -->
      <g :transform="`rotate(${rot} ${C} ${C})`">
        <!-- 拖拽命中圈（透明整圆） -->
        <circle :cx="C" :cy="C" :r="220" fill="transparent" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />

        <!-- 24 山 -->
        <g
          v-for="m in mountains"
          :key="m.name"
          :transform="`translate(${pos(m.angle, 196).x}, ${pos(m.angle, 196).y}) rotate(${m.angle})`"
          @pointerdown.stop.prevent="select(m.name)"
        >
          <rect x="-16" y="-14" width="32" height="30" rx="3" :fill="m.name === props.mountain ? 'rgba(178,58,46,0.14)' : 'transparent'" />
          <text class="mountain-name" :class="{ active: m.name === props.mountain }" text-anchor="middle" dominant-baseline="central">{{ m.name }}</text>
        </g>

        <!-- 八卦方位：卦符 + 卦名·洛书数 -->
        <g v-for="t in trigramAngles" :key="t.name" :transform="`translate(${pos(t.angle, 150).x}, ${pos(t.angle, 150).y})`" text-anchor="middle">
          <text class="tri-glyph" dominant-baseline="central" y="-8">{{ t.trigram }}</text>
          <text class="tri-sub" y="16">{{ t.name }}·{{ t.num }}</text>
        </g>
      </g>

      <!-- 固定指针（红针标坐山/朝向） -->
      <path :d="pointerPath" :fill="theme.cinnabar" />
      <!-- 对宫金点 + 对宫山名 -->
      <circle :cx="C" :cy="C + 212" r="5" :fill="theme.gold" />
      <text class="opposite-name" :x="C" :y="C + 230" text-anchor="middle" dominant-baseline="central">{{ opposite }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { mountains } from '@/data/luopan'
import { mountainAt, oppositeMountain } from '@/utils/fengShui'
import { theme } from '@/styles/theme'

const props = defineProps({
  mountain: { type: String, default: '子' },
})
const emit = defineEmits(['select'])

const C = 260
const svgEl = ref(null)
const dragging = ref(false)
const rot = ref(0)
let startAngle = 0
let startRot = 0

// 后天八卦方位角度（子/北 为 0°）
const trigramAngles = [
  { name: '坎', trigram: '☵', num: '一', angle: 0 },
  { name: '艮', trigram: '☶', num: '八', angle: 45 },
  { name: '震', trigram: '☳', num: '三', angle: 90 },
  { name: '巽', trigram: '☴', num: '四', angle: 135 },
  { name: '离', trigram: '☲', num: '九', angle: 180 },
  { name: '坤', trigram: '☷', num: '二', angle: 225 },
  { name: '兑', trigram: '☱', num: '七', angle: 270 },
  { name: '乾', trigram: '☰', num: '六', angle: 315 },
]

const angleOf = (name) => mountains.find(m => m.name === name)?.angle ?? 0
const opposite = () => oppositeMountain(props.mountain)

const pos = (a, r) => ({
  x: C + r * Math.sin((a * Math.PI) / 180),
  y: C - r * Math.cos((a * Math.PI) / 180),
})

const pointerPath = `M ${C} 14 L ${C + 9} 34 L ${C} 27 L ${C - 9} 34 Z`

// 从外部同步旋转（选中/父组件驱动）
watch(
  () => props.mountain,
  (m) => {
    if (!dragging.value) rot.value = -angleOf(m)
  },
  { immediate: true }
)

// 指针事件 → 山角坐标（0° 顶、顺时针）
function angleOfPoint(e) {
  const rect = svgEl.value.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  return (Math.atan2(x, -y) * 180) / Math.PI
}

function onDown(e) {
  dragging.value = true
  startAngle = angleOfPoint(e)
  startRot = rot.value
  svgEl.value.setPointerCapture(e.pointerId)
}
function onMove(e) {
  if (!dragging.value) return
  let delta = angleOfPoint(e) - startAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  rot.value = startRot + delta
}
function onUp() {
  if (!dragging.value) return
  dragging.value = false
  const snapped = Math.round(rot.value / 15) * 15
  rot.value = snapped
  emit('select', mountainAt(-snapped))
}

function select(name) {
  rot.value = -angleOf(name)
  emit('select', name)
}
</script>

<style scoped>
.luopan-svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  touch-action: none;
}
.mountain-name {
  font-size: 17px;
  fill: var(--ink);
  pointer-events: none;
}
.mountain-name.active {
  fill: var(--cinnabar);
  font-size: 19px;
  font-weight: 700;
}
.tri-glyph {
  font-size: 26px;
  fill: var(--ink-light);
  pointer-events: none;
}
.tri-sub {
  font-size: 11px;
  fill: var(--ink-light);
  pointer-events: none;
}
.opposite-name {
  font-size: 13px;
  fill: var(--gold);
  pointer-events: none;
}
</style>
```

> 说明：命中圈放在旋转组内、山文字之下，拖拽在整圆上触发；点击山文字用 `@pointerdown.stop` 与拖拽隔离。`props.mountain` 在模板中直接引用需先在 script 中 `const props = defineProps(...)`（已写），并注意模板内对 `props` 的引用方式（Vue 3 模板可访问 `props` 对象本身，也可解构）。

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/fengshui/Luopan.vue`
Expected: 构建成功，无 lint 报错。（若模板引用 `props.mountain` 报错，改为解构 `const { mountain } = defineProps(...)` 并在模板用 `mountain`。）

- [ ] **Step 3: 提交**

```bash
git add src/components/fengshui/Luopan.vue
git commit -m "feat: 旋转罗盘 Luopan —— 24山/八卦方位环、拖拽吸附、点按选中"
```

---

### Task 7: `FlyingStarPan.vue` 飞星盘面

**Files:**
- Create: `src/components/fengshui/FlyingStarPan.vue`

**Interfaces:**
- Props: `judges: PalaceJudge[]`（9 条，含 palace/yun/shan/xiang/level/brief）、`special: SpecialMap`（cai/wen/bing/sha 宫位）
- Consumes: `PALACE_NUM`（`@/utils/fengShui`）用于中宫判定；`theme`

- [ ] **Step 1: 创建 `FlyingStarPan.vue`**

```vue
<template>
  <div class="pan-grid">
    <div
      v-for="j in judges"
      :key="j.palace"
      class="pan-cell"
      :class="[`lv-${j.level}`, { center: j.palace === '中' }]"
    >
      <span class="badges">{{ badgesOf(j.palace) }}</span>
      <div class="cell-stars">
        <span class="star yun">{{ j.yun }}</span>
        <span class="star shan">{{ j.shan }}</span>
        <span class="star xiang">{{ j.xiang }}</span>
      </div>
      <div class="cell-level">{{ j.level }}</div>
      <div class="cell-palace">{{ palaceLabel(j.palace) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PALACE_NUM } from '@/utils/fengShui'

const props = defineProps({
  judges: { type: Array, default: () => [] },
  special: { type: Object, default: () => ({}) },
})

// 宫位 → 方位标注
const DIR = {
  坎: '北', 艮: '东北', 震: '东', 巽: '东南',
  离: '南', 坤: '西南', 兑: '西', 乾: '西北', 中: '中',
}
const palaceLabel = (p) => `${DIR[p]}·${PALACE_NUM[p]}`

function badgesOf(palace) {
  const out = []
  if (props.special.cai === palace) out.push('财')
  if (props.special.wen === palace) out.push('文')
  if (props.special.bing === palace) out.push('病')
  if (props.special.sha === palace) out.push('煞')
  return out.join(' ')
}
</script>

<style scoped>
.pan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: min(78vw, 420px);
  aspect-ratio: 1;
  margin: 0 auto;
}
.pan-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  background: var(--scroll);
  min-height: 0;
}
.cell-stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.star {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  color: var(--scroll);
  border: 1px solid rgba(250, 243, 232, 0.4); /* 深色底（煞）上仍可见 */
}
.star.yun { background: var(--gold); }
.star.shan { background: var(--ink-light); }
.star.xiang { background: var(--ink); }
.cell-level { font-size: 12px; letter-spacing: 0.1em; }
.cell-palace { font-size: 11px; color: var(--ink-light); }

.lv-旺 { background: #f6e3df; }
.lv-旺 .cell-level { color: var(--cinnabar); }
.lv-吉 { background: #faf3e0; }
.lv-吉 .cell-level { color: var(--gold); }
.lv-凶 { background: #ece7dc; }
.lv-凶 .cell-level { color: var(--ink-light); }
.lv-煞 { background: #2c2416; }
.lv-煞 .star,
.lv-煞 .cell-level { color: #faf3e8; }
.lv-煞 .cell-palace { color: rgba(250, 243, 232, 0.7); }
.lv-平 { background: var(--scroll); }
.lv-平 .cell-level { color: var(--ink-light); }

.badges {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 11px;
  color: var(--cinnabar);
  letter-spacing: 0.05em;
}
.pan-cell.center .cell-palace { display: none; }
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/fengshui/FlyingStarPan.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 3: 提交**

```bash
git add src/components/fengshui/FlyingStarPan.vue
git commit -m "feat: 九宫飞星盘面 FlyingStarPan —— 三星排布/档位配色/特殊位角标"
```

---

### Task 8: `FengShuiView.vue` 全屏页

**Files:**
- Create: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Emits: `close`
- Consumes: `Luopan`、`FlyingStarPan`、`mountains`/`yunPeriods`（`@/data/luopan`）、`stars`/`overallJudgments`/`specialPositions`（`@/data/flyingStars`）、`buildPan`/`overallJudge`/`specialPositions`(fn)/`palaceJudges`/`oppositeMountain`（`@/utils/fengShui`）
- Produces: 全屏 overlay 页（坐向口径切换 + 元运段选 + 读句 + 大局 banner + 盘面 + 滚动解读区）

- [ ] **Step 1: 创建 `FengShuiView.vue`**

```vue
<template>
  <div class="fs-view" role="dialog" aria-label="风水 · 罗盘宅运">
    <header class="fs-header">
      <h1 class="fs-title">风水 · 罗盘宅运</h1>
      <button class="fs-close" type="button" aria-label="关闭" @click="$emit('close')">×</button>
    </header>

    <div class="fs-body">
      <section class="fs-luopan">
        <Luopan :mountain="selectedDir" @select="selectedDir = $event" />
      </section>

      <section class="fs-controls">
        <div class="mode-toggle" role="group" aria-label="坐向口径">
          <button type="button" :class="{ active: mode === '坐山' }" @click="mode = '坐山'">坐山</button>
          <button type="button" :class="{ active: mode === '朝向' }" @click="mode = '朝向'">朝向</button>
        </div>

        <div class="period-row" role="group" aria-label="元运">
          <button
            v-for="p in 9"
            :key="p"
            type="button"
            class="period-btn"
            :class="{ active: period === p }"
            @click="period = p"
          >{{ p }}</button>
        </div>
        <p class="period-range">{{ periodInfo }}</p>

        <p class="readout">坐{{ shan }}朝{{ xiang }}</p>
        <p class="overall-banner">
          <b>{{ overallInfo.name }}</b> —— {{ overallInfo.text }}
        </p>
      </section>

      <section class="fs-pan">
        <FlyingStarPan :judges="judges" :special="special" />
      </section>

      <section class="fs-reading">
        <h2>宅运解读</h2>
        <p class="advice">{{ overallInfo.advice }}</p>

        <h2>九宫分述</h2>
        <ul class="palace-list">
          <li v-for="j in judges" :key="j.palace" class="palace-line">
            <span class="palace-tag">{{ j.palace }}</span>
            <span class="lvl" :class="`lv-${j.level}`">{{ j.level }}</span>
            <span class="brief">{{ j.brief }}</span>
          </li>
        </ul>

        <h2>特殊方位</h2>
        <ul class="special-list">
          <li v-if="special.cai">财位：<b>{{ special.cai }}</b> —— {{ spText.cai.text }}</li>
          <li v-if="special.wen">文昌位：<b>{{ special.wen }}</b> —— {{ spText.wen.text }}</li>
          <li v-if="special.bing">病符位：<b>{{ special.bing }}</b> —— {{ spText.bing.text }}</li>
          <li v-if="special.sha">五黄煞：<b>{{ special.sha }}</b> —— {{ spText.sha.text }}</li>
        </ul>

        <p class="fs-disclaimer">玄空飞星 · 文化参考</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Luopan from './Luopan.vue'
import FlyingStarPan from './FlyingStarPan.vue'
import { yunPeriods } from '@/data/luopan'
import { overallJudgments, specialPositions as spText } from '@/data/flyingStars'
import { buildPan, overallJudge, specialPositions, palaceJudges, oppositeMountain } from '@/utils/fengShui'

defineEmits(['close'])

const mode = ref('坐山')        // '坐山' | '朝向'
const selectedDir = ref('子')   // 红针所指 24 山（默认坐子朝午）
const period = ref(9)           // 默认九运（2024-2043）

// 坐山/朝向：口径切换只改解释，山盘/向盘始终用坐山/朝向
const shan = computed(() => (mode.value === '坐山' ? selectedDir.value : oppositeMountain(selectedDir.value)))
const xiang = computed(() => oppositeMountain(shan.value))
const pan = computed(() => buildPan(shan.value, xiang.value, period.value))
const judges = computed(() => palaceJudges(pan.value, period.value))
const overall = computed(() => overallJudge(pan.value, shan.value, xiang.value, period.value))
const overallInfo = computed(() => overallJudgments[overall.value])
const special = computed(() => specialPositions(pan.value, period.value))
const periodInfo = computed(() => {
  const p = yunPeriods.find(x => x.period === period.value)
  return p ? `${p.yuan}${period.value}运（${p.start}-${p.end}）` : ''
})
</script>

<style scoped>
.fs-view {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.fs-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--gold);
  background: var(--scroll);
}
.fs-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 24px;
  color: var(--deep-ink);
  margin: 0;
  letter-spacing: 0.1em;
}
.fs-close {
  width: 40px;
  height: 40px;
  font-size: 26px;
  line-height: 1;
  color: var(--ink-light);
  background: none;
  border: none;
  border-radius: 50%;
}
.fs-close:hover { color: var(--cinnabar); background: rgba(178, 58, 46, 0.08); }
.fs-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 48px;
}
.fs-luopan { width: min(70vw, 380px); margin: 0 auto 10px; }
.fs-controls { text-align: center; margin-bottom: 14px; }
.mode-toggle {
  display: inline-flex;
  border: 1px solid var(--gold);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}
.mode-toggle button {
  padding: 7px 22px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: none;
  transition: background-color 0.2s, color 0.2s;
}
.mode-toggle button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.period-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.period-btn {
  width: 34px;
  height: 34px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}
.period-btn.active {
  background: var(--gold);
  color: #faf3e8;
}
.period-range { font-size: 12px; color: var(--ink-light); margin: 0 0 10px; }
.readout {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--cinnabar);
  margin: 0 0 8px;
}
.overall-banner {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0 auto;
  max-width: 520px;
  padding: 8px 14px;
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  background: var(--scroll);
}
.fs-pan { margin: 6px 0 18px; }
.fs-reading { max-width: 560px; margin: 0 auto; }
.fs-reading h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.advice { font-size: 14px; line-height: 1.8; color: var(--ink); margin: 0; }
.palace-list, .special-list { list-style: none; margin: 0; padding: 0; }
.palace-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  padding: 6px 0;
  border-bottom: 1px dotted var(--gold-light);
}
.palace-tag {
  flex: none;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 18px;
  color: var(--cinnabar);
}
.lvl {
  flex: none;
  font-size: 12px;
  letter-spacing: 0.05em;
  width: 28px;
  text-align: center;
}
.lv-旺 { color: var(--cinnabar); }
.lv-吉 { color: var(--gold); }
.lv-凶, .lv-煞 { color: var(--ink-light); }
.lv-平 { color: var(--ink-light); }
.brief { flex: 1; }
.special-list li { font-size: 14px; line-height: 1.9; color: var(--ink); padding: 6px 0; }
.fs-disclaimer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--ink-light);
}

@media (min-width: 820px) {
  .fs-body { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }
  .fs-luopan { grid-row: 1 / 3; margin: 0; }
  .fs-pan { margin: 0; }
}
</style>
```

> 说明：横屏（≥820px）左右分栏——左列罗盘，右列控制/盘面/解读。

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/fengshui/FengShuiView.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 3: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 风水全屏页 FengShuiView —— 口径切换/元运/读句/盘面/解读区"
```

---

### Task 9: `Home.vue` 入口 + 全量走查

**Files:**
- Modify: `src/views/Home.vue`（用 Edit 精确插入，不整文件重写；文件有未提交改动）

**Interfaces:**
- Consumes: `FengShuiView`

- [ ] **Step 1: script 引入与开关**

在 `Home.vue` `<script setup>` 中，import 区追加：

```js
import FengShuiView from '../components/fengshui/FengShuiView.vue'
```

在 `const showLibrary = ref(false)` 旁追加：

```js
const showFengShui = ref(false)
```

- [ ] **Step 2: 模板加入口与 overlay**

在 `.poster-footer` 中「浏览六十四卦 ▸」按钮之后追加入口按钮：

```html
<button class="library-link" type="button" @click="showFengShui = true">风水罗盘 ▸</button>
```

在模板底部（`<ResultScroll v-if="state === 'reading'" />` 之后）追加：

```html
<FengShuiView v-if="showFengShui" @close="showFengShui = false" />
```

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/views/Home.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下底部多出「风水罗盘 ▸」，点击打开全屏页。

- [ ] **Step 4: 全量验证**

Run: `node scripts/verify-fengshui.mjs && pnpm build && npx eslint . && npx prettier --check .`
Expected: 校验脚本 PASS、构建成功、lint 与格式全过。

- [ ] **Step 5: 手动走查（`pnpm dev`）**

逐项核对设计规格「验证方式」：

1. 挂图底部「风水罗盘 ▸」打开全屏页；「×」关闭回到挂图。
2. 旋转罗盘/点按山名 → 红针下读句「坐X朝Y」实时变化，飞星盘与解读区同步刷新。
3. 坐山⇄朝向切换：红针标注对象互换，读句「坐山/朝向」相应反推（如 坐子朝午 ↔ 坐午朝子）。
4. 元运 1-9 切换：年份区间文字更新，盘面刷新；默认九运。
5. 盘面每宫三星、档位配色、财/文/病/煞角标正确；中宫不显示方位。
6. 解读区：大局 banner、九宫分述、特殊方位文案齐全；页脚「玄空飞星 · 文化参考」。
7. 移动端（DevTools ≤600px）：罗盘不超宽、正文可滚动、盘面 3×3 完整；横屏 ≥820px 左右分栏。
8. `prefers-reduced-motion` 下无多余动画（本功能基本无动画，确认无闪烁即可）。

- [ ] **Step 6: 收尾提交**

```bash
git add src/views/Home.vue
git commit -m "feat: 挂图加入风水罗盘入口并接入 FengShuiView"
```

确认 `git status`：仅剩 `.gitignore` 与 `HexagramSquareCircle.vue` 的既存未提交改动（保持不动，不纳入本计划提交）。
