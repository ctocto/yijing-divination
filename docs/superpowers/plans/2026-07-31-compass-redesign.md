# 易经占卜 UI/UX 重设计 — 古典东方罗盘 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有两页式（首页罗盘图 + 暗色占卜页）重构为单页「古典东方美学罗盘」：以可拖拽旋转的罗盘为唯一交互中心，转盘出卦、点击浏览 64 卦、结果以卷轴一镜到底展开。

**Architecture:** 单页 + 状态机（idle / spinning / reading）。`useCompass` composable 持有全局共享状态；`CompassCore` 为 SVG 组合根（旋转组含罗盘面/刻度环/卦图环 + 固定指针 + 中心太极）；`ResultScroll` 在 reading 态展开卷轴。八宫卦序数据驱动 64 卦环形排布。

**Tech Stack:** Vue 3 (`<script setup lang="ts">`)、Vite、vue-router（仅保留 `/`）、纯 CSS/SVG（零新依赖）。字体：Google Fonts `Ma Shan Zheng` + `Noto Serif SC`。

## Global Constraints

- **无测试框架**（规格明确排除 Vitest/Cypress）。自动化验证只有 `scripts/verify-hexagrams.mjs` 数据完整性脚本；其余靠 `pnpm build` + 浏览器手动检查。
- **包管理器 pnpm**；**不得新增依赖**（保持零 UI 库/CSS 框架/动画库）。
- **配色严格遵循规格表**：宣纸 `#f5f0e8`、墨 `#2c2416`、淡墨 `#6b5e4a`、朱砂 `#c0392b`、金线 `#b8943e`、淡金 `#dcc99a`、卷轴底 `#faf6ed`。
- **中文 UI 与注释**；SFC 使用 `<script setup lang="ts">`，JS 模块配套 `.d.ts`（项目既有 Hybrid JS+.d.ts 模式）。
- 全局状态一律经 `useCompass()` 单例获取，组件不各自持有业务状态。
- 桌面优先；移动端完整适配不在本次范围。
- 数据二进制约定：`'1'` 阳爻、`'0'` 阴爻，**自下而上**（索引 0 = 初爻）；渲染显示时 `reverse()`。
- 提交粒度：每个 Task 末尾一个 commit。

---

### Task 1: 全局基础（index.html / 全局样式 / tsconfig / App.vue / favicon）

**Files:**
- Modify: `index.html`
- Rewrite: `src/style.css`
- Rewrite: `src/App.vue`
- Modify: `tsconfig.json`
- Create: `public/favicon.svg`

**Interfaces:**
- Produces: 全局 CSS 自定义属性（`--paper`、`--ink`、`--ink-light`、`--cinnabar`、`--gold`、`--gold-light`、`--scroll`），后续所有组件的 scoped style 直接引用这些变量。

- [ ] **Step 1: 重写 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>易经占卜</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 `public/favicon.svg`**（朱砂底 + 乾卦三连白线）

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#c0392b"/>
  <g fill="#faf6ed">
    <rect x="14" y="16" width="36" height="5" rx="2"/>
    <rect x="14" y="29" width="36" height="5" rx="2"/>
    <rect x="14" y="42" width="36" height="5" rx="2"/>
  </g>
</svg>
```

- [ ] **Step 3: 重写 `src/style.css`**（彻底移除 Vite 脚手架样式）

```css
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;700&display=swap');

:root {
  --paper: #f5f0e8;
  --ink: #2c2416;
  --ink-light: #6b5e4a;
  --cinnabar: #c0392b;
  --gold: #b8943e;
  --gold-light: #dcc99a;
  --scroll: #faf6ed;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif;
  line-height: 1.6;
  color: var(--ink);
  background-color: var(--paper);
}

* { box-sizing: border-box; }

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

body {
  background-color: var(--paper);
  color: var(--ink);
}

#app {
  max-width: none;
  text-align: left;
}

button {
  font-family: inherit;
  cursor: pointer;
}
```

- [ ] **Step 4: 重写 `src/App.vue`**（去掉与全局冲突的遗留样式）

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>
```

- [ ] **Step 5: 修改 `tsconfig.json`** — 在 `paths` 中加入另外两个已由 vite.config.js 定义、但 tsconfig 缺失的别名

```json
"paths": {
  "@/*": ["src/*"],
  "@components/*": ["src/components/*"],
  "@utils/*": ["src/utils/*"]
}
```

- [ ] **Step 6: 验证**

Run: `pnpm build`
Expected: 构建通过；`dist/index.html` 标题为「易经占卜」、`lang="zh-CN"`。

Run: `pnpm dev`，浏览器打开
Expected: 页面背景为宣纸色 `#f5f0e8`，无 Vite 默认紫字/灰底。

- [ ] **Step 7: Commit**

```bash
git add index.html public/favicon.svg src/style.css src/App.vue tsconfig.json
git commit -m "style: 全局基础 —— 中文标题/宣纸主题/字体/路径别名"
```

---

### Task 2: 数据层（八宫卦序 / 八卦标注 / 主题色 / hexagrams 修正与补全）

**Files:**
- Create: `src/data/palaces.js`, `src/data/palaces.d.ts`
- Create: `src/data/trigrams.js`, `src/data/trigrams.d.ts`
- Create: `src/styles/theme.js`, `src/styles/theme.d.ts`
- Create: `scripts/verify-hexagrams.mjs`
- Modify: `src/data/hexagrams.js`（修正 binary + 追加 4 卦）

**Interfaces:**
- Produces: `palaces`（8 宫 × 8 卦名，京房八宫序）、`trigrams`（八卦标注数据）、`theme`（调色板常量）。后续组件按名查卦、按宫排布。
- Consumes: 无。

- [ ] **Step 1: 创建 `src/data/palaces.js`**

```js
// 八宫卦序（京房八宫）——每宫 8 卦，首卦为纯卦
export const palaces = [
  { name: '乾宫', trigram: '乾', hexagrams: ['乾', '姤', '遯', '否', '观', '剥', '晋', '大有'] },
  { name: '兑宫', trigram: '兑', hexagrams: ['兑', '困', '萃', '咸', '蹇', '谦', '小过', '归妹'] },
  { name: '离宫', trigram: '离', hexagrams: ['离', '旅', '鼎', '未济', '蒙', '涣', '讼', '同人'] },
  { name: '震宫', trigram: '震', hexagrams: ['震', '豫', '解', '恒', '升', '井', '大过', '随'] },
  { name: '巽宫', trigram: '巽', hexagrams: ['巽', '小畜', '家人', '益', '无妄', '噬嗑', '颐', '蛊'] },
  { name: '坎宫', trigram: '坎', hexagrams: ['坎', '节', '屯', '既济', '革', '丰', '明夷', '师'] },
  { name: '艮宫', trigram: '艮', hexagrams: ['艮', '贲', '大畜', '损', '睽', '履', '中孚', '渐'] },
  { name: '坤宫', trigram: '坤', hexagrams: ['坤', '复', '临', '泰', '大壮', '夬', '需', '比'] },
]
```

- [ ] **Step 2: 创建 `src/data/palaces.d.ts`**

```ts
export interface Palace {
  name: string
  trigram: string
  hexagrams: string[]
}
export const palaces: Palace[]
```

- [ ] **Step 3: 创建 `src/data/trigrams.js`**（八卦标注，顺序与八宫一致）

```js
// 八卦标注数据（顺序：乾兑离震巽坎艮坤，与八宫扇区一致）
export const trigrams = [
  { name: '乾', trigram: '☰', wuxing: '金', direction: '西北', num: '六', heavenlyStem: '壬癸', earthlyBranch: '戌亥', xiang: '天' },
  { name: '兑', trigram: '☱', wuxing: '金', direction: '正西', num: '七', heavenlyStem: '庚辛', earthlyBranch: '申酉', xiang: '泽' },
  { name: '离', trigram: '☲', wuxing: '火', direction: '正南', num: '九', heavenlyStem: '丙丁', earthlyBranch: '巳午', xiang: '火' },
  { name: '震', trigram: '☳', wuxing: '木', direction: '正东', num: '三', heavenlyStem: '甲乙', earthlyBranch: '寅卯', xiang: '雷' },
  { name: '巽', trigram: '☴', wuxing: '木', direction: '东南', num: '四', heavenlyStem: '戊己', earthlyBranch: '辰巳', xiang: '风' },
  { name: '坎', trigram: '☵', wuxing: '水', direction: '正北', num: '一', heavenlyStem: '壬癸', earthlyBranch: '子', xiang: '水' },
  { name: '艮', trigram: '☶', wuxing: '土', direction: '东北', num: '八', heavenlyStem: '丙丁', earthlyBranch: '丑寅', xiang: '山' },
  { name: '坤', trigram: '☷', wuxing: '土', direction: '西南', num: '二', heavenlyStem: '戊己', earthlyBranch: '未申', xiang: '地' },
]
```

- [ ] **Step 4: 创建 `src/data/trigrams.d.ts`**

```ts
export interface Trigram {
  name: string
  trigram: string
  wuxing: string
  direction: string
  num: string
  heavenlyStem: string
  earthlyBranch: string
  xiang: string
}
export const trigrams: Trigram[]
```

- [ ] **Step 5: 创建 `src/styles/theme.js`**

```js
// 设计规格调色板（与 style.css 中的 CSS 变量一一对应，供 SVG 属性使用）
export const theme = {
  paper: '#f5f0e8',
  ink: '#2c2416',
  inkLight: '#6b5e4a',
  cinnabar: '#c0392b',
  gold: '#b8943e',
  goldLight: '#dcc99a',
  scroll: '#faf6ed',
}
```

- [ ] **Step 6: 创建 `src/styles/theme.d.ts`**

```ts
export const theme: {
  paper: string
  ink: string
  inkLight: string
  cinnabar: string
  gold: string
  goldLight: string
  scroll: string
}
```

- [ ] **Step 7: 创建 `scripts/verify-hexagrams.mjs`**（数据完整性校验脚本）

```js
// 校验 src/data/hexagrams.js：64 卦、binary 唯一、且与卦象构成（上下卦）一致
// 运行：node scripts/verify-hexagrams.mjs
const expected = {
  乾: '111111', 坤: '000000', 屯: '100010', 蒙: '010001',
  需: '111010', 讼: '010111', 师: '000010', 比: '010000',
  小畜: '111011', 履: '110111', 泰: '111000', 否: '000111',
  同人: '101111', 大有: '111101', 谦: '001000', 豫: '000100',
  随: '100110', 蛊: '011001', 临: '110000', 观: '000011',
  噬嗑: '100101', 贲: '101001', 剥: '000001', 复: '100000',
  无妄: '100111', 大畜: '111001', 颐: '100001', 大过: '011110',
  坎: '010010', 离: '101101', 咸: '001110', 恒: '011100',
  遯: '001111', 大壮: '111100', 晋: '000101', 明夷: '101000',
  家人: '101011', 睽: '110101', 蹇: '001010', 解: '010100',
  损: '110001', 益: '100011', 夬: '111110', 姤: '011111',
  萃: '000110', 升: '011000', 困: '010110', 井: '011010',
  革: '101110', 鼎: '011101', 震: '100100', 艮: '001001',
  渐: '001011', 归妹: '110100', 丰: '101100', 旅: '001101',
  巽: '011011', 兑: '110110', 涣: '010011', 节: '110010',
  中孚: '110011', 小过: '001100', 既济: '101010', 未济: '010101',
}

const { hexagrams } = await import('../src/data/hexagrams.js')
let failed = false

if (hexagrams.length !== 64) {
  console.error(`数量错误：${hexagrams.length}，应为 64`)
  failed = true
}

const seen = new Set()
for (const h of hexagrams) {
  if (seen.has(h.binary)) {
    console.error(`binary 重复：${h.name}（${h.binary}）`)
    failed = true
  }
  seen.add(h.binary)
  if (expected[h.name] !== h.binary) {
    console.error(`binary 错误：${h.name} 应为 ${expected[h.name]}，实为 ${h.binary}`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('✓ 64 卦数据完整，binary 全部正确，无重复')
```

- [ ] **Step 8: 运行校验脚本，确认其当前失败**

Run: `node scripts/verify-hexagrams.mjs`
Expected: FAIL（输出大量「binary 错误」与「数量错误」，证明问题存在）。

- [ ] **Step 9: 修正 `src/data/hexagrams.js`**

对每条记录，按**卦名**匹配 `expected` 表，将 `binary` 字段改为表内值。**不要改动 `text` 与 `lines`**（经典文本已正确）。例如：
- `噬嗑` 的 binary 从 `"101011"` 改为 `"100101"`
- `贲` 从 `"110101"` 改为 `"101001"`
- `夬` 从 `"111011"` 改为 `"111110"`
- `姤` 从 `"110111"` 改为 `"011111"`
- `临` 从 `"000011"` 改为 `"110000"`
- 其余按 Step 7 表中同名记录逐一修改。

然后在数组末尾（`节` 之后）追加以下 4 条：

```js
  {
    "binary": "110011",
    "name": "中孚",
    "text": "中孚，豚鱼吉。利涉大川，利贞。",
    "lines": [
      "初九：虞吉，有它不燕。",
      "九二：鸣鹤在阴，其子和之。我有好爵，吾与尔靡之。",
      "六三：得敌，或鼓或罢，或泣或歌。",
      "六四：月几望，马匹亡，无咎。",
      "九五：有孚挛如，无咎。",
      "上九：翰音登于天，贞凶。"
    ]
  },
  {
    "binary": "001100",
    "name": "小过",
    "text": "小过，亨，利贞。可小事，不可大事。飞鸟遗之音，不宜上，宜下，大吉。",
    "lines": [
      "初六：飞鸟以凶。",
      "六二：过其祖，遇其妣；不及其君，遇其臣，无咎。",
      "九三：弗过防之，从或戕之，凶。",
      "九四：无咎，弗过遇之。往厉必戒，勿用永贞。",
      "六五：密云不雨，自我西郊。公弋取彼在穴。",
      "上六：弗遇过之，飞鸟离之，凶，是谓灾眚。"
    ]
  },
  {
    "binary": "101010",
    "name": "既济",
    "text": "既济，亨小，利贞。初吉终乱。",
    "lines": [
      "初九：曳其轮，濡其尾，无咎。",
      "六二：妇丧其茀，勿逐，七日得。",
      "九三：高宗伐鬼方，三年克之，小人勿用。",
      "六四：繻有衣袽，终日戒。",
      "九五：东邻杀牛，不如西邻之禴祭，实受其福。",
      "上六：濡其首，厉。"
    ]
  },
  {
    "binary": "010101",
    "name": "未济",
    "text": "未济，亨。小狐汔济，濡其尾，无攸利。",
    "lines": [
      "初六：濡其尾，吝。",
      "九二：曳其轮，贞吉。",
      "六三：未济，征凶，利涉大川。",
      "九四：贞吉，悔亡。震用伐鬼方，三年有赏于大国。",
      "六五：贞吉，无悔。君子之光，有孚，吉。",
      "上九：有孚于饮酒，无咎。濡其首，有孚失是。"
    ]
  }
```

- [ ] **Step 10: 运行校验脚本，确认通过**

Run: `node scripts/verify-hexagrams.mjs`
Expected: `✓ 64 卦数据完整，binary 全部正确，无重复`

- [ ] **Step 11: 构建验证**

Run: `pnpm build`
Expected: 构建通过。

- [ ] **Step 12: Commit**

```bash
git add src/data/hexagrams.js src/data/palaces.js src/data/palaces.d.ts src/data/trigrams.js src/data/trigrams.d.ts src/styles/theme.js src/styles/theme.d.ts scripts/verify-hexagrams.mjs
git commit -m "feat: 数据层 —— 八宫卦序/八卦标注/主题色，修正 60 卦 binary 并补全 64 卦"
```

---

### Task 3: `useCompass` 全局状态 composable

**Files:**
- Create: `src/composables/useCompass.js`, `src/composables/useCompass.d.ts`

**Interfaces:**
- Produces（后续所有组件依赖的精确签名）:
  - `state: Ref<'idle' | 'spinning' | 'reading'>`
  - `rotation: Ref<number>`（度，连续累计）
  - `selectedHexagram: Ref<object | null>`（点击浏览的卦象对象）
  - `divinationResult: Ref<object | null>`（占卜结果卦象对象）
  - `selectedDirection: Ref<string>`、`customDirection: Ref<string>`、`direction: ComputedRef<string>`
  - `setRotation(deg: number): void`、`setState(s): void`
  - `palaceIndexAt(deg: number): number`（指针所指宫位下标 0-7）
  - `completeSpin(): void`（出卦，置 reading 态）
  - `selectHexagram(h): void`、`clearSelection(): void`、`resetToIdle(): void`
- Consumes: `@/data/hexagrams`、`@/data/palaces`

- [ ] **Step 1: 创建 `src/composables/useCompass.js`**

```js
import { ref, computed } from 'vue'
import { hexagrams } from '@/data/hexagrams'
import { palaces } from '@/data/palaces'

// 模块级单例状态 —— 所有调用 useCompass() 的组件共享同一组 ref
const state = ref('idle')          // 'idle' | 'spinning' | 'reading'
const rotation = ref(0)            // 当前旋转角度（度，可连续累计）
const selectedHexagram = ref(null) // 点击浏览的卦象
const divinationResult = ref(null) // 占卜结果卦象对象
const selectedDirection = ref('')  // 方向下拉框
const customDirection = ref('')    // 自定义方向输入

export function useCompass() {
  const direction = computed(() =>
    selectedDirection.value === '其他'
      ? customDirection.value.trim()
      : selectedDirection.value
  )

  // 指针固定正上方（12 点方向）。宫位 i 中心角 = -90 + i*45；
  // 旋转 r 后指针所指宫位满足 (-90 + i*45 + r) ≡ -90 (mod 360) → i*45 ≡ -r
  function palaceIndexAt(deg) {
    const norm = ((deg % 360) + 360) % 360
    return Math.round(((360 - norm) % 360) / 45) % 8
  }

  // 旋转完全停止后调用：按指针宫位随机取一卦，进入阅读态
  function completeSpin() {
    const palace = palaces[palaceIndexAt(rotation.value)]
    const name = palace.hexagrams[Math.floor(Math.random() * palace.hexagrams.length)]
    divinationResult.value = hexagrams.find(h => h.name === name) || null
    selectedHexagram.value = null
    state.value = 'reading'
  }

  // 闲观态下点击卦符 → 浏览模式
  function selectHexagram(hexagram) {
    if (state.value !== 'idle') return
    selectedHexagram.value = hexagram
  }

  function clearSelection() {
    selectedHexagram.value = null
  }

  // 阅读态 → 闲观态
  function resetToIdle() {
    state.value = 'idle'
    divinationResult.value = null
    selectedHexagram.value = null
  }

  return {
    state,
    rotation,
    selectedHexagram,
    divinationResult,
    selectedDirection,
    customDirection,
    direction,
    setRotation: (deg) => { rotation.value = deg },
    setState: (s) => { state.value = s },
    palaceIndexAt,
    completeSpin,
    selectHexagram,
    clearSelection,
    resetToIdle,
  }
}
```

- [ ] **Step 2: 创建 `src/composables/useCompass.d.ts`**

```ts
export type CompassState = 'idle' | 'spinning' | 'reading'

export interface CompassStore {
  state: { value: CompassState }
  rotation: { value: number }
  selectedHexagram: { value: object | null }
  divinationResult: { value: object | null }
  selectedDirection: { value: string }
  customDirection: { value: string }
  direction: { value: string }
  setRotation: (deg: number) => void
  setState: (s: CompassState) => void
  palaceIndexAt: (deg: number) => number
  completeSpin: () => void
  selectHexagram: (h: object) => void
  clearSelection: () => void
  resetToIdle: () => void
}

export function useCompass(): CompassStore
```

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: 构建通过（新组件尚未被引用，仅验证语法与导入链）。

- [ ] **Step 4: Commit**

```bash
git add src/composables/useCompass.js src/composables/useCompass.d.ts
git commit -m "feat: useCompass 全局状态 —— 状态机/旋转/选卦/出卦"
```

---

### Task 4: `CompassRing` 旋转罗盘面（拖拽 + 惯性 + 出卦触发）

**Files:**
- Create: `src/components/compass/CompassRing.vue`

**Interfaces:**
- Consumes: `useCompass()`（`state`、`rotation`、`setRotation`、`setState`、`completeSpin`）、`@/data/palaces`、`@/styles/theme`
- Props: `center: number`、`discRadius: number`
- Produces: 拖拽旋转 + 松手惯性 + 停止后（若手势有效）调 `setState('spinning')` → 减速 → 吸附 → `completeSpin()`。

- [ ] **Step 1: 创建 `src/components/compass/CompassRing.vue`**

```vue
<template>
  <g
    class="compass-ring"
    :style="{ cursor: state === 'reading' ? 'default' : 'grab' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- 盘面 -->
    <circle :cx="center" :cy="center" :r="discRadius" fill="#fdf9ef" :stroke="theme.gold" stroke-width="1.5" />
    <circle :cx="center" :cy="center" :r="discRadius - 8" fill="none" :stroke="theme.goldLight" stroke-width="0.8" />
    <!-- 八条方位分隔线 -->
    <line
      v-for="i in 8"
      :key="`line-${i}`"
      :x1="center + (discRadius - 10) * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y1="center + (discRadius - 10) * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :x2="center + 14 * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y2="center + 14 * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :stroke="theme.goldLight"
      stroke-width="0.6"
    />
    <!-- 八宫名 -->
    <text
      v-for="(palace, i) in palaces"
      :key="palace.name"
      :x="center + 150 * Math.cos((i * 45 - 90) * Math.PI / 180)"
      :y="center + 150 * Math.sin((i * 45 - 90) * Math.PI / 180)"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="22"
      font-weight="bold"
      :fill="theme.ink"
      style="font-family: 'Ma Shan Zheng', 'STKaiti', cursive;"
    >{{ palace.name }}</text>
  </g>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { palaces } from '@/data/palaces'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

defineProps({
  center: { type: Number, required: true },
  discRadius: { type: Number, default: 200 },
})

const { state, rotation, setRotation, setState, completeSpin, palaceIndexAt } = useCompass()

const dragging = ref(false)
let startAngle = 0
let startRotation = 0
let lastPointerAngle = 0
let lastTime = 0
let velocity = 0        // deg/ms
let gestureTotal = 0    // 本次手势累计旋转（度）
let animFrame = null

// 指针相对圆心的角度（度）
function pointerAngle(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
}

function onPointerDown(e) {
  if (state.value === 'reading') return
  dragging.value = true
  e.currentTarget.setPointerCapture(e.pointerId)
  startAngle = pointerAngle(e)
  startRotation = rotation.value
  lastPointerAngle = startAngle
  lastTime = performance.now()
  velocity = 0
  gestureTotal = 0
  cancelAnimationFrame(animFrame)
}

function onPointerMove(e) {
  if (!dragging.value) return
  const now = performance.now()
  const cur = pointerAngle(e)
  let delta = cur - lastPointerAngle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  gestureTotal += delta
  setRotation(startRotation + gestureTotal)
  const dt = Math.max(1, now - lastTime)
  velocity = delta / dt
  lastPointerAngle = cur
  lastTime = now
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  // 旋转极小且速度极低 → 视为误触，不占卜
  if (Math.abs(gestureTotal) < 15 && Math.abs(velocity) < 0.3) return
  setState('spinning')
  animFrame = requestAnimationFrame(inertia)
}

function inertia() {
  velocity *= 0.985
  setRotation(rotation.value + velocity * 16)
  if (Math.abs(velocity) > 0.05) {
    animFrame = requestAnimationFrame(inertia)
  } else {
    animFrame = null
    snapToPalace()
  }
}

// 惯性停止后轻微吸附：将指针所指宫位中心对齐到正上方
function snapToPalace() {
  const idx = palaceIndexAt(rotation.value)
  const target = ((360 - idx * 45) % 360 + 360) % 360
  const current = ((rotation.value % 360) + 360) % 360
  let diff = target - current
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  const start = rotation.value
  const frames = 12
  let f = 0
  const step = () => {
    f += 1
    const t = f / frames
    // ease-out
    setRotation(start + diff * (1 - Math.pow(1 - t, 2)))
    if (f < frames) animFrame = requestAnimationFrame(step)
    else {
      animFrame = null
      completeSpin()
    }
  }
  animFrame = requestAnimationFrame(step)
}

onBeforeUnmount(() => cancelAnimationFrame(animFrame))
</script>
```

> 注：`snapToPalace` 中通过 `useCompass().palaceIndexAt(...)` 获取方法（单例，安全）。`state` 在阅读态禁用拖拽。

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建通过（语法/导入正确）。

- [ ] **Step 3: Commit**

```bash
git add src/components/compass/CompassRing.vue
git commit -m "feat: CompassRing 旋转罗盘面 —— 拖拽/惯性/吸附/出卦触发"
```

---

### Task 5: `HexagramGlyph` + `HexagramRing`（64 卦图环与浏览交互）

**Files:**
- Create: `src/components/compass/HexagramGlyph.vue`
- Create: `src/components/compass/HexagramRing.vue`

**Interfaces:**
- Consumes: `useCompass()`、`@/data/palaces`、`@/data/hexagrams`、`@/styles/theme`
- `HexagramGlyph` Props: `x: number`、`y: number`、`hexagram: object`、`highlighted: boolean`、`selected: boolean`；Emits: `click`
- Produces: 64 个卦符围绕罗盘排布（每宫 4 列 × 2 行），点击浏览/取消；`selectedHexagram` 时在该卦上方显示说明小标签。

- [ ] **Step 1: 创建 `src/components/compass/HexagramGlyph.vue`**

```vue
<template>
  <g
    class="hexagram-glyph"
    :class="{ highlighted, selected }"
    @click.stop="$emit('click')"
  >
    <rect :x="x - 20" :y="y - 15" width="40" height="30" rx="5" class="glyph-bg" :stroke="theme.gold" stroke-width="0.8" />
    <text
      :x="x"
      :y="y + 6"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="13"
      font-weight="bold"
      class="glyph-name"
    >{{ hexagram.name }}</text>
    <!-- 迷你六爻线 -->
    <g :transform="`translate(${x - 10}, ${y - 13})`">
      <g v-for="(line, li) in displayLines" :key="li" :transform="`translate(0, ${li * 2.4})`">
        <rect v-if="line === '1'" x="0" y="0" width="20" height="1.6" class="glyph-line" />
        <g v-else>
          <rect x="0" y="0" width="8" height="1.6" class="glyph-line" />
          <rect x="12" y="0" width="8" height="1.6" class="glyph-line" />
        </g>
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { theme } from '@/styles/theme'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  hexagram: { type: Object, required: true },
  highlighted: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
defineEmits(['click'])

const displayLines = computed(() => props.hexagram?.binary.split('').reverse() || [])
</script>

<style scoped>
.glyph-bg {
  fill: #fffdf6;
  transition: fill 0.2s, stroke-width 0.2s;
}
.glyph-name {
  fill: var(--ink);
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  pointer-events: none;
}
.glyph-line {
  fill: var(--ink);
  pointer-events: none;
}
.hexagram-glyph { cursor: pointer; }
.hexagram-glyph:hover .glyph-bg { fill: var(--gold-light); stroke-width: 1.2; }
.hexagram-glyph.selected .glyph-bg { fill: #f2d5cf; stroke: var(--cinnabar); stroke-width: 1.5; }
.hexagram-glyph.selected .glyph-name,
.hexagram-glyph.selected .glyph-line { fill: var(--cinnabar); }
.hexagram-glyph.highlighted .glyph-bg { fill: #f2d5cf; stroke: var(--cinnabar); stroke-width: 1.5; }
.hexagram-glyph.highlighted .glyph-name,
.hexagram-glyph.highlighted .glyph-line { fill: var(--cinnabar); }
.hexagram-glyph.highlighted {
  transform-box: fill-box;
  transform-origin: center;
  animation: glyph-pulse 0.4s ease 2;
}
@keyframes glyph-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
```

- [ ] **Step 2: 创建 `src/components/compass/HexagramRing.vue`**

```vue
<template>
  <g class="hexagram-ring">
    <template v-for="(palace, pIdx) in palaces" :key="pIdx">
      <HexagramGlyph
        v-for="(name, hIdx) in palace.hexagrams"
        :key="name"
        :x="positionOf(pIdx, hIdx).x"
        :y="positionOf(pIdx, hIdx).y"
        :hexagram="hexagramByName(name)"
        :highlighted="resultName === name"
        :selected="selectedName === name"
        @click="onGlyphClick(name)"
      />
    </template>

    <!-- 选中卦象的说明标签（矩形以平移点为几何中心，上方/下方不重叠卦符） -->
    <g v-if="selectedHexagram" :transform="`translate(${labelPos.x}, ${labelPos.y})`">
      <rect :x="-58" :y="-20" width="116" height="40" rx="6" fill="#fffdf6" :stroke="theme.gold" stroke-width="1" />
      <text
        x="0"
        y="-6"
        text-anchor="middle"
        font-size="14"
        font-weight="bold"
        :fill="theme.cinnabar"
        style="font-family: 'Ma Shan Zheng', 'STKaiti', cursive;"
      >{{ selectedHexagram.name }}</text>
      <text x="0" y="12" text-anchor="middle" font-size="11" :fill="theme.inkLight">{{ selectedHexagram.text.slice(0, 10) }}</text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HexagramGlyph from './HexagramGlyph.vue'
import { palaces } from '@/data/palaces'
import { hexagrams } from '@/data/hexagrams'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

const props = defineProps({
  center: { type: Number, required: true },
})

const { state, selectedHexagram, divinationResult, selectHexagram, clearSelection } = useCompass()

const R_OUTER = 330
const R_INNER = 300

function hexagramByName(name) {
  return hexagrams.find(h => h.name === name)
}

// 宫位 pIdx 内第 hIdx 个卦的坐标：4 列 × 2 行
function positionOf(pIdx, hIdx) {
  const col = hIdx % 4
  const row = Math.floor(hIdx / 4)
  const angle = (pIdx * 45 - 90 + (col - 1.5) * 7) * Math.PI / 180
  const r = row === 0 ? R_OUTER : R_INNER
  return {
    x: props.center + r * Math.cos(angle),
    y: props.center + r * Math.sin(angle),
  }
}

const selectedName = computed(() => selectedHexagram.value?.name || '')
const resultName = computed(() => divinationResult.value?.name || '')

// 说明标签位置：默认在卦符上方，靠顶部时翻转到下方避免溢出
const labelPos = computed(() => {
  const s = selectedHexagram.value
  if (!s) return { x: 0, y: 0 }
  for (let p = 0; p < palaces.length; p++) {
    const idx = palaces[p].hexagrams.indexOf(s.name)
    if (idx >= 0) {
      const pos = positionOf(p, idx)
      return pos.y < 80 ? { x: pos.x, y: pos.y + 44 } : { x: pos.x, y: pos.y - 44 }
    }
  }
  return { x: 0, y: 0 }
})

function onGlyphClick(name) {
  if (state.value !== 'idle') return
  if (selectedName.value === name) clearSelection()
  else selectHexagram(hexagramByName(name))
}
</script>
```

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: 构建通过。

- [ ] **Step 4: Commit**

```bash
git add src/components/compass/HexagramGlyph.vue src/components/compass/HexagramRing.vue
git commit -m "feat: 64 卦图环 —— 卦符卡片、八宫排布、点击浏览标签"
```

---

### Task 6: `ScaleRing` 刻度环

**Files:**
- Create: `src/components/compass/ScaleRing.vue`

**Interfaces:**
- Consumes: `@/data/trigrams`、`@/styles/theme`
- Props: `center: number`
- Produces: 介于盘面（r=195）与卦图环（内排 r=300）之间的静态标注层：八卦符号、宫名+五行、天干地支。

- [ ] **Step 1: 创建 `src/components/compass/ScaleRing.vue`**

```vue
<template>
  <g class="scale-ring">
    <!-- 环线 -->
    <circle :cx="center" :cy="center" :r="218" fill="none" :stroke="theme.gold" stroke-width="1" />
    <circle :cx="center" :cy="center" :r="285" fill="none" :stroke="theme.goldLight" stroke-width="0.6" />
    <!-- 扇区分隔线 -->
    <line
      v-for="i in 8"
      :key="`div-${i}`"
      :x1="center + 218 * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y1="center + 218 * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :x2="center + 285 * Math.cos(((i - 1) * 45 - 90) * Math.PI / 180)"
      :y2="center + 285 * Math.sin(((i - 1) * 45 - 90) * Math.PI / 180)"
      :stroke="theme.goldLight"
      stroke-width="0.6"
    />
    <!-- 每宫标注 -->
    <g v-for="(t, i) in trigrams" :key="t.name">
      <text
        :x="center + 236 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 236 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="15"
        :fill="theme.ink"
      >{{ t.trigram }}</text>
      <text
        :x="center + 254 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 254 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="11"
        :fill="theme.inkLight"
      >{{ t.name }} {{ t.wuxing }}</text>
      <text
        :x="center + 272 * Math.cos((i * 45 - 90) * Math.PI / 180)"
        :y="center + 272 * Math.sin((i * 45 - 90) * Math.PI / 180)"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="10"
        :fill="theme.inkLight"
      >{{ t.heavenlyStem }} {{ t.earthlyBranch }}</text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { trigrams } from '@/data/trigrams'
import { theme } from '@/styles/theme'

defineProps({
  center: { type: Number, required: true },
})
</script>
```

> 说明：规格曾计划复用 `TrigramSymbol`，但该组件渲染圆形卡片（radius 默认 25），放入稠密刻度环会与天干地支标注重叠；此处直接以文本渲染八卦符号，更贴合环形密度。

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建通过。

- [ ] **Step 3: Commit**

```bash
git add src/components/compass/ScaleRing.vue
git commit -m "feat: ScaleRing 刻度环 —— 八卦符号/宫名五行/天干地支"
```

---

### Task 7: `CompassCore` 罗盘组合根（旋转组 + 固定指针 + 中心太极 + 状态样式）

**Files:**
- Create: `src/components/compass/CompassCore.vue`

**Interfaces:**
- Consumes: `CompassRing`、`ScaleRing`、`HexagramRing`、`TaijiSymbol`（现有 `src/components/hexagram/TaijiSymbol.vue`）、`useCompass()`
- Props: 无
- Produces: 完整罗盘 SVG（720×720）：旋转组（盘面+刻度+卦图）随 `rotation` 转动；固定朱砂指针；中心太极（双击回闲观态）；`state-reading` 时缩小至左上角。

- [ ] **Step 1: 创建 `src/components/compass/CompassCore.vue`**

```vue
<template>
  <div class="compass-core" :class="`state-${state}`">
    <svg class="compass-svg" :viewBox="`0 0 ${SIZE} ${SIZE}`" @click.self="clearSelection">
      <!-- 外圈底色 -->
      <rect :x="4" :y="4" :width="SIZE - 8" :height="SIZE - 8" rx="20" fill="#fffdf6" :stroke="theme.gold" stroke-width="2" />

      <!-- 旋转组：盘面 + 刻度 + 卦图一起旋转 -->
      <g :transform="`rotate(${rotation} ${C} ${C})`">
        <CompassRing :center="C" :disc-radius="DISC_RADIUS" />
        <ScaleRing :center="C" />
        <HexagramRing :center="C" />
      </g>

      <!-- 固定指针（不随旋转） -->
      <path :d="pointerPath" :fill="theme.cinnabar" />

      <!-- 中心太极（静止，双击回到闲观态） -->
      <g class="taiji-center" @dblclick="resetToIdle">
        <TaijiSymbol :centerX="C" :centerY="C" :radius="60" :strokeColor="'#2c2416'" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CompassRing from './CompassRing.vue'
import ScaleRing from './ScaleRing.vue'
import HexagramRing from './HexagramRing.vue'
import TaijiSymbol from '../hexagram/TaijiSymbol.vue'
import { theme } from '@/styles/theme'
import { useCompass } from '@/composables/useCompass'

const SIZE = 720
const C = SIZE / 2
const DISC_RADIUS = 195

const { state, rotation, clearSelection, resetToIdle } = useCompass()

// 朱砂指针：顶部倒三角，尖端指向盘面上缘
const pointerPath = computed(() => {
  const baseY = C - DISC_RADIUS
  return `M ${C - 14} ${baseY - 42} L ${C + 14} ${baseY - 42} L ${C} ${baseY + 4} Z`
})
</script>

<style scoped>
.compass-core {
  transition: transform 0.6s ease-out;
}
.compass-svg {
  display: block;
  width: min(88vh, 88vw, 700px);
  height: auto;
  user-select: none;
}
.taiji-center {
  cursor: default;
}

/* 闲观态 / 旋转态：居中 */
.compass-core.state-idle,
.compass-core.state-spinning {
  transform: none;
}

/* 阅读态：缩小滑至左上角 */
.compass-core.state-reading {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}
.compass-core.state-reading .compass-svg {
  width: 700px;
  transform: scale(0.2286);
  transform-origin: top left;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建通过。

- [ ] **Step 3: Commit**

```bash
git add src/components/compass/CompassCore.vue
git commit -m "feat: CompassCore 罗盘组合根 —— 旋转组/固定指针/中心太极/状态缩放"
```

---

### Task 8: `ScrollContent` + `ResultScroll` 卷轴结果

**Files:**
- Create: `src/components/scroll/ScrollContent.vue`
- Create: `src/components/scroll/ResultScroll.vue`

**Interfaces:**
- Consumes: `useCompass()`（`state`、`divinationResult`、`selectedDirection`、`customDirection`、`direction`、`resetToIdle`）
- `ResultScroll` Props: 无；在 `state === 'reading'` 时由 Home 渲染
- Produces: 卷轴内容：方向选择 → 卦符六爻图 → 卦名 → 卦辞 → 爻辞 → 白话解读 → 「再起一卦」按钮。

- [ ] **Step 1: 创建 `src/components/scroll/ScrollContent.vue`**

```vue
<template>
  <div class="scroll-content">
    <!-- 方向选择 -->
    <div class="direction-row">
      <label for="scroll-direction">所问何事：</label>
      <select id="scroll-direction" v-model="selectedDirection">
        <option value="">无方向（开放问题）</option>
        <option value="事业">事业</option>
        <option value="情感">情感</option>
        <option value="健康">健康</option>
        <option value="学业">学业</option>
        <option value="财富">财富</option>
        <option value="家庭">家庭</option>
        <option value="其他">其他（请填写下方）</option>
      </select>
      <input
        v-if="selectedDirection === '其他'"
        v-model="customDirection"
        type="text"
        placeholder="请输入自定义方向"
        class="direction-input"
      />
    </div>

    <!-- 卦符图：六爻线 -->
    <div class="hexagram-figure">
      <svg viewBox="0 0 80 160" width="80" height="160">
        <g v-for="(line, i) in displayLines" :key="i">
          <line
            v-if="line === '1'"
            :x1="10" :x2="70"
            :y1="12 + i * 26" :y2="12 + i * 26"
            class="figure-line" stroke-linecap="round"
          />
          <g v-else>
            <line :x1="10" :x2="33" :y1="12 + i * 26" :y2="12 + i * 26" class="figure-line" stroke-linecap="round" />
            <line :x1="47" :x2="70" :y1="12 + i * 26" :y2="12 + i * 26" class="figure-line" stroke-linecap="round" />
          </g>
        </g>
      </svg>
    </div>

    <!-- 卦名 -->
    <h1 class="hexagram-name">{{ result?.name }}</h1>

    <!-- 卦辞 -->
    <p class="hexagram-text">{{ result?.text }}</p>

    <!-- 爻辞 -->
    <div class="line-texts">
      <p v-for="(line, i) in result?.lines || []" :key="i" class="line-text">
        <span class="dot" />{{ line }}
      </p>
    </div>

    <!-- 白话解读 -->
    <div class="colloquial">
      <h3>白话解读</h3>
      <p>{{ colloquialText }}</p>
    </div>

    <!-- 再起一卦 -->
    <button class="restart-btn" @click="resetToIdle">再起一卦</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompass } from '@/composables/useCompass'

const { divinationResult, selectedDirection, customDirection, direction, resetToIdle } = useCompass()

const result = computed(() => divinationResult.value)
const displayLines = computed(() => result.value?.binary.split('').reverse() || [])

const colloquialText = computed(() => {
  if (!result.value) return '——'
  const name = result.value.name
  const text = result.value.text
  const dir = direction.value ? `结合当前方向「${direction.value}」` : '结合当前情况'
  return `此卦为「${name}」，卦辞曰：${text}。${dir}，更需顺应时势、审时度势，从容应对。`
})
</script>

<style scoped>
.scroll-content {
  text-align: center;
  color: var(--ink);
}
.direction-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  font-size: 14px;
}
.direction-row select,
.direction-input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid var(--gold);
  border-radius: 4px;
  background: #fffdf6;
  color: var(--ink);
}
.direction-input { width: 150px; }

.hexagram-figure { margin: 8px auto 4px; }

.hexagram-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 48px;
  color: var(--cinnabar);
  margin: 12px 0 8px;
}
.hexagram-text {
  font-size: 18px;
  color: var(--ink);
  margin: 0 0 24px;
  line-height: 1.9;
}
.line-texts {
  text-align: left;
  max-width: 460px;
  margin: 0 auto 24px;
  border-top: 1px dashed var(--gold-light);
  padding-top: 12px;
}
.line-text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.8;
  margin: 8px 0;
}
.dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cinnabar);
  align-self: center;
}
.colloquial {
  text-align: left;
  max-width: 460px;
  margin: 0 auto 32px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 14px 18px;
}
.colloquial h3 {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 18px;
  color: var(--cinnabar);
  margin: 0 0 8px;
}
.colloquial p {
  font-size: 14px;
  color: var(--ink-light);
  line-height: 1.8;
  margin: 0;
}
.restart-btn {
  padding: 10px 28px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  background: var(--cinnabar);
  color: #fffdf6;
  letter-spacing: 0.15em;
  transition: transform 0.15s, box-shadow 0.2s;
}
.restart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(192, 57, 43, 0.4);
}
.figure-line {
  stroke: var(--ink);
  stroke-width: 7;
}
</style>
```

- [ ] **Step 2: 创建 `src/components/scroll/ResultScroll.vue`**

```vue
<template>
  <div class="result-scroll">
    <div class="scroll-sheet">
      <ScrollContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScrollContent from './ScrollContent.vue'
</script>

<style scoped>
.result-scroll {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 32px 32px 208px; /* 给左上角缩小罗盘留位 */
}
.scroll-sheet {
  width: 100%;
  max-width: 640px;
  max-height: 92vh;
  overflow-y: auto;
  background: var(--scroll);
  border-radius: 6px;
  border-left: 10px solid #d4c5a0;
  border-right: 10px solid #d4c5a0;
  box-shadow: 0 8px 40px rgba(44, 36, 22, 0.25);
  padding: 48px 56px 56px;
  animation: scroll-unfold 0.8s ease-out;
}
@keyframes scroll-unfold {
  from {
    clip-path: inset(0 0 100% 0);
    opacity: 0.4;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
</style>
```

- [ ] **Step 3: 验证**

Run: `pnpm build`
Expected: 构建通过。

- [ ] **Step 4: Commit**

```bash
git add src/components/scroll/ScrollContent.vue src/components/scroll/ResultScroll.vue
git commit -m "feat: 卷轴结果页 —— 方向选择/卦象/卦辞/爻辞/白话解读/再起一卦"
```

---

### Task 9: Home 单页重写 + 路由清理 + 删除死代码

**Files:**
- Rewrite: `src/views/Home.vue`
- Modify: `src/router/index.js`
- Delete: `src/components/HelloWorld.vue`, `src/components/HexagramChart.vue`, `src/views/Divination/HexagramDivination.vue`, `src/components/hexagram/HexagramDescription.vue`

**Interfaces:**
- Consumes: `CompassCore`、`ResultScroll`、`useCompass()`
- Produces: 最终单页；`state === 'reading'` 时渲染卷轴。

- [ ] **Step 1: 重写 `src/views/Home.vue`**

```vue
<template>
  <div class="compass-page" :class="`state-${state}`">
    <CompassCore />
    <ResultScroll v-if="state === 'reading'" />
  </div>
</template>

<script setup lang="ts">
import CompassCore from '../components/compass/CompassCore.vue'
import ResultScroll from '../components/scroll/ResultScroll.vue'
import { useCompass } from '../composables/useCompass'

const { state } = useCompass()
</script>

<style scoped>
.compass-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--paper);
  position: relative;
  overflow: hidden;
}
.compass-page.state-reading {
  display: block;
}
</style>
```

- [ ] **Step 2: 修改 `src/router/index.js`** — 删除 `/divination` 路由

```js
// 导入 Vue 和 Vue Router
import { createRouter, createWebHistory } from 'vue-router';

// 定义路由 —— 单页应用，罗盘承载全部功能
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

- [ ] **Step 3: 删除被替换/孤儿文件**

```bash
git rm src/components/HelloWorld.vue \
       src/components/HexagramChart.vue \
       src/views/Divination/HexagramDivination.vue \
       src/components/hexagram/HexagramDescription.vue
```

> 说明：`HexagramDescription.vue` 唯一消费者是 `HexagramDivination.vue`（本任务删除），属本次改动产生的孤儿代码。`HexagramSymbol.vue` / `HexagramRelationship.vue` 在改动前就未被使用，属既有死代码——按「只提示、不擅自删除」原则保留，不在此次删除。

- [ ] **Step 4: 清理 `src/views/Divination` 空目录**

```bash
rmdir src/views/Divination 2>/dev/null || true
```

- [ ] **Step 5: 验证**

Run: `pnpm build`
Expected: 构建通过，无残留引用旧组件。

Run: `pnpm dev`，浏览器打开 `/` 与刷新 `/divination`
Expected: `/` 显示新罗盘；`/divination` 返回 404 或由 dev server fallback 到首页（路由已移除）。

Run: `node scripts/verify-hexagrams.mjs`
Expected: `✓ 64 卦数据完整，binary 全部正确，无重复`

- [ ] **Step 6: Commit**

```bash
git add src/views/Home.vue src/router/index.js
git commit -m "feat: 单页罗盘 —— 重写 Home、移除 /divination 路由、清理死代码"
```

---

### Task 10: 端到端验证（手动验收清单）

**Files:** 无（纯验证）

- [ ] **Step 1: 启动并逐项验收**

Run: `pnpm dev`，浏览器打开 `http://localhost:5173/`

逐项核对规格「验证方式」：
1. 闲观态：罗盘全屏居中，宣纸背景，64 卦环绕可见，中心太极静止。
2. 拖拽罗盘面：跟手旋转；松手后有惯性减速；旋转不足 15° 视为误触不出卦。
3. 出卦：旋转停止后指针所指宫位内随机取一卦 → 对应卦符朱砂脉冲两次 → 罗盘缩小滑至左上角 → 卷轴自上而下展开。
4. 卷轴：可滚动查看方向选择、卦符六爻图、卦名、卦辞、六条爻辞、白话解读。
5. 方向选择器：切换「其他」出现自定义输入框；白话解读文案随方向变化。
6. 「再起一卦」：卷轴消失，罗盘滑回中心放大，回到闲观态。
7. 浏览模式：闲观态点击任意卦符 → 该卦高亮 + 上方浮现卦名/卦辞小标签；点击空白处或再次点击该卦 → 标签消失。
8. 双击中心太极：从阅读态直接回到闲观态。
9. 卦符迷你六爻线与卷轴卦符图：阳爻实线、阴爻断线，自上而下排列。

- [ ] **Step 2: 代码规范复查**

Run: `npx eslint src scripts`
Expected: 无 error（若有 warning 按提示修正后重跑）。

Run: `npx prettier --check .`
Expected: 通过（或在提交前执行 `npx prettier --write` 修正）。

- [ ] **Step 3: 最终提交（如有格式修正）**

```bash
git add -A
git commit -m "style: 端到端验证后的格式修正"
```
（若无需修正则跳过本步骤）
