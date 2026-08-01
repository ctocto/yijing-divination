# 首页精致化重做 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留古典罗盘概念的前提下，将首页精致化重做——三段式布局（顶栏/罗盘/底部操作栏）、点按起卦自动旋转、出卦逐一亮起、侧边详情面板、全屏卦库、阅读态排版重做。

**Architecture:** 单页三状态扩展。`useCompass` 状态机新增 `casting`（自动旋转起卦）与 `browse`（卦库）两个状态，并提供 `castSpin()`/`openLibrary()`/`closeLibrary()`/`currentPalaceName`。UI 层新增 5 个组件（AppHeader/CastBar/HowToOverlay/HexagramDetailPanel/HexagramLibrary），Home.vue 改为三段式 flex 布局统一编排。数据层（hexagrams/palaces/trigrams）完全不动。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、vue-router、纯 CSS（无 UI 库）、`@/` 与 `@components/` 路径别名、Google Fonts（Ma Shan Zheng + Noto Serif SC）。

## Global Constraints

- 无测试框架（Vitest/Cypress 未配置，本计划不引入）。每个任务以 `pnpm build`（编译/类型检查）+ `npx eslint <涉及文件>` 作为自动验证，以 `pnpm dev` 手动检查作为功能验证。
- 界面文案一律中文；代码注释用中文。
- 遵循 `.roo/rules/*.md`：Vue 3 Composition API + `<script setup>`；组件单一职责；JS 实现 + 兄弟 `.d.ts` 类型声明；Prettier 格式（`npx prettier --check .` 通过）。
- 数据层文件（`src/data/*.js`）禁止改动。
- 工作区存在**未提交的历史改动**（5 个组件文件的移动端适配微调），必须先归档（Task 0），再在其上叠加本计划改动。
- 新组件统一放 `src/components/layout/`（页面框架类）与 `src/components/compass/`（罗盘/卦相关）。

---

### Task 0: 归档工作区既有未提交改动

**Files:**
- Commit: `src/components/compass/CompassCore.vue`, `src/components/compass/HexagramGlyph.vue`, `src/components/compass/HexagramRing.vue`, `src/components/compass/ScaleRing.vue`, `src/components/scroll/ResultScroll.vue`

**Interfaces:**
- Produces: 干净的工作区基线，后续任务在其上提交。

- [ ] **Step 1: 确认改动范围**

Run: `git status --short`
Expected: 5 个 M 文件 + 未跟踪 `.claude/`（不提交）与 `docs/`（本任务不涉及）。

- [ ] **Step 2: 归档提交**

```bash
git add src/components/compass/CompassCore.vue src/components/compass/HexagramGlyph.vue src/components/compass/HexagramRing.vue src/components/compass/ScaleRing.vue src/components/scroll/ResultScroll.vue
git commit -m "style: 移动端适配与盘面布局微调（工作区未提交改动归档）"
```

- [ ] **Step 3: 验证**

Run: `git status --short`
Expected: 仅剩未跟踪 `.claude/`（与本任务无关，保持不动）。

---

### Task 1: 主题 token 更新 + 全局纸纹质感

**Files:**
- Modify: `src/styles/theme.js`（全部色值）
- Modify: `src/style.css`（`:root` 变量 + 纸纹 overlay + 新增 `--deep-ink`）

**Interfaces:**
- Produces: `theme.deepInk`（`#1a1712`）、`theme.cinnabar`（`#b23a2e`）、`theme.gold`（`#a8873a`）；CSS 变量 `--deep-ink`、`--cinnabar`、`--gold` 同步。后续组件依赖这些新色值。

- [ ] **Step 1: 更新 `theme.js`**

将 `src/styles/theme.js` 整体替换为：

```js
// 设计规格调色板（与 style.css 中的 CSS 变量一一对应，供 SVG 属性使用）
export const theme = {
  paper: '#f5f0e8',
  deepInk: '#1a1712',
  ink: '#2c2416',
  inkLight: '#6b5e4a',
  cinnabar: '#b23a2e',
  gold: '#a8873a',
  goldLight: '#dcc99a',
  scroll: '#faf6ed',
}
```

同步更新 `src/styles/theme.d.ts` 中对应字段（保持 JS 实现 + `.d.ts` 模式）。

- [ ] **Step 2: 更新 `style.css` `:root` 并加纸纹**

将 `:root` 块中 `--cinnabar: #c0392b;`、`--gold: #b8943e;` 替换为 `#b23a2e`、`#a8873a`，并新增 `--deep-ink: #1a1712;`。在 `:root` 之后追加全局纸纹 overlay（柔和噪点，不引外部图）：

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
}
```

> 说明：`opacity` 与 `feTurbulence` 的 `opacity` 可在 dev 中微调，以「纸面颗粒感但不干扰正文阅读」为准。

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/styles/theme.js src/styles/theme.d.ts src/style.css`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 4: Commit**

```bash
git add src/styles/theme.js src/styles/theme.d.ts src/style.css
git commit -m "feat: 主题 token 更新（朱砂/金线加深）+ 全局纸纹质感"
```

---

### Task 2: `useCompass` 状态机扩展

**Files:**
- Modify: `src/composables/useCompass.js`
- Modify: `src/composables/useCompass.d.ts`

**Interfaces:**
- Produces:
  - `state.value: 'idle' | 'spinning' | 'casting' | 'reading' | 'browse'`
  - `currentPalaceName: { value: string }`（由 rotation 实时推导）
  - `castSpin(): void`（idle 下自动旋转 2~3 圈出卦）
  - `openLibrary(): void` / `closeLibrary(): void`
  - `setRotation(deg)` / `setState(s)` 改为函数声明（供内部复用）

- [ ] **Step 1: 重构 `useCompass.js`**

将 `setRotation`/`setState` 从返回对象内联改为函数声明，并新增三个状态相关方法。修改后的完整文件：

```js
import { ref, computed } from 'vue'
import { hexagrams } from '@/data/hexagrams'
import { palaces } from '@/data/palaces'

// 模块级单例状态 —— 所有调用 useCompass() 的组件共享同一组 ref
const state = ref('idle')          // 'idle' | 'spinning' | 'casting' | 'reading' | 'browse'
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

  function setRotation(deg) { rotation.value = deg }
  function setState(s) { state.value = s }

  // 指针固定正上方（12 点方向）。宫位 i 中心角 = -90 + i*45；
  // 旋转 r 后指针所指宫位满足 (-90 + i*45 + r) ≡ -90 (mod 360) → i*45 ≡ -r
  function palaceIndexAt(deg) {
    const norm = ((deg % 360) + 360) % 360
    return Math.round(((360 - norm) % 360) / 45) % 8
  }

  // 旋转中指针实时所指宫位名
  const currentPalaceName = computed(() => palaces[palaceIndexAt(rotation.value)].name)

  // 旋转完全停止后调用：按指针宫位随机取一卦，进入阅读态
  function completeSpin() {
    const palace = palaces[palaceIndexAt(rotation.value)]
    const name = palace.hexagrams[Math.floor(Math.random() * palace.hexagrams.length)]
    divinationResult.value = hexagrams.find(h => h.name === name) || null
    selectedHexagram.value = null
    state.value = 'reading'
  }

  // 点按起卦：罗盘自动旋转 2~3 圈（约 2.5s）后出卦
  function castSpin() {
    if (state.value !== 'idle') return
    state.value = 'casting'
    const start = rotation.value
    const total = 720 + Math.random() * 360   // 2~3 圈
    const duration = 2500                      // ms
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      setRotation(start + total * (1 - Math.pow(1 - p, 3))) // ease-out cubic
      if (p < 1) requestAnimationFrame(step)
      else completeSpin()
    }
    requestAnimationFrame(step)
  }

  // 闲观态下点击卦符 → 浏览模式
  function selectHexagram(hexagram) {
    if (state.value !== 'idle' && state.value !== 'browse') return
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

  // 卦库浏览态开关
  function openLibrary() { state.value = 'browse' }
  function closeLibrary() { state.value = 'idle' }

  return {
    state,
    rotation,
    selectedHexagram,
    divinationResult,
    selectedDirection,
    customDirection,
    direction,
    currentPalaceName,
    setRotation,
    setState,
    palaceIndexAt,
    completeSpin,
    castSpin,
    selectHexagram,
    clearSelection,
    resetToIdle,
    openLibrary,
    closeLibrary,
  }
}
```

> 注：`selectHexagram` 现在同时允许 `idle` 与 `browse` 状态点击（卦库网格内选卦）。

- [ ] **Step 2: 更新 `useCompass.d.ts`**

```ts
export type CompassState = 'idle' | 'spinning' | 'casting' | 'reading' | 'browse'

export interface CompassStore {
  state: { value: CompassState }
  rotation: { value: number }
  selectedHexagram: { value: object | null }
  divinationResult: { value: object | null }
  selectedDirection: { value: string }
  customDirection: { value: string }
  direction: { value: string }
  currentPalaceName: { value: string }
  setRotation: (deg: number) => void
  setState: (s: CompassState) => void
  palaceIndexAt: (deg: number) => number
  completeSpin: () => void
  castSpin: () => void
  selectHexagram: (h: object) => void
  clearSelection: () => void
  resetToIdle: () => void
  openLibrary: () => void
  closeLibrary: () => void
}

export function useCompass(): CompassStore
```

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/composables/useCompass.js src/composables/useCompass.d.ts`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 4: Commit**

```bash
git add src/composables/useCompass.js src/composables/useCompass.d.ts
git commit -m "feat: useCompass 状态机扩展 —— casting/browse 状态、castSpin 自动旋转、currentPalaceName"
```

---

### Task 3: `AppHeader` 顶栏 + `HowToOverlay` 弹层

**Files:**
- Create: `src/components/layout/AppHeader.vue`
- Create: `src/components/layout/HowToOverlay.vue`

**Interfaces:**
- AppHeader emits `open-help`（无参数）
- HowToOverlay emits `close`（无参数）；Home 负责显隐控制

- [ ] **Step 1: 创建 `AppHeader.vue`**

```vue
<template>
  <header class="app-header">
    <h1 class="brand">易经占卜</h1>
    <button class="help-btn" type="button" @click="$emit('open-help')">
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="10" cy="10" r="8" />
        <path d="M8 8.2a2 2 0 1 1 2.6 1.9c-.7.3-1.6 1-1.6 1.9V12" stroke-linecap="round" />
        <circle cx="10" cy="14.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      如何起卦
    </button>
  </header>
</template>

<script setup lang="ts">
defineEmits(['open-help'])
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  flex: none;
}
.brand {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 28px;
  margin: 0;
  color: var(--deep-ink);
  letter-spacing: 0.08em;
}
.help-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  color: var(--ink-light);
  background: none;
  border: 1px solid var(--gold);
  border-radius: 999px;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}
.help-btn:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.06);
}
</style>
```

- [ ] **Step 2: 创建 `HowToOverlay.vue`**

```vue
<template>
  <div class="howto-mask" @click.self="$emit('close')">
    <div class="howto-card" role="dialog" aria-modal="true" aria-label="如何起卦">
      <h2 class="howto-title">如何起卦</h2>
      <ol class="howto-list">
        <li><b>转动罗盘</b>——按住盘面拖动，松手后自动出卦。</li>
        <li><b>静心起卦</b>——点击下方朱砂按钮，罗盘自动旋转出卦。</li>
        <li><b>浏览卦象</b>——点击盘上卦符，或「浏览六十四卦」查看全部卦辞爻辞。</li>
      </ol>
      <button class="howto-close" type="button" @click="$emit('close')">知道了</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>

<style scoped>
.howto-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 23, 18, 0.45);
  padding: 24px;
}
.howto-card {
  width: 100%;
  max-width: 420px;
  background: var(--scroll);
  border-radius: 8px;
  border: 1px solid var(--gold);
  box-shadow: 0 16px 48px rgba(26, 23, 18, 0.35);
  padding: 32px 36px 28px;
  animation: howto-in 0.25s ease-out;
}
.howto-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--cinnabar);
  text-align: center;
  margin: 0 0 20px;
}
.howto-list {
  margin: 0 0 24px;
  padding-left: 20px;
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink);
}
.howto-list li + li { margin-top: 8px; }
.howto-close {
  display: block;
  margin: 0 auto;
  padding: 9px 32px;
  font-size: 15px;
  letter-spacing: 0.2em;
  color: var(--scroll);
  background: var(--cinnabar);
  border: none;
  border-radius: 4px;
  transition: transform 0.15s, box-shadow 0.2s;
}
.howto-close:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 14px rgba(178, 58, 46, 0.4);
}
@keyframes howto-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
```

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/components/layout/AppHeader.vue src/components/layout/HowToOverlay.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppHeader.vue src/components/layout/HowToOverlay.vue
git commit -m "feat: 顶栏 AppHeader + 如何起卦弹层 HowToOverlay"
```

---

### Task 4: `CastBar` 底部操作栏

**Files:**
- Create: `src/components/layout/CastBar.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `selectedDirection`, `customDirection`, `state`, `castSpin`, `openLibrary`
- Produces: 底部操作栏（方向选择 + 起卦按钮 + 卦库入口）

- [ ] **Step 1: 创建 `CastBar.vue`**

```vue
<template>
  <div class="cast-bar">
    <div class="direction-row">
      <label for="cast-direction">所问何事</label>
      <select id="cast-direction" v-model="selectedDirection">
        <option value="">无方向（开放问题）</option>
        <option>事业</option>
        <option>情感</option>
        <option>健康</option>
        <option>学业</option>
        <option>财富</option>
        <option>家庭</option>
        <option value="其他">其他</option>
      </select>
      <input
        v-if="selectedDirection === '其他'"
        v-model="customDirection"
        type="text"
        placeholder="请输入所问之事"
        class="direction-input"
      />
    </div>

    <button
      class="cast-btn"
      type="button"
      :disabled="state !== 'idle'"
      @click="castSpin"
    >静 心 起 卦</button>

    <button class="library-link" type="button" @click="openLibrary">浏览六十四卦 ▸</button>
  </div>
</template>

<script setup lang="ts">
import { useCompass } from '@/composables/useCompass'

const { selectedDirection, customDirection, state, castSpin, openLibrary } = useCompass()
</script>

<style scoped>
.cast-bar {
  position: relative;
  z-index: 20;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 24px 24px;
  background: linear-gradient(to top, var(--paper) 55%, rgba(245, 240, 232, 0));
}
.direction-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--ink-light);
  flex-wrap: wrap;
  justify-content: center;
}
.direction-row select,
.direction-input {
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--gold);
  border-radius: 4px;
  background: var(--scroll);
  color: var(--ink);
}
.direction-input { width: 180px; }
.cast-btn {
  min-width: 220px;
  min-height: 52px;
  padding: 12px 40px;
  font-size: 20px;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  letter-spacing: 0.25em;
  color: var(--scroll);
  background: var(--cinnabar);
  border: none;
  border-radius: 4px;
  box-shadow: 0 4px 14px rgba(178, 58, 46, 0.35);
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}
.cast-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(178, 58, 46, 0.45);
}
.cast-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.library-link {
  font-size: 14px;
  color: var(--ink-light);
  background: none;
  border: none;
  border-bottom: 1px dashed var(--gold);
  padding: 2px 2px;
  letter-spacing: 0.1em;
  transition: color 0.2s;
}
.library-link:hover { color: var(--cinnabar); }
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/layout/CastBar.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/CastBar.vue
git commit -m "feat: 底部操作栏 CastBar —— 方向选择/静心起卦/浏览六十四卦"
```

---

### Task 5: `CompassCore` 布局重构 + 实时宫位名

**Files:**
- Modify: `src/components/compass/CompassCore.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `state`, `rotation`, `currentPalaceName`, `clearSelection`, `resetToIdle`, `divinationResult`
- Produces: 闲观/旋转/自动旋转态下在 flex 容器内居中；阅读态 `position: fixed` 左上角缩略；指针下方宫位名 overlay

- [ ] **Step 1: 模板加宫位名 overlay**

在 `<div class="compass-core">` 内、`<svg>` 之前插入：

```html
<div v-if="state === 'spinning' || state === 'casting'" class="palace-name" aria-hidden="true">
  {{ currentPalaceName }}
</div>
```

- [ ] **Step 2: script 引入 `currentPalaceName`**

将 `const { state, rotation, clearSelection, resetToIdle, divinationResult } = useCompass()` 改为：

```js
const { state, rotation, clearSelection, resetToIdle, divinationResult, currentPalaceName } = useCompass()
```

- [ ] **Step 3: 样式重构（定位/尺寸/阅读态缩放）**

替换 `<style scoped>` 中 `.compass-core` 与三个状态定位块：

```css
.compass-core {
  position: relative;
  width: min(78vmin, 620px);
  transform-origin: top left;
  transition: top 0.6s ease-out, left 0.6s ease-out, transform 0.6s ease-out;
}
.palace-name {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 20px;
  letter-spacing: 0.2em;
  color: var(--cinnabar);
  white-space: nowrap;
}
.compass-svg {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}
.taiji-center { cursor: default; }
.compass-core.state-idle,
.compass-core.state-spinning,
.compass-core.state-casting {
  top: auto;
  left: auto;
  transform: none;
}
.compass-core.state-idle .compass-svg,
.compass-core.state-spinning .compass-svg,
.compass-core.state-casting .compass-svg {
  touch-action: none; /* 触摸拖盘时不触发页面滚动 */
}
.compass-core.state-reading {
  position: fixed;
  top: 16px;
  left: 16px;
  transform: scale(0.26);
  z-index: 10;
}
@media (max-width: 600px) {
  .compass-core.state-reading {
    display: none; /* 移动端卷轴独占全屏，复位走「再起一卦」按钮 */
  }
}
.pointer-flash {
  animation: pointer-flash 0.4s ease 2;
}
@keyframes pointer-flash {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
```

> 阅读态缩放由 0.2286（700px 基准）改为 0.26（620px 基准），目标缩略 ~161px。
> 注意：闲观态为 flex 居中（`position: relative`），阅读态切换 `position: fixed`，`top/left` 从 `auto` 到 `16px` 不可插值，滑动动画可能不连贯。若 dev 中观察到跳动：给 `.compass-core` 外层包一个同尺寸定位容器（闲观绝对居中、阅读 fixed 左上角），使内层只做 `scale` 动画。可接受的降级方案是仅保留缩放过渡、位置瞬移。

- [ ] **Step 4: 验证**

Run: `pnpm build && npx eslint src/components/compass/CompassCore.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下闲观态罗盘在 flex 容器内居中，上下不再贴边。

- [ ] **Step 5: Commit**

```bash
git add src/components/compass/CompassCore.vue
git commit -m "feat: CompassCore 布局重构 —— flex 居中/阅读态固定左上角/旋转中实时宫位名"
```

---

### Task 6: `CompassRing` 拖拽守卫 + 宫位高亮

**Files:**
- Modify: `src/components/compass/CompassRing.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `state`, `rotation`, `setRotation`, `setState`, `completeSpin`, `palaceIndexAt`
- Produces: `casting`/`browse` 态禁止拖拽；旋转中指针所向宫位名朱砂高亮

- [ ] **Step 1: 拖拽守卫扩展**

`onPointerDown` 的守卫条件由 `if (state.value === 'reading') return` 改为：

```js
if (state.value === 'reading' || state.value === 'casting' || state.value === 'browse') return
```

- [ ] **Step 2: 宫位名高亮**

在 `<script setup>` 中加入（`computed` 已在首行 import）：

```js
import { ref, computed, onBeforeUnmount } from 'vue'

// 旋转中实时高亮指针所向宫位（闲观/阅读态不启用）
const activeIdx = computed(() => {
  if (state.value === 'spinning' || state.value === 'casting') {
    return palaceIndexAt(rotation.value)
  }
  return -1
})
```

模板中宫位 `<text>` 加上动态 class：

```html
:text-anchor="'middle'"
:dominant-baseline="'middle'"
font-size="22"
:class="{ 'palace-active': activeIdx === i }"
```

在 `<style>` 追加：

```css
.palace-active {
  fill: var(--cinnabar);
  font-size: 26px;
}
```

> 注意：SVG `<text>` 的 `fill` 由模板 `:fill="theme.ink"` 静态绑定，CSS class 通过 `!important` 或选择器优先级覆盖。若无效，改为计算属性返回 `activeIdx === i ? theme.cinnabar : theme.ink` 绑定到 `:fill`（此时去掉 `.palace-active` 的 `fill` 声明，仅保留字号）。

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/components/compass/CompassRing.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下拖盘旋转时指针所向宫名变朱砂放大。

- [ ] **Step 4: Commit**

```bash
git add src/components/compass/CompassRing.vue
git commit -m "feat: CompassRing 拖拽守卫扩展 + 旋转中宫位实时高亮"
```

---

### Task 7: `HexagramRing` 移除浮动标签 + 出卦逐一亮起

**Files:**
- Modify: `src/components/compass/HexagramRing.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `state`, `selectedHexagram`, `divinationResult`, `selectHexagram`, `clearSelection`
- Produces: 选中态不再显示内嵌浮动标签（由 Task 8 详情面板替代）；出卦后该宫 8 卦逐一 `highlighted`

- [ ] **Step 1: 删除内嵌选中标签块**

从模板删除 `<g v-if="selectedHexagram" :transform="...">...</g>` 整块，以及脚本中不再使用的 `labelPos` computed。

- [ ] **Step 2: 出卦逐一亮起逻辑**

脚本改为（替换原有 `resultName` 相关）：

```js
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const { state, selectedHexagram, divinationResult, selectHexagram, clearSelection } = useCompass()

const R_OUTER = 328
const R_INNER = 285

// … positionOf / hexagramByName 保持不变 …

const selectedName = computed(() => selectedHexagram.value?.name || '')

// 出卦后该宫 8 卦逐一进入 highlighted（每 120ms 一盏，点亮后保持朱砂态）
const litNames = ref(new Set())
let revealTimers = []
watch(
  () => divinationResult.value,
  (result) => {
    litNames.value = new Set()
    revealTimers.forEach(clearTimeout)
    revealTimers = []
    if (!result) return
    const palace = palaces.find(p => p.hexagrams.includes(result.name))
    if (!palace) return
    palace.hexagrams.forEach((name, i) => {
      revealTimers.push(
        setTimeout(() => {
          litNames.value = new Set([...litNames.value, name])
        }, i * 120)
      )
    })
  }
)
onBeforeUnmount(() => revealTimers.forEach(clearTimeout))

function onGlyphClick(name) {
  if (state.value !== 'idle') return
  if (selectedName.value === name) clearSelection()
  else selectHexagram(hexagramByName(name))
}
```

模板中卦符的 `:highlighted` 由 `resultName === name` 改为 `litNames.has(name)`：

```html
:highlighted="litNames.has(name)"
```

同时移除脚本中的 `resultName` computed 定义。

- [ ] **Step 3: 验证**

Run: `pnpm build && npx eslint src/components/compass/HexagramRing.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下出卦后结果宫 8 卦逐一朱砂亮起。

- [ ] **Step 4: Commit**

```bash
git add src/components/compass/HexagramRing.vue
git commit -m "feat: HexagramRing 移除浮动标签、出卦后该宫卦符逐一朱砂点亮"
```

---

### Task 8: `HexagramDetailPanel` 侧边详情面板

**Files:**
- Create: `src/components/compass/HexagramDetailPanel.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `selectedHexagram`, `clearSelection`；`palaces` 数据
- Produces: 右侧滑出详情面板；点空白/关闭按钮清除选中

- [ ] **Step 1: 创建组件**

```vue
<template>
  <div class="panel-backdrop" @click.self="clearSelection">
    <aside class="detail-panel" role="dialog" aria-label="卦象详情">
      <button class="panel-close" type="button" aria-label="关闭" @click="clearSelection">×</button>
      <h2 class="panel-name">{{ hexagram?.name }}</h2>
      <p class="panel-palace">{{ palaceName }}</p>
      <h3 class="panel-section-title">卦辞</h3>
      <p class="panel-text">{{ hexagram?.text }}</p>
      <h3 class="panel-section-title">爻辞</h3>
      <ul class="panel-lines">
        <li v-for="(line, i) in hexagram?.lines || []" :key="i" class="panel-line">
          <span class="dot" />{{ line }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompass } from '@/composables/useCompass'
import { palaces } from '@/data/palaces'

const { selectedHexagram, clearSelection } = useCompass()

const hexagram = computed(() => selectedHexagram.value)
const palaceName = computed(() => {
  if (!hexagram.value) return ''
  const p = palaces.find(pal => pal.hexagrams.includes(hexagram.value.name))
  return p ? p.name : ''
})
</script>

<style scoped>
.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(26, 23, 18, 0.28);
}
.detail-panel {
  position: relative;
  width: min(400px, 92vw);
  height: 100%;
  background: var(--scroll);
  border-left: 8px solid #d4c5a0;
  box-shadow: -8px 0 32px rgba(26, 23, 18, 0.2);
  padding: 40px 36px;
  overflow-y: auto;
  animation: panel-in 0.28s ease-out;
}
.panel-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 40px;
  height: 40px;
  font-size: 24px;
  line-height: 1;
  color: var(--ink-light);
  background: none;
  border: none;
  border-radius: 50%;
  transition: color 0.2s, background-color 0.2s;
}
.panel-close:hover {
  color: var(--cinnabar);
  background: rgba(178, 58, 46, 0.08);
}
.panel-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 40px;
  color: var(--cinnabar);
  margin: 0 0 4px;
}
.panel-palace {
  font-size: 13px;
  color: var(--ink-light);
  margin: 0 0 20px;
  letter-spacing: 0.1em;
}
.panel-section-title {
  font-size: 15px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  margin: 0 0 10px;
  letter-spacing: 0.12em;
}
.panel-text {
  font-size: 16px;
  line-height: 1.9;
  color: var(--ink);
  margin: 0 0 24px;
}
.panel-lines {
  list-style: none;
  margin: 0;
  padding: 0;
}
.panel-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
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
@keyframes panel-in {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@media (max-width: 600px) {
  .detail-panel { padding: 28px 22px; }
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/compass/HexagramDetailPanel.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 3: Commit**

```bash
git add src/components/compass/HexagramDetailPanel.vue
git commit -m "feat: 侧边详情面板 HexagramDetailPanel"
```

---

### Task 9: `HexagramLibrary` 全屏卦库

**Files:**
- Create: `src/components/compass/HexagramLibrary.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `selectedHexagram`, `selectHexagram`, `clearSelection`, `closeLibrary`；`palaces`/`hexagrams` 数据
- Produces: 全屏 64 卦网格，点击卦格触发详情（复用 `selectedHexagram`）

- [ ] **Step 1: 创建组件**

```vue
<template>
  <div class="library" role="dialog" aria-label="六十四卦">
    <header class="library-header">
      <h1 class="library-title">六十四卦</h1>
      <button class="library-back" type="button" @click="closeLibrary">← 返回</button>
    </header>
    <div class="library-body">
      <section v-for="palace in palaces" :key="palace.name" class="palace-group">
        <h2 class="palace-label">{{ palace.name }}</h2>
        <div class="palace-grid">
          <button
            v-for="name in palace.hexagrams"
            :key="name"
            type="button"
            class="hex-cell"
            :class="{ selected: selectedHexagram?.name === name }"
            @click="onCellClick(name)"
          >
            <span class="cell-name">{{ name }}</span>
            <svg class="cell-glyph" viewBox="0 0 34 26" width="34" height="26" aria-hidden="true">
              <g v-for="(line, i) in linesOf(name)" :key="i" :transform="`translate(0, ${i * 4.4})`">
                <rect v-if="line === '1'" x="0" y="0" width="16" height="2.4" rx="1.2" class="cell-line" />
                <g v-else>
                  <rect x="0" y="0" width="6.5" height="2.4" rx="1.2" class="cell-line" />
                  <rect x="9.5" y="0" width="6.5" height="2.4" rx="1.2" class="cell-line" />
                </g>
              </g>
            </svg>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCompass } from '@/composables/useCompass'
import { palaces } from '@/data/palaces'
import { hexagrams } from '@/data/hexagrams'

const { selectedHexagram, selectHexagram, clearSelection, closeLibrary } = useCompass()

function hexagramByName(name) {
  return hexagrams.find(h => h.name === name)
}
function linesOf(name) {
  return hexagramByName(name)?.binary.split('').reverse() || []
}
function onCellClick(name) {
  const h = hexagramByName(name)
  if (!h) return
  if (selectedHexagram.value?.name === name) clearSelection()
  else selectHexagram(h)
}
</script>

<style scoped>
.library {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: var(--paper);
  display: flex;
  flex-direction: column;
}
.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--gold);
  flex: none;
}
.library-title {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 26px;
  color: var(--deep-ink);
  margin: 0;
}
.library-back {
  padding: 8px 16px;
  font-size: 15px;
  color: var(--ink-light);
  background: none;
  border: 1px solid var(--gold);
  border-radius: 4px;
  transition: color 0.2s, border-color 0.2s;
}
.library-back:hover {
  color: var(--cinnabar);
  border-color: var(--cinnabar);
}
.library-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 48px;
}
.palace-group { margin-bottom: 28px; }
.palace-label {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 20px;
  color: var(--cinnabar);
  margin: 0 0 12px;
  letter-spacing: 0.12em;
}
.palace-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}
.hex-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  min-height: 72px;
  background: var(--scroll);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  transition: border-color 0.2s, background-color 0.2s, transform 0.15s;
}
.hex-cell:hover {
  border-color: var(--gold);
  background: #fffdf6;
  transform: translateY(-2px);
}
.hex-cell.selected {
  border-color: var(--cinnabar);
  background: #f6e3df;
}
.cell-name {
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
}
.cell-line { fill: var(--ink); }
.hex-cell.selected .cell-name,
.hex-cell.selected .cell-line { fill: var(--cinnabar); }

@media (max-width: 900px) {
  .palace-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 600px) {
  .palace-grid { grid-template-columns: repeat(3, 1fr); }
  .library-body { padding: 16px 16px 40px; }
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/components/compass/HexagramLibrary.vue`
Expected: 构建成功，无 lint 报错。

- [ ] **Step 3: Commit**

```bash
git add src/components/compass/HexagramLibrary.vue
git commit -m "feat: 全屏卦库 HexagramLibrary —— 八宫分组 64 卦网格"
```

---

### Task 10: `Home.vue` 三段式布局重写

**Files:**
- Modify: `src/views/Home.vue`

**Interfaces:**
- Consumes: 全部新组件 + `useCompass()`
- Produces: 三段式首页编排（Header / 罗盘主区 / CastBar），按状态渲染详情面板、卦库、结果卷轴

- [ ] **Step 1: 重写 `Home.vue`**

```vue
<template>
  <div class="home-page" :class="`state-${state}`">
    <AppHeader @open-help="showHelp = true" />
    <main class="compass-stage">
      <CompassCore />
    </main>
    <CastBar v-if="state !== 'reading' && state !== 'browse'" />

    <HowToOverlay v-if="showHelp" @close="showHelp = false" />
    <HexagramDetailPanel v-if="selectedHexagram" />
    <HexagramLibrary v-if="state === 'browse'" />
    <ResultScroll v-if="state === 'reading'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import CastBar from '../components/layout/CastBar.vue'
import HowToOverlay from '../components/layout/HowToOverlay.vue'
import CompassCore from '../components/compass/CompassCore.vue'
import HexagramDetailPanel from '../components/compass/HexagramDetailPanel.vue'
import HexagramLibrary from '../components/compass/HexagramLibrary.vue'
import ResultScroll from '../components/scroll/ResultScroll.vue'
import { useCompass } from '../composables/useCompass'

const { state, selectedHexagram } = useCompass()
const showHelp = ref(false)
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--paper);
  position: relative;
  overflow: hidden;
}
.compass-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 阅读态：CastBar 隐藏、罗盘 fixed 左上角，页面恢复块布局承载卷轴 */
.home-page.state-reading {
  display: block;
}
</style>
```

- [ ] **Step 2: 验证**

Run: `pnpm build && npx eslint src/views/Home.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下闲观态呈现 顶栏/罗盘/底部操作栏 三段式。

- [ ] **Step 3: Commit**

```bash
git add src/views/Home.vue
git commit -m "feat: Home 三段式布局重写 —— 编排 Header/罗盘/CastBar/详情面板/卦库/卷轴"
```

---

### Task 11: `ScrollContent` 移除方向选择 + 排版重做

**Files:**
- Modify: `src/components/scroll/ScrollContent.vue`

**Interfaces:**
- Consumes: `useCompass()` 的 `divinationResult`, `direction`, `resetToIdle`（不再消费 `selectedDirection`/`customDirection`）
- Produces: 结果卷轴排版升级（卦名 44px、卦辞 17px、留白加大）

- [ ] **Step 1: 删除方向选择块**

从模板删除整个 `.direction-row` 块（含 `<select>` 与条件 `<input>`）。

- [ ] **Step 2: 精简 script**

`const { divinationResult, selectedDirection, customDirection, direction, resetToIdle } = useCompass()` 改为：

```js
const { divinationResult, direction, resetToIdle } = useCompass()
```

`colloquialText` 逻辑保持不变（仍引用 `direction`）。

- [ ] **Step 3: 排版升级**

替换关键样式值：

```css
.hexagram-name {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 44px;
  color: var(--cinnabar);
  margin: 12px 0 10px;
}
.hexagram-text {
  font-size: 17px;
  line-height: 2;
  color: var(--ink);
  margin: 0 0 28px;
}
```

其余（爻辞/白话解读/再起一卦）保持现有样式，仅将 `.restart-btn` 背景改为 `var(--cinnabar)`（若仍为旧 `#c0392b` 则沿用变量，无需改）。

- [ ] **Step 4: 验证**

Run: `pnpm build && npx eslint src/components/scroll/ScrollContent.vue`
Expected: 构建成功，无 lint 报错。`pnpm dev` 下出卦后结果页无方向下拉，排版按新字号渲染。

- [ ] **Step 5: Commit**

```bash
git add src/components/scroll/ScrollContent.vue
git commit -m "feat: ScrollContent 移除方向选择、排版升级（卦名 44px/卦辞 17px）"
```

---

### Task 12: 全量验证与收尾

**Files:**
- Verify: 全部改动文件

- [ ] **Step 1: 构建与静态检查**

Run: `pnpm build && npx eslint . && npx prettier --check .`
Expected: 全部通过。

- [ ] **Step 2: 手动验收（`pnpm dev`）**

逐项核对设计规格「验证方式」：

1. 闲观态三段式可见，罗盘不遮挡顶栏/底部操作栏
2. 点「静心起卦」→ 罗盘自动旋转约 2.5s → 停 → 宫位金线/朱砂高亮 → 结果宫 8 卦逐一亮起 → 罗盘缩小 + 卷轴展开
3. 拖拽转盘：跟手、惯性、吸附、出卦；旋转中指针下方显示所向宫位名
4. 阅读态：无方向下拉；卷轴排版正确可滚动；「再起一卦」回闲观态
5. 闲观态点卦符 → 右侧详情面板滑出，点空白关闭
6. 点「浏览六十四卦」→ 全屏网格 → 点卦格 → 详情面板 → 返回
7. 「如何起卦」弹层打开/关闭正常
8. 移动端（DevTools ≤600px）：三段式无横向滚动，CastBar 可用，阅读态罗盘隐藏
9. 出卦后若点击空白处不残留选中态

- [ ] **Step 3: 收尾提交**

若 Step 2 发现需微调的样式/文案，就地修改并单独提交（`style: 收尾微调 …`）。确认 `git status` 仅剩未跟踪 `.claude/`（属于既存环境目录，不提交）。
