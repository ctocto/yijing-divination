# 罗盘易卦抽爻 + 择日（P4）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 P1 罗盘「易卦」「择日」两模式的占位判断区变真断语——易卦交互抽爻换象（点一爻→变卦→爻辞/变卦卦辞），择日读盘直断（节气+甲子→建除十二神+黄道黑道+纳音+宜忌）。

**Architecture:** 纯逻辑与 UI 分离。新增两个数据文件 + 两个纯函数工具（node 可校验），FengShuiView 扩展两个判断区。易卦复用现有 `hexagrams.js`（binary 自下而上：`binary[0]`=初爻、`binary[5]`=上爻；`lines[0]`=初爻爻辞、`lines[5]`=上爻爻辞）。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、纯 JS + 兄弟 `.d.ts`、Vite 别名 `@/`、Vitest 无（用 `scripts/verify-fengshui.mjs` 断言）。

## Global Constraints

- 数据/工具用相对导入（`../data/…`、`./…`），组件用 `@/` 别名（node 校验需要相对导入）。
- 每个 JS 模块必须配兄弟 `.d.ts`（JS 实现 + 类型声明）。
- 逻辑验证：`scripts/verify-fengshui.mjs` 追加断言；`node scripts/verify-fengshui.mjs` 通过。
- 格式：`npx prettier --write <涉及文件>` 后 `--check`（eslint 仓库级坏，用 prettier）。
- 构建：`pnpm build` 通过。
- 易卦 binary 约定：六位二进制串自下而上（`'1'`=阳、`'0'`=阴），`binary[0]`=初爻、`binary[5]`=上爻。
- 爻辞素材：`hexagrams.js` 每条含 `text`（卦辞）、`plain`（白话）、`lines[6]`（爻辞，带「初九：」爻名前缀）。
- 择日口径：建除十二神与黄道黑道**同序差**（建=青龙、除=明堂、满=天刑…闭=勾陈），一次算序差两套呈现。
- 月建：`termMonth` 24 节气全表（中气与所属节同支）。

---

### Task 1: 择日数据层 `zeriData.js`

**Files:**
- Create: `src/data/zeriData.js`
- Create: `src/data/zeriData.d.ts`
- Test: `scripts/verify-fengshui.mjs`（追加断言）

**Interfaces:**
- Produces: `jianChu`（12 条 `{ name, level, text }`）、`huangDao`（12 条 `{ name, dao, level }`）、`termMonth`（24 条 `{节气: 支}`）。

- [ ] **Step 1: 创建 `src/data/zeriData.js`**

```js
// 择日判断数据（文化参考）——建除十二神 + 黄道黑道 + 节气→月建
// 建除十二神与黄道黑道同序差一一对应（建=青龙、除=明堂、满=天刑…闭=勾陈）
export const jianChu = [
  { name: '建', level: '平', text: '宜出行、上任、祭祀，忌动土、开仓。' },
  { name: '除', level: '吉', text: '宜除旧布新、沐浴、求医，忌嫁娶、安葬。' },
  { name: '满', level: '平', text: '宜祭祀、祈福、开市，忌栽种、动土。' },
  { name: '平', level: '平', text: '宜修造、平治、出行，忌开市、嫁娶。' },
  { name: '定', level: '吉', text: '宜定盟、嫁娶、安床，忌诉讼、出行。' },
  { name: '执', level: '平', text: '宜捕捉、执行、收账，忌开市、出行。' },
  { name: '破', level: '凶', text: '诸事不宜，宜破屋、坏垣。' },
  { name: '危', level: '凶', text: '宜安葬、祭祀，忌登高、行船。' },
  { name: '成', level: '吉', text: '宜开市、嫁娶、入宅、纳财，忌诉讼。' },
  { name: '收', level: '平', text: '宜收纳、进财、入仓，忌出行、嫁娶。' },
  { name: '开', level: '吉', text: '宜开市、出行、祈福、求财，忌安葬。' },
  { name: '闭', level: '凶', text: '宜筑堤、安葬，忌开市、出行。' },
];

// 黄道黑道 12 神煞（与建除同序差）
export const huangDao = [
  { name: '青龙', dao: '黄', level: '吉' },
  { name: '明堂', dao: '黄', level: '吉' },
  { name: '天刑', dao: '黑', level: '凶' },
  { name: '朱雀', dao: '黑', level: '凶' },
  { name: '金匮', dao: '黄', level: '吉' },
  { name: '天德', dao: '黄', level: '吉' },
  { name: '白虎', dao: '黑', level: '凶' },
  { name: '玉堂', dao: '黄', level: '吉' },
  { name: '天牢', dao: '黑', level: '凶' },
  { name: '玄武', dao: '黑', level: '凶' },
  { name: '司命', dao: '黄', level: '吉' },
  { name: '勾陈', dao: '黑', level: '凶' },
];

// 节气 → 月建支（24 节气全表，中气与所属节同支）
export const termMonth = {
  立春: '寅', 雨水: '寅', 惊蛰: '卯', 春分: '卯',
  清明: '辰', 谷雨: '辰', 立夏: '巳', 小满: '巳',
  芒种: '午', 夏至: '午', 小暑: '未', 大暑: '未',
  立秋: '申', 处暑: '申', 白露: '酉', 秋分: '酉',
  寒露: '戌', 霜降: '戌', 立冬: '亥', 小雪: '亥',
  大雪: '子', 冬至: '子', 小寒: '丑', 大寒: '丑',
};
```

- [ ] **Step 2: 创建 `src/data/zeriData.d.ts`**

```ts
export interface JianChu {
  name: string;
  level: '吉' | '平' | '凶';
  text: string;
}
export const jianChu: JianChu[];
export interface HuangDao {
  name: string;
  dao: '黄' | '黑';
  level: '吉' | '凶';
}
export const huangDao: HuangDao[];
export const termMonth: Record<string, string>;
```

- [ ] **Step 3: `scripts/verify-fengshui.mjs` 追加 import 与断言**

在文件顶部 import 区加：

```js
import {
  jianChu,
  huangDao,
  termMonth,
} from '../src/data/zeriData.js';
```

在文件末尾（`if (failed)` 之前）追加：

```js
// —— 择日数据 ——
check(jianChu.length === 12, '建除十二神应 12 条');
check(huangDao.length === 12, '黄道黑道应 12 条');
check(
  jianChu.map((j) => j.name).join('') === '建除满平定执破危成收开闭',
  '建除十二神顺序应 建除满平定执破危成收开闭'
);
// 黄道黑道与建除同序差：黄道 6 条
check(
  huangDao.filter((h) => h.dao === '黄').length === 6,
  '黄道应恰好 6 条'
);
check(huangDao[0].name === '青龙' && huangDao[0].dao === '黄', '序差0应为青龙黄道');
check(huangDao[2].name === '天刑' && huangDao[2].dao === '黑', '序差2应为天刑黑道');
check(Object.keys(termMonth).length === 24, '节气月建表应 24 节气');
check(termMonth['立春'] === '寅' && termMonth['雨水'] === '寅', '立春雨水应同属寅月');
check(termMonth['冬至'] === '子' && termMonth['小寒'] === '丑', '冬至子月小寒丑月');
```

- [ ] **Step 4: 运行 verify 确认通过**

Run: `node scripts/verify-fengshui.mjs`
Expected: 末尾 console.log 输出，exit 0。

- [ ] **Step 5: 提交**

```bash
git add src/data/zeriData.js src/data/zeriData.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 择日数据 —— 建除十二神 + 黄道黑道 + 节气月建表"
```

---

### Task 2: 易卦抽爻算法 `yijing.js`

**Files:**
- Create: `src/utils/yijing.js`
- Create: `src/utils/yijing.d.ts`
- Test: `scripts/verify-fengshui.mjs`（追加断言）

**Interfaces:**
- Consumes: `hexagrams` from `../data/hexagrams.js`（`{ binary, name, text, plain, lines[6] }`）。
- Produces: `drawLine(binary, index) → string`、`lineName(binary, index) → string`、`judgeChouYao(binary, index) → ChouYaoResult`。

- [ ] **Step 1: 创建 `src/utils/yijing.js`**

```js
// 易卦抽爻换象纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { hexagrams } from '../data/hexagrams.js';

// 爻名位序：index 0=初、1=二、2=三、3=四、4=五、5=上
const POSITIONS = ['初', '二', '三', '四', '五', '上'];

// 抽动爻：index 0=初爻 … 5=上爻，该位 0↔1 翻转
export function drawLine(binary, index) {
  const arr = binary.split('');
  arr[index] = arr[index] === '1' ? '0' : '1';
  return arr.join('');
}

// 爻名：位序 + 阴阳 → 初九/六二/…/上六
export function lineName(binary, index) {
  const yinYang = binary[index] === '1' ? '九' : '六';
  return POSITIONS[index] + yinYang;
}

// 找卦：binary → hexagram 对象
export function hexagramByBinary(binary) {
  return hexagrams.find((h) => h.binary === binary);
}

// 抽爻断语：本卦卦辞/白话 + 动爻爻辞 + 变卦卦辞/白话
// lines[index] 已含「九二：」爻名前缀，直接复用
export function judgeChouYao(binary, index) {
  const ben = hexagramByBinary(binary);
  const bian = hexagramByBinary(drawLine(binary, index));
  return {
    ben: ben.name,
    benPlain: ben.plain,
    line: ben.lines[index],
    bian: bian.name,
    bianText: bian.text,
    bianPlain: bian.plain,
  };
}
```

- [ ] **Step 2: 创建 `src/utils/yijing.d.ts`**

```ts
export function drawLine(binary: string, index: number): string;
export function lineName(binary: string, index: number): string;
export function hexagramByBinary(binary: string): {
  binary: string;
  name: string;
  text: string;
  plain: string;
  lines: string[];
} | undefined;
export interface ChouYaoResult {
  ben: string;
  benPlain: string;
  line: string;
  bian: string;
  bianText: string;
  bianPlain: string;
}
export function judgeChouYao(binary: string, index: number): ChouYaoResult;
```

- [ ] **Step 3: `scripts/verify-fengshui.mjs` 追加 import 与断言**

import 区加：

```js
import {
  drawLine,
  lineName,
  hexagramByBinary,
  judgeChouYao,
} from '../src/utils/yijing.js';
```

末尾追加：

```js
// —— 易卦抽爻算法 ——
check(drawLine('111111', 0) === '011111', '乾抽初爻应得天风姤 011111');
check(drawLine('111111', 5) === '111110', '乾抽上爻应得泽天夬 111110');
check(drawLine('000000', 0) === '100000', '坤抽初爻应得地雷复 100000');
check(drawLine('000000', 5) === '000001', '坤抽上爻应得山地剥 000001');
check(hexagramByBinary('011111').name === '姤', '011111 应查得天风姤');
check(lineName('111111', 0) === '初九', '乾初爻应名初九');
check(lineName('000000', 5) === '上六', '坤上爻应名上六');
const chou = judgeChouYao('111111', 1);
check(chou.ben === '乾' && chou.bian === '同人', '乾抽二爻变卦应为天火同人');
check(chou.line.startsWith('九二'), '乾二爻爻辞应以九二起');
check(chou.bianPlain.length > 0, '变卦应有白话解读');
```

- [ ] **Step 4: 运行 verify 确认通过**

Run: `node scripts/verify-fengshui.mjs`
Expected: exit 0。

- [ ] **Step 5: 提交**

```bash
git add src/utils/yijing.js src/utils/yijing.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 易卦抽爻算法 —— 爻翻转/爻名/本卦变卦断语"
```

---

### Task 3: 择日算法 `zeri.js`

**Files:**
- Create: `src/utils/zeri.js`
- Create: `src/utils/zeri.d.ts`
- Test: `scripts/verify-fengshui.mjs`（追加断言）

**Interfaces:**
- Consumes: `jiazi` from `../data/jiazi.js`（`{ name, nian, angle }`）；`termMonth`、`jianChu`、`huangDao` from `../data/zeriData.js`。
- Produces: `dayBranch(jiaziName) → string`、`monthBranch(term) → string`、`jianChuIndex(monthB, dayB) → number`、`judgeZeri(term, jiaziName) → ZeriResult`。

- [ ] **Step 1: 创建 `src/utils/zeri.js`**

```js
// 择日读盘直断纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
import { jiazi } from '../data/jiazi.js';
import { termMonth, jianChu, huangDao } from '../data/zeriData.js';

// 十二地支序（子0 丑1 寅2 … 亥11）
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 甲子名末字 = 日支（甲子→子、乙丑→丑…癸亥→亥）
export function dayBranch(jiaziName) {
  return jiaziName.slice(-1);
}

// 节气 → 月建支
export function monthBranch(term) {
  return termMonth[term] ?? '';
}

// 序差：月支起建，顺数到日支 → 建除索引（0=建、10=开）
export function jianChuIndex(monthB, dayB) {
  const m = BRANCHES.indexOf(monthB);
  const d = BRANCHES.indexOf(dayB);
  return (d - m + 12) % 12;
}

// 择日判断：建除十二神（含宜忌）+ 黄道黑道（含吉凶）+ 纳音
export function judgeZeri(term, jiaziName) {
  const mB = monthBranch(term);
  const dB = dayBranch(jiaziName);
  const idx = jianChuIndex(mB, dB);
  const jz = jiazi.find((j) => j.name === jiaziName);
  return {
    monthB: mB,
    dayB: dB,
    jianChu: jianChu[idx],
    huangDao: huangDao[idx],
    nian: jz ? jz.nian : '',
  };
}
```

- [ ] **Step 2: 创建 `src/utils/zeri.d.ts`**

```ts
export function dayBranch(jiaziName: string): string;
export function monthBranch(term: string): string;
export function jianChuIndex(monthB: string, dayB: string): number;
export interface ZeriResult {
  monthB: string;
  dayB: string;
  jianChu: { name: string; level: '吉' | '平' | '凶'; text: string };
  huangDao: { name: string; dao: '黄' | '黑'; level: '吉' | '凶' };
  nian: string;
}
export function judgeZeri(term: string, jiaziName: string): ZeriResult;
```

- [ ] **Step 3: `scripts/verify-fengshui.mjs` 追加 import 与断言**

import 区加：

```js
import {
  dayBranch,
  monthBranch,
  jianChuIndex,
  judgeZeri,
} from '../src/utils/zeri.js';
```

末尾追加：

```js
// —— 择日算法 ——
check(dayBranch('甲子') === '子', '甲子日支应子');
check(dayBranch('癸亥') === '亥', '癸亥日支应亥');
check(monthBranch('立春') === '寅', '立春月建应寅');
check(monthBranch('雨水') === '寅', '雨水月建应寅（中气同节）');
check(monthBranch('冬至') === '子', '冬至月建应子');
check(jianChuIndex('寅', '子') === 10, '寅月子日序差应 10（开日）');
check(jianChuIndex('午', '午') === 0, '午月午日序差应 0（建日）');
const zr = judgeZeri('立春', '甲子');
check(zr.monthB === '寅' && zr.dayB === '子', '立春甲子应为寅月子日');
check(zr.jianChu.name === '开', '寅月子日应为开日');
check(zr.huangDao.name === '司命', '开日对应司命（黄道）');
check(zr.huangDao.dao === '黄', '司命应为黄道');
check(zr.nian === '海中金', '甲子纳音应海中金');
```

- [ ] **Step 4: 运行 verify 确认通过**

Run: `node scripts/verify-fengshui.mjs`
Expected: exit 0。

- [ ] **Step 5: 提交**

```bash
git add src/utils/zeri.js src/utils/zeri.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 择日算法 —— 月建/日支/建除黄道序差/纳音判断"
```

---

### Task 4: `FengShuiView.vue` 易卦抽爻区 + 择日判断区

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `drawLine`、`judgeChouYao`、`hexagramByBinary` from `@/utils/yijing`；`judgeZeri` from `@/utils/zeri`。
- Reads: `readout`（已有）——易卦模式 `readout?.hexagram` 为卦名，择日模式 `readout?.term`/`readout?.jiazi`。

- [ ] **Step 1: 易卦模式判断区替换占位**

当前模板在 `<template v-else-if="luopanMode === 'na'">`（纳水区）之后有一个 `v-else` 占位 section。在纳水 section 之后、占位 section 之前插入易卦 section（占位 section 保留给 `ze`/`gua` 之外兜底，但本任务两个模式都有专属区，占位实际不再命中——不改动它）：

```html
      <template v-else-if="luopanMode === 'gua'">
        <section class="fs-yijing">
          <h2>抽爻换象</h2>
          <p class="yi-ben">
            本卦 <b>{{ benGuaName }}</b>
          </p>
          <div class="yi-lines" role="group" aria-label="六爻抽动">
            <button
              v-for="i in 6"
              :key="i - 1"
              type="button"
              class="yi-line"
              :class="{ active: movingYao === i - 1 }"
              :aria-pressed="movingYao === i - 1"
              @click="movingYao = i - 1"
            >
              {{ yaoLines[i - 1] }}
            </button>
          </div>
          <p class="yi-hint">点选一爻为动爻</p>
          <template v-if="chouYao">
            <p class="yi-line-text">
              动爻 <b>{{ chouYao.line }}</b>
            </p>
            <p class="yi-bian">
              变卦 <b>{{ chouYao.bian }}</b> —— {{ chouYao.bianText }}（{{ chouYao.bianPlain }}）
            </p>
          </template>
          <p v-else class="yi-none">选一爻看变卦</p>
          <p class="fs-disclaimer">六十四卦抽爻 · 文化参考</p>
        </section>
      </template>
```

- [ ] **Step 2: 择日模式判断区替换占位**

在易卦 section 之后、占位 section 之前插入择日 section：

```html
      <template v-else-if="luopanMode === 'ze'">
        <section class="fs-zeri">
          <h2>择日判断</h2>
          <p class="zeri-head">
            {{ readout?.term ?? '–' }} · {{ readout?.jiazi ?? '–' }}（{{ zeriInfo?.nian ?? '–' }}）
          </p>
          <p class="zeri-main">
            {{ zeriInfo?.monthB ?? '–' }}月 · {{ zeriInfo?.dayB ?? '–' }}日 · <b>{{ zeriInfo?.jianChu?.name ?? '–' }}</b>日（{{ zeriInfo?.huangDao?.name ?? '–' }} · {{ zeriInfo?.huangDao?.dao ?? '–' }}道）
          </p>
          <p class="zeri-text">{{ zeriInfo?.jianChu?.text ?? '' }}</p>
          <p class="fs-disclaimer">建除十二神 · 文化参考</p>
        </section>
      </template>
```

- [ ] **Step 3: script 区加 import 与计算属性**

在 `<script setup lang="ts">` 的 import 区（`import { judgeAllSha, … } from '@/utils/sha';` 之后）加：

```js
import { judgeChouYao, hexagramByBinary } from '@/utils/yijing';
import { judgeZeri } from '@/utils/zeri';
```

在 `outAngle` ref 与 `shuiInfo` computed 之后（`// —— 手机朝向对准` 注释之前）加：

在 `<script setup lang="ts">` 的 import 区（`import { judgeAllSha, … } from '@/utils/sha';` 之后）加：

```js
import { hexagrams } from '@/data/hexagrams';
import { judgeChouYao } from '@/utils/yijing';
import { judgeZeri } from '@/utils/zeri';
```

同时把第 291 行的 `import { ref, computed, onBeforeUnmount } from 'vue';` 改为：

```js
import { ref, computed, watch, onBeforeUnmount } from 'vue';
```

在 `outAngle` ref 与 `shuiInfo` computed 之后（`// —— 手机朝向对准` 注释之前）加：

```js
// —— 易卦抽爻 ——
const movingYao = ref(null); // 动爻位 0=初爻 … 5=上爻
const benGuaName = computed(() => readout.value?.hexagram ?? '–');
// 卦名 → 本卦 binary（卦名唯一）
const benBinary = computed(
  () =>
    hexagrams.find((h) => h.name === readout.value?.hexagram)?.binary ?? ''
);
// 六爻横条：显示位序 = binary 位序（i=0 初爻在左，i=5 上爻在右），点击索引即显示位序，无错位
const yaoLines = computed(() => {
  if (!benBinary.value) return ['—', '—', '—', '—', '—', '—'];
  return benBinary.value.split('').map((b) => (b === '1' ? '—' : '--'));
});
const chouYao = computed(() =>
  movingYao.value !== null && benBinary.value
    ? judgeChouYao(benBinary.value, movingYao.value)
    : null
);

// —— 择日 ——
const zeriInfo = computed(() =>
  readout.value?.term && readout.value?.jiazi
    ? judgeZeri(readout.value.term, readout.value.jiazi)
    : null
);

// 换坐向卦时清空动爻
watch(
  () => readout.value?.hexagram,
  () => {
    movingYao.value = null;
  }
);
```

注意：模板 `v-for="i in 6"` 中 `@click="movingYao = i - 1"`（i-1 即 binary 位序 0=初爻），`yaoLines[i-1]` 显示同一位置的爻——点击索引与显示位序一致，无错位。

- [ ] **Step 4: 样式**

在 `<style scoped>` 内、`.fs-pending` 相关规则之后追加：

```css
.fs-yijing,
.fs-zeri {
  border-top: 1px solid var(--gold);
  padding: 14px 2px;
}
.yi-ben {
  font-size: 15px;
  color: var(--deep-ink);
}
.yi-lines {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0 6px;
}
.yi-line {
  width: 44px;
  height: 40px;
  font-size: 20px;
  line-height: 1;
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  color: var(--deep-ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  cursor: pointer;
}
.yi-line.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.yi-hint {
  font-size: 12px;
  color: var(--ink-light);
}
.yi-line-text {
  margin-top: 10px;
  font-size: 14px;
}
.yi-bian {
  font-size: 14px;
  color: var(--deep-ink);
  margin-top: 6px;
}
.yi-none {
  color: var(--ink-light);
  font-size: 13px;
  margin-top: 8px;
}
.zeri-head {
  font-size: 14px;
  color: var(--ink-light);
}
.zeri-main {
  font-size: 15px;
  color: var(--deep-ink);
  margin-top: 6px;
}
.zeri-text {
  font-size: 14px;
  margin-top: 6px;
}
```

- [ ] **Step 5: 运行构建 + 格式检查**

Run: `pnpm build`
Expected: 构建成功。

Run: `npx prettier --write src/components/fengshui/FengShuiView.vue`
Expected: 无报错。

- [ ] **Step 6: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 易卦抽爻区（六爻可点抽动爻→变卦断语）+ 择日判断区（建除/黄道/纳音）"
```

---

### Task 5: 全量验证 + UI 走查

**Files:**
- Test: `scripts/verify-fengshui.mjs`、`pnpm build`、`npx prettier --check <涉及文件>`

**Interfaces:**
- 无新代码；回归 + 走查。

- [ ] **Step 1: 全量 verify**

Run: `node scripts/verify-fengshui.mjs`
Expected: 全部断言通过，exit 0。

- [ ] **Step 2: 全量 build + 格式**

Run: `pnpm build`
Expected: 成功。

Run: `npx prettier --check src/components/fengshui/FengShuiView.vue src/data/zeriData.js src/data/zeriData.d.ts src/utils/yijing.js src/utils/yijing.d.ts src/utils/zeri.js src/utils/zeri.d.ts`
Expected: 全部通过。

- [ ] **Step 3: UI 走查（浏览器）**

`pnpm dev` 打开风水罗盘：
1. 切「易卦」模式 → 十字线读卦名 → 六爻显示本卦爻 → 点任一爻 → 该爻高亮、动爻爻辞 + 变卦卦辞/白话出现 → 转盘换向 → 动爻清空、六爻随新卦刷新。
2. 切「择日」模式 → 十字线读节气+甲子 → 面板显示月建/日支/建除神/黄道神/纳音/宜忌 → 转盘实时更新。
3. 移动端（≤600px）两个新判断区不溢出、按钮可点。

- [ ] **Step 4: 无提交（验证任务）**

（如走查发现问题，记录到对应任务重新修复；干净则继续。）

---

## Self-Review

- **Spec coverage:** spec 三块（易卦抽爻算法/择日算法/UI 两区）各有 Task 2/3/4 对应；验证四项（verify 断言/build/prettier/UI 走查）在 Task 1-5 全覆盖；范围边界（神煞/六爻装卦/日历对接/干支纪年/分金）未做，符合 spec。✓
- **Placeholder scan:** 无 TBD/TODO；Task 4 Step 3 中 `benBinary` 给出了两个版本的实现说明并注明最终用 findHexByName 版本，无悬空。✓
- **Type consistency:** `judgeZeri` 返回 `{ monthB, dayB, jianChu, huangDao, nian }` 在 Task 3 定义、Task 4 Step 2 模板用 `zeriInfo?.monthB/jianChu/huangDao/nian` 一致；`judgeChouYao` 返回 `{ ben, benPlain, line, bian, bianText, bianPlain }` 在 Task 2 定义、Task 4 Step 1 模板用 `chouYao.line/bian/bianText/bianPlain` 一致；`drawLine`/`lineName` 在 Task 2 定义并在 verify 引用一致。✓
