# 风水罗盘盘心水平气泡 + 盘面实时跟随 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让「手机朝向对准」运行时，罗盘内盘实时跟随手机朝向（heading）平滑转动，并在盘心（天池位置）显示圆气泡水平仪。

**Architecture:** 扩展 `useCompassSensor` 模块单例暴露 `beta`/`gamma`/`level`；`Luopan.vue` 读取同一单例，传感运行中 `rot` 平滑跟随 heading（否则回落吸附选中山），固定层绘制盘心气泡；`FengShuiView.vue` 显示水平状态文字。锁定逻辑不变。

**Tech Stack:** Vue 3 Composition API（`<script setup lang="ts">`）、SVG、DeviceOrientationEvent、pnpm + Vite。

## Global Constraints

- 项目**无测试框架**（无 Vitest/脚本），验证以 `pnpm build`（vite build，不跑类型检查）+ 真机手动测试为准；d.ts 变更只作用于编辑器提示
- 遵循项目混合模式：JS 实现 + 同名 `.d.ts` 声明（`useCompassSensor.d.ts`）
- UI 文案与注释用中文；配色走 `src/styles/theme.js`（cinnabar/gold/goldLight/inkLight）
- 依赖别名 `@` → `src`
- 不做需求以外的功能：不加兼向/分金、不加磁偏角修正、不新建测试框架
- 保持现有代码风格：fengshui 组件用分号结尾，参考 `Luopan.vue`/`FengShuiView.vue` 现有写法

---

### Task 1: `useCompassSensor` 暴露 beta/gamma/level

**Files:**
- Modify: `src/composables/useCompassSensor.js`
- Modify: `src/composables/useCompassSensor.d.ts`

**Interfaces:**
- Produces:
  - 模块导出 `LEVEL_TOLERANCE: number`（= 8）
  - `useCompassSensor()` 返回新增 `beta: Ref<number | null>`、`gamma: Ref<number | null>`、`level: Ref<boolean>`
- Task 2/3/4 依赖这些符号。

- [ ] **Step 1: 修改 `useCompassSensor.js` 实现**

把 import 行改为：

```js
import { ref, computed } from 'vue';
```

在 `let buf = [];` 之后新增水平检测状态：

```js
// 水平检测：平放时 beta≈90、gamma≈0；两轴都在容差内视为水平
export const LEVEL_TOLERANCE = 8;
const beta = ref(null); // 前后倾（°）
const gamma = ref(null); // 左右倾（°）
const level = computed(
  () =>
    beta.value !== null &&
    gamma.value !== null &&
    Math.abs(beta.value - 90) <= LEVEL_TOLERANCE &&
    Math.abs(gamma.value) <= LEVEL_TOLERANCE
);
```

把 `onOrientation` 改为（在 heading 判空之前先读倾斜数据，避免无 heading 时气泡也不动）：

```js
function onOrientation(e) {
  if (typeof e.beta === 'number') beta.value = e.beta;
  if (typeof e.gamma === 'number') gamma.value = e.gamma;
  const h = headingFrom(e);
  if (h === null) return;
  heading.value = smooth(h);
}
```

在 `stopCompass()` 里 `heading.value = null;` 之后加两行清空：

```js
  beta.value = null;
  gamma.value = null;
```

把 `useCompassSensor()` 的返回对象补上：

```js
export function useCompassSensor() {
  return { supported, state, heading, beta, gamma, level, startCompass, stopCompass };
}
```

- [ ] **Step 2: 修改 `useCompassSensor.d.ts`**

```ts
export type CompassSensorState = 'idle' | 'running' | 'denied';

export const LEVEL_TOLERANCE: number;

export interface CompassSensorStore {
  supported: { value: boolean };
  state: { value: CompassSensorState };
  heading: { value: number | null };
  beta: { value: number | null };
  gamma: { value: number | null };
  level: { value: boolean };
  startCompass: () => Promise<void>;
  stopCompass: () => void;
}

export function useCompassSensor(): CompassSensorStore;
```

- [ ] **Step 3: 构建验证**

Run: `pnpm build`
Expected: 构建成功，无语法/import 错误。

- [ ] **Step 4: 提交**

```bash
git add src/composables/useCompassSensor.js src/composables/useCompassSensor.d.ts
git commit -m "feat: useCompassSensor 暴露 beta/gamma/level 水平检测"
```

---

### Task 2: `Luopan.vue` 盘面实时跟随 + 运行中禁拖禁点

**Files:**
- Modify: `src/components/fengshui/Luopan.vue`

**Interfaces:**
- Consumes: `useCompassSensor()` 返回的 `state`（重命名为 `sensorState`）、`heading`；`LEVEL_TOLERANCE`
- Produces: 传感运行中盘面 `rot` 跟随 heading（Task 3 的气泡画在同一组件固定层，复用 `sensorState`/`beta`/`gamma`/`level`）

- [ ] **Step 1: 引入传感单例**

在 `import { theme } from '@/styles/theme';` 之后加一行：

```js
import { useCompassSensor, LEVEL_TOLERANCE } from '@/composables/useCompassSensor';
```

在 `const rot = ref(0);` 之后加：

```js
const { state: sensorState, heading, beta, gamma, level } = useCompassSensor();
```

- [ ] **Step 2: 用单一 watch 接管旋转来源**

把现有 `watch(() => props.mountain, ...)`（当前在文件 150-156 行，含 `{ immediate: true }`）整体替换为：

```js
// 旋转来源：传感运行中跟随手机朝向（平滑），否则吸附到选中山
watch(
  [() => sensorState.value, () => heading.value, () => props.mountain],
  () => {
    if (dragging.value) return;
    if (sensorState.value === 'running' && heading.value !== null) {
      rot.value = -heading.value;
    } else {
      rot.value = -angleOf(props.mountain);
    }
  },
  { immediate: true }
);
```

- [ ] **Step 3: 运行中禁拖禁点**

`onDown` 第一行加守卫：

```js
function onDown(e) {
  if (sensorState.value === 'running') return;
  dragging.value = true;
```

`select` 第一行加守卫：

```js
function select(name) {
  if (sensorState.value === 'running') return;
  rot.value = -angleOf(name);
```

- [ ] **Step 4: 构建验证**

Run: `pnpm build`
Expected: 构建成功。

- [ ] **Step 5: 提交**

```bash
git add src/components/fengshui/Luopan.vue
git commit -m "feat: 罗盘运行传感时盘面实时跟随手机朝向，禁拖禁点"
```

---

### Task 3: `Luopan.vue` 盘心圆气泡水平仪

**Files:**
- Modify: `src/components/fengshui/Luopan.vue`

**Interfaces:**
- Consumes: `sensorState`/`beta`/`gamma`/`level`（Task 2 已解构）、`LEVEL_TOLERANCE`（Task 1 导出）
- Produces: 固定层渲染盘心气泡；偏移量 `bubbleDx`/`bubbleDy` 为组件内 computed

- [ ] **Step 1: 加气泡偏移 computed**

在 `const pos = (a, r) => ({...})` 之后加：

```js
// 气泡偏移：倾斜度/容差 归一化后按像素钳制（符号待真机验证，必要时 dx 取反）
const BUBBLE_MAX = 14;
const clamp01 = (v) => Math.max(-1, Math.min(1, v));
const bubbleDx = computed(() =>
  gamma.value === null ? 0 : clamp01(gamma.value / LEVEL_TOLERANCE) * BUBBLE_MAX
);
const bubbleDy = computed(() =>
  beta.value === null ? 0 : clamp01((beta.value - 90) / LEVEL_TOLERANCE) * BUBBLE_MAX
);
```

- [ ] **Step 2: 在固定层画气泡**

在旋转组 `</g>`（24 山+八卦那组）闭合之后、固定红针 `<path>` 之前插入：

```html
<!-- 盘心水平气泡（仅传感运行中；固定层，倾斜相对手机屏幕） -->
<g
  v-if="sensorState === 'running' && beta !== null && gamma !== null"
  aria-hidden="true"
>
  <circle :cx="C" :cy="C" r="26" fill="#fffdf6" :stroke="theme.goldLight" stroke-width="1" />
  <circle :cx="C" :cy="C" r="21" fill="none" :stroke="theme.goldLight" stroke-width="0.6" stroke-dasharray="1 4" />
  <circle :cx="C + bubbleDx" :cy="C + bubbleDy" r="4.5" :fill="level ? theme.cinnabar : theme.inkLight" />
</g>
```

- [ ] **Step 3: 构建验证**

Run: `pnpm build`
Expected: 构建成功。

- [ ] **Step 4: 提交**

```bash
git add src/components/fengshui/Luopan.vue
git commit -m "feat: 罗盘盘心圆气泡水平仪（随倾斜偏移，放平变色）"
```

---

### Task 4: `FengShuiView.vue` 水平状态文字

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `useCompassSensor()` 返回的 `level`（解构重命名为 `isLevel`）

- [ ] **Step 1: 解构 level**

把现有解构（当前 178-184 行）补上：

```js
const {
  supported: compassSupported,
  state: compassState,
  heading: compassHeading,
  level: isLevel,
  startCompass,
  stopCompass,
} = useCompassSensor();
```

- [ ] **Step 2: 加状态文字**

在 `compass-live` span 之后加：

```html
<span class="level-hint" :class="{ ok: isLevel }">{{ isLevel ? '已水平' : '请放平' }}</span>
```

- [ ] **Step 3: 加样式**

在 `.compass-live` 样式之后加：

```css
.level-hint {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--ink-light);
}
.level-hint.ok {
  color: var(--cinnabar);
}
```

- [ ] **Step 4: 构建验证**

Run: `pnpm build`
Expected: 构建成功。

- [ ] **Step 5: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 手机朝向对准显示已水平/请放平提示"
```

---

### Task 5: 真机手动验证清单

**Files:** 无（人工验证）

**Interfaces:**
- Consumes: Task 1-4 全部产物

- [ ] **Step 1: iOS 真机（或 Android 触屏真机）验证**

Run: `pnpm dev`，手机访问，进入「风水罗盘 ▸」→ 点「🧭 手机朝向对准」：

1. 转手机 → 罗盘内盘**平滑跟随**，顶部红针实时指向手机朝向的山
2. 前后/左右倾斜手机 → 盘心**气泡对应偏移**，方向直观（若方向反了，将 `bubbleDx`/`bubbleDy` 符号取反）
3. 放平 → 气泡居中变**朱砂色**，「请放平」变「已水平」
4. 未水平时锁定**仍可点**（纯提示不拦截）
5. 锁定 → 盘面吸附到整 15° 山，坐/向与飞星盘正确更新
6. 「取消」→ 盘面回到传感前的选中山
7. 传感运行中拖动盘面/点山 → 无响应

- [ ] **Step 2: 桌面回归**

Run: `pnpm build`
Expected: 构建成功；桌面端（无传感器）「手机朝向对准」入口仍隐藏，手动转盘选山、锁定、飞星盘均不受影响。

---

## 自查

- **Spec 覆盖**：设计文档 4 项改动（composable、Luopan 跟随、气泡、FengShuiView 文字）各对应 Task 1-4；边界（null 读数、denied、取消回落、运行中禁拖）在 Task 5 验证清单覆盖
- **占位符**：无 TBD/TODO；所有代码块为实际内容
- **类型一致性**：`LEVEL_TOLERANCE`/`beta`/`gamma`/`level` 在 Task 1 定义、Task 2-4 使用，命名一致；`bubbleDx`/`bubbleDy`/`BUBBLE_MAX`/`clamp01` 均在 Task 3 内定义
