# 罗盘分金·立向精度（P2）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 定向模式叠加 120 分金：一圈只标 48 旺相的分金盘 + 3° 拖拽吸附 + 坐/向分金吉凶断语。

**Architecture:** 数据/算法为纯 JS + 兄弟 `.d.ts`（node 可校验），组件用 `@/` alias。分金 120 槽由规则生成（分金地支「前一位地支」表 + 干序 + 天干吉凶），工具层 `fenjinAt`/`judgeFenjin` 读盘直断。定向模式拖拽吸附 15°→3°，传感锁定经 `fine-angle` prop 保持分金朝向，离开定向归位山中心。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、Vite、pnpm、无测试框架（逻辑断言在 `scripts/verify-fengshui.mjs`，组件靠 build + prettier + 浏览器走查）。

## Global Constraints

以下约束对所有任务生效（逐字摘自 spec）：

- 分金地支表（24 山 → 「前一位地支山」）：`子→子 癸→子 丑→丑 艮→丑 寅→寅 甲→寅 卯→卯 乙→卯 辰→辰 巽→辰 巳→巳 丙→巳 午→午 丁→午 未→未 坤→未 申→申 庚→申 酉→酉 辛→酉 戌→戌 乾→戌 亥→亥 壬→亥`
- 干序：阳支（子寅辰午申戌）`甲 丙 戊 庚 壬`；阴支（丑卯巳未酉亥）`乙 丁 己 辛 癸`。
- 槽位：每山 5 槽 × 3°，槽中心 = 山中心 −6° + 3i（i=0..4），铺满整山 ±7.5°；角度取模 360。
- 天干吉凶：丙丁庚辛→旺相（吉）、甲壬→孤（凶）、乙癸→虚（凶）、戊己→龟甲（凶）；骑缝（距 15° 交界线 <0.5°）→空亡（凶）。
- 断语五条逐字：旺相`旺相分金，可立向。`；孤`阳孤分金，孤阳不生，不宜立向。`；虚`阴虚分金，独阴不长，不宜立向。`；龟甲`龟甲空亡，坐向正中一线，不宜立向。`；空亡`骑缝空亡，两山交界之线，不宜立向。`
- 定向模式拖拽吸附 **3°**，其余模式仍 15°；点按选山仍吸附山中心（= 龟甲）。
- 盘面：定向模式加 `fenjin` 圈 `{ type:'labels', radius:212, labelSize:10 }`，只标 48 旺相，当前十字线落在旺相槽则高亮。
- 现有玄空链路（山名级）**不动**，分金为并列判断；离开定向模式 `fineAngle=null` 归位山中心。
- 代码模式：JS 实现 + 兄弟 `.d.ts`；`src/data/*` 与 `src/utils/*` 用**相对 import**（node-verify 可直跑），组件用 `@/` alias；中文注释与文案。
- 验证：`node scripts/verify-fengshui.mjs`（现有断言 + 新增分金断言全绿）、`npx prettier --write <涉及文件>` 后 `--check`、`pnpm build`、浏览器 UI 走查。无测试框架，不新建测试文件。

---

### Task 1: 分金数据层（120 分金规则生成）

**Files:**
- Create: `src/data/fenjin.js`
- Create: `src/data/fenjin.d.ts`
- Modify: `scripts/verify-fengshui.mjs`（顶部 import + 末尾断言段）

**Interfaces:**
- Consumes: `mountains`（`src/data/luopan.js`，24 条 `{ name, palace, angle }`）；`jiazi`（`src/data/jiazi.js`，60 条 `{ name, nian, angle }`，按名查纳音）。
- Produces（Task 2 依赖）:
  - `FENJIN_ZHI: Record<string, string>` — 24 山 → 分金地支
  - `GAN_SEQ: { 阳: string[]; 阴: string[] }`
  - `fenjin120: FenJin[]` — 120 条 `{ mountain, index, angle, name, gan, zhi, level, nian }`
  - `wangXiang48: FenJin[]` — `level === '旺相'` 的 48 条
  - `FenJin` interface（.d.ts）

- [ ] **Step 1: 创建 `src/data/fenjin.js`**

```js
// 120 分金：每山 5 槽 × 3°，二十四山共 120 槽合 360°
// 分金地支 = 前一位地支山（二十四山序中紧邻其逆时针方向的地支山；地支山本身用自己）
// 吉凶按纳甲口诀：甲壬阳孤乙癸虚，龟甲空亡戊己推，丙丁庚辛虽旺相
import { mountains } from './luopan.js';
import { jiazi } from './jiazi.js';

export const FENJIN_ZHI = {
  子: '子', 癸: '子',
  丑: '丑', 艮: '丑',
  寅: '寅', 甲: '寅',
  卯: '卯', 乙: '卯',
  辰: '辰', 巽: '辰',
  巳: '巳', 丙: '巳',
  午: '午', 丁: '午',
  未: '未', 坤: '未',
  申: '申', 庚: '申',
  酉: '酉', 辛: '酉',
  戌: '戌', 乾: '戌',
  亥: '亥', 壬: '亥',
};

// 干序：阳支隔位排 甲丙戊庚壬，阴支隔位排 乙丁己辛癸
export const GAN_SEQ = {
  阳: ['甲', '丙', '戊', '庚', '壬'],
  阴: ['乙', '丁', '己', '辛', '癸'],
};

const LEVEL_BY_GAN = {
  甲: '孤', 壬: '孤',
  乙: '虚', 癸: '虚',
  戊: '龟甲', 己: '龟甲',
  丙: '旺相', 丁: '旺相', 庚: '旺相', 辛: '旺相',
};

const YANG_ZHI = new Set(['子', '寅', '辰', '午', '申', '戌']);

// 分金纳音：名 → 六十甲子纳音
const nianOf = (name) => jiazi.find((j) => j.name === name)?.nian ?? '';
const seqOf = (zhi) => GAN_SEQ[YANG_ZHI.has(zhi) ? '阳' : '阴'];

export const fenjin120 = mountains.flatMap((m) => {
  const zhi = FENJIN_ZHI[m.name];
  return seqOf(zhi).map((gan, i) => {
    const name = gan + zhi;
    return {
      mountain: m.name,
      index: i, // 0-4：第 1 槽=index0 … 第 5 槽=index4
      angle: (m.angle - 6 + i * 3 + 360) % 360, // 槽中心
      name,
      gan,
      zhi,
      level: LEVEL_BY_GAN[gan],
      nian: nianOf(name),
    };
  });
});

// 盘面只标 48 旺相（真罗盘即如此，孤虚/龟甲留空）
export const wangXiang48 = fenjin120.filter((f) => f.level === '旺相');
```

- [ ] **Step 2: 创建 `src/data/fenjin.d.ts`**

```ts
export interface FenJin {
  mountain: string;
  index: number; // 0-4 槽位
  angle: number;
  name: string;
  gan: string;
  zhi: string;
  level: '旺相' | '孤' | '虚' | '龟甲';
  nian: string;
}
export const FENJIN_ZHI: Record<string, string>;
export const GAN_SEQ: { 阳: string[]; 阴: string[] };
export const fenjin120: FenJin[];
export const wangXiang48: FenJin[];
```

- [ ] **Step 3: 在 `scripts/verify-fengshui.mjs` 顶部 import 块追加**

在现有 import 之后（`import { dayBranch, monthBranch, jianChuIndex, judgeZeri } from '../src/utils/zeri.js';` 之后）追加：

```js
import {
  fenjin120,
  wangXiang48,
  FENJIN_ZHI,
  GAN_SEQ,
} from '../src/data/fenjin.js';
```

- [ ] **Step 4: 在 `scripts/verify-fengshui.mjs` 末尾（`if (failed) process.exit(1);` 之前）追加分金数据断言**

```js
// —— 120 分金数据 ——
check(fenjin120.length === 120, `120 分金应 120 条，实为 ${fenjin120.length}`);
check(wangXiang48.length === 48, `旺相分金应 48 个，实为 ${wangXiang48.length}`);
check(Object.keys(FENJIN_ZHI).length === 24, '分金地支表应覆盖 24 山');
check(
  GAN_SEQ['阳'].join('') === '甲丙戊庚壬' && GAN_SEQ['阴'].join('') === '乙丁己辛癸',
  '干序应为 阳甲丙戊庚壬/阴乙丁己辛癸'
);
// 每山恰 5 槽
const fjByMountain = {};
for (const f of fenjin120) (fjByMountain[f.mountain] ||= []).push(f);
check(
  Object.keys(fjByMountain).length === 24,
  `分金应覆盖 24 山，实为 ${Object.keys(fjByMountain).length}`
);
for (const [m, arr] of Object.entries(fjByMountain)) {
  check(arr.length === 5, `${m}山应有 5 分金，实为 ${arr.length}`);
}
// 角度无缝铺满 360°：120 个中心每 3° 一个
const fjAngles = fenjin120.map((f) => f.angle).sort((a, b) => a - b);
check(
  fjAngles.every((a, i) => a === i * 3),
  '分金槽中心应每 3° 连续铺满 0-357'
);
// level 分布：旺相48 / 孤24 / 虚24 / 龟甲24
const fjDist = {};
for (const f of fenjin120) fjDist[f.level] = (fjDist[f.level] || 0) + 1;
check(fjDist['旺相'] === 48, `旺相应 48，实为 ${fjDist['旺相']}`);
check(fjDist['孤'] === 24, `孤应 24，实为 ${fjDist['孤']}`);
check(fjDist['虚'] === 24, `虚应 24，实为 ${fjDist['虚']}`);
check(fjDist['龟甲'] === 24, `龟甲应 24，实为 ${fjDist['龟甲']}`);
// 天干不变量
const LEVEL_BY_GAN = {
  甲: '孤', 壬: '孤',
  乙: '虚', 癸: '虚',
  戊: '龟甲', 己: '龟甲',
  丙: '旺相', 丁: '旺相', 庚: '旺相', 辛: '旺相',
};
check(
  fenjin120.every((f) => LEVEL_BY_GAN[f.gan] === f.level),
  '分金吉凶应按天干口诀（甲壬孤/乙癸虚/戊己龟甲/丙丁庚辛旺相）'
);
// 子山五槽已知值
const ziByName = Object.fromEntries(fjByMountain['子'].map((f) => [f.name, f]));
check(
  ziByName['甲子']?.angle === 354 &&
    ziByName['甲子']?.level === '孤' &&
    ziByName['甲子']?.nian === '海中金',
  '子山甲子应 354° 孤·海中金'
);
check(
  ziByName['丙子']?.angle === 357 &&
    ziByName['丙子']?.level === '旺相' &&
    ziByName['丙子']?.nian === '涧下水',
  '子山丙子应 357° 旺相·涧下水'
);
check(
  ziByName['戊子']?.angle === 0 &&
    ziByName['戊子']?.level === '龟甲' &&
    ziByName['戊子']?.nian === '霹雳火',
  '子山戊子应 0° 龟甲·霹雳火'
);
check(
  ziByName['庚子']?.angle === 3 &&
    ziByName['庚子']?.level === '旺相' &&
    ziByName['庚子']?.nian === '壁上土',
  '子山庚子应 3° 旺相·壁上土'
);
check(
  ziByName['壬子']?.angle === 6 &&
    ziByName['壬子']?.level === '孤' &&
    ziByName['壬子']?.nian === '桑柘木',
  '子山壬子应 6° 孤·桑柘木'
);
// 巽山循辰山（前一位地支规则抽查：巽山旺相=丙辰/庚辰）
const xunByName = Object.fromEntries(fjByMountain['巽'].map((f) => [f.name, f]));
check(
  xunByName['丙辰']?.level === '旺相' && xunByName['庚辰']?.level === '旺相',
  '巽山应循辰山（丙辰庚辰为旺相）'
);
// 槽名均存在于六十甲子（纳音查表不落空）
check(
  fenjin120.every((f) => jiazi.some((j) => j.name === f.name)),
  '每个分金名都应存在于六十甲子'
);
```

- [ ] **Step 5: 运行校验确认通过**

Run: `node scripts/verify-fengshui.mjs`
Expected: 全部断言 PASS，结尾输出「✓ …校验通过」（含新增分金断言），退出码 0。若失败，检查 `fenjin.js` 的 angle/level/nian 生成逻辑与已知值表。

- [ ] **Step 6: Prettier + 提交**

```bash
npx prettier --write src/data/fenjin.js src/data/fenjin.d.ts scripts/verify-fengshui.mjs
git add src/data/fenjin.js src/data/fenjin.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 120 分金数据（规则生成）+ 校验断言"
```

---

### Task 2: 分金工具层（读盘直断）

**Files:**
- Create: `src/utils/fenjin.js`
- Create: `src/utils/fenjin.d.ts`
- Modify: `scripts/verify-fengshui.mjs`（import + 断言段）

**Interfaces:**
- Consumes: `mountains`（`src/data/luopan.js`）；`fenjin120`（Task 1，`src/data/fenjin.js`）；`mountainAt`（`src/utils/fengShui.js`，角度→最近山名，纯函数）。
- Produces（Task 3/4 依赖）:
  - `fenjinAt(deg): FenjinAtResult` — 槽对象 或 `{ type:'kongwang', a, b }`（a/b 为两侧山名）
  - `judgeFenjin(deg): FenjinResult` — `{ shan, xiang }`，各 `FenjinSide { mountain, name, gan, zhi, level, nian, ji, text }`（空亡折叠为 `name:'骑缝', level:'空亡'`）
  - `.d.ts` 导出 `FenjinAtResult / FenjinSide / FenjinResult`

- [ ] **Step 1: 创建 `src/utils/fenjin.js`**

```js
// 分金判断：读盘直断坐/向分金吉凶（纯函数，node 可校验）
// 吉凶按纳甲口诀；骑缝空亡 = 距 15° 交界线（角度 ≡ 7.5 mod 15）循环距离 <0.5°
import { fenjin120 } from '../data/fenjin.js';
import { mountainAt } from './fengShui.js';

function normalize(a) {
  return ((a % 360) + 360) % 360;
}

// 到最近 15° 交界线的循环距离
function boundaryDist(deg) {
  const d = normalize(deg);
  const rem = (d - 7.5 + 360) % 15;
  return Math.min(rem, 15 - rem);
}

// 最近分金槽（槽宽 3° 均匀铺满，中心距最小即所在槽）
function nearest(deg) {
  const d = normalize(deg);
  let best = fenjin120[0];
  let bestDiff = Infinity;
  for (const f of fenjin120) {
    let diff = Math.abs(normalize(f.angle) - d);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = f;
    }
  }
  return best;
}

// 十字线处所在分金：槽对象，或骑缝空亡 { type:'kongwang', a, b }
export function fenjinAt(deg) {
  if (boundaryDist(deg) < 0.5) {
    return {
      type: 'kongwang',
      a: mountainAt(deg - 0.5),
      b: mountainAt(deg + 0.5),
    };
  }
  return nearest(deg);
}

const LEVEL_META = {
  旺相: { ji: '吉', text: '旺相分金，可立向。' },
  孤: { ji: '凶', text: '阳孤分金，孤阳不生，不宜立向。' },
  虚: { ji: '凶', text: '阴虚分金，独阴不长，不宜立向。' },
  龟甲: { ji: '凶', text: '龟甲空亡，坐向正中一线，不宜立向。' },
  空亡: { ji: '凶', text: '骑缝空亡，两山交界之线，不宜立向。' },
};

function side(deg) {
  const r = fenjinAt(deg);
  if (r.type === 'kongwang') {
    return {
      mountain: `${r.a}/${r.b}`,
      name: '骑缝',
      gan: '',
      zhi: '',
      level: '空亡',
      nian: '',
      ...LEVEL_META['空亡'],
    };
  }
  return { ...r, ...LEVEL_META[r.level] };
}

// 坐 + 向分金断语（向 = 坐 + 180°）
export function judgeFenjin(deg) {
  return { shan: side(deg), xiang: side(deg + 180) };
}
```

- [ ] **Step 2: 创建 `src/utils/fenjin.d.ts`**

```ts
import { FenJin } from '../data/fenjin';
export type FenjinAtResult =
  | FenJin
  | { type: 'kongwang'; a: string; b: string };
export function fenjinAt(deg: number): FenjinAtResult;
export interface FenjinSide {
  mountain: string;
  name: string;
  gan: string;
  zhi: string;
  level: '旺相' | '孤' | '虚' | '龟甲' | '空亡';
  nian: string;
  ji: '吉' | '凶';
  text: string;
}
export interface FenjinResult {
  shan: FenjinSide;
  xiang: FenjinSide;
}
export function judgeFenjin(deg: number): FenjinResult;
```

- [ ] **Step 3: 在 `scripts/verify-fengshui.mjs` 顶部 import 追加**

```js
import { fenjinAt, judgeFenjin } from '../src/utils/fenjin.js';
```

- [ ] **Step 4: 在分金数据断言段之后（`if (failed) process.exit(1);` 之前）追加分金算法断言**

```js
// —— 分金算法 ——
check(fenjinAt(357).name === '丙子', '357° 分金应为丙子');
check(fenjinAt(0).name === '戊子', '0° 分金应为戊子（正中龟甲）');
const fjKw = fenjinAt(7.5);
check(fjKw.type === 'kongwang', '7.5° 应为骑缝空亡');
check(
  fjKw.a === '子' && fjKw.b === '癸',
  '7.5° 骑缝应邻 子(减侧)/癸(加侧) 两山'
);
const fj0 = judgeFenjin(0);
check(fj0.shan.name === '戊子' && fj0.shan.level === '龟甲', '坐 0° 分金应戊子龟甲');
check(fj0.xiang.name === '戊午' && fj0.xiang.level === '龟甲', '向 180° 分金应戊午龟甲');
check(fj0.shan.ji === '凶' && fj0.shan.text.includes('不宜立向'), '龟甲应断凶');
// 坐向对称：任取角度，坐/向分金吉凶一致（同天干同判）
for (const a of [0, 3, 45, 100, 200, 357]) {
  const r = judgeFenjin(a);
  check(r.shan.level === r.xiang.level, `${a}° 坐向分金吉凶应对称`);
}
```

- [ ] **Step 5: 运行校验确认通过**

Run: `node scripts/verify-fengshui.mjs`
Expected: 全部 PASS（含新增分金算法断言），退出码 0。

- [ ] **Step 6: Prettier + 提交**

```bash
npx prettier --write src/utils/fenjin.js src/utils/fenjin.d.ts scripts/verify-fengshui.mjs
git add src/utils/fenjin.js src/utils/fenjin.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 分金读盘直断（fenjinAt/judgeFenjin）+ 校验断言"
```

---

### Task 3: 盘面呈现（48 旺相圈 + 3° 吸附 + fine-angle）

**Files:**
- Modify: `src/data/luopanRings.js`
- Modify: `src/components/fengshui/Luopan.vue`

**Interfaces:**
- Consumes: `wangXiang48`（Task 1）、`fenjinAt`（Task 2）；Luopan 现有 `props.mode`、`rot`、`readAngle`、`ringItems`、`onUp`、位置 watch。
- Produces: Luopan 新增 `fineAngle` prop（Number|null）；`modeRings.ding` 含 `'fenjin'`。FengShuiView（Task 4）传入 `:fine-angle`。

- [ ] **Step 1: `src/data/luopanRings.js` — 注册 fenjin 圈并加入定向模式**

在 `RING_TYPES` 中、`degrees` 之前插入：

```js
  fenjin: { type: 'labels', radius: 212, labelSize: 10 }, // 120 分金·只标 48 旺相
```

将 `modeRings.ding` 改为：

```js
  ding: ['trigram', 'terms', 'earth', 'fenjin', 'degrees'],
```

（其他模式圈集不动。）

- [ ] **Step 2: `Luopan.vue` — import fenjin 数据/工具**

在现有 import 块中追加：

```js
import { wangXiang48 } from '@/data/fenjin';
import { fenjinAt } from '@/utils/fenjin';
```

- [ ] **Step 3: `Luopan.vue` — 新增 `fineAngle` prop**

在 `defineProps` 中追加：

```js
  fineAngle: { type: Number, default: null },
```

- [ ] **Step 4: `Luopan.vue` — `ringItems` 加 `'fenjin'` case**

在 `ringItems` switch 中、`case 'degrees':` 之前插入：

```js
    case 'fenjin': {
      // 只标 48 旺相；当前十字线落在旺相槽则高亮
      const cur = fenjinAt(readAngle.value);
      const activeName = cur.type === 'kongwang' ? null : cur.name;
      return wangXiang48.map((f) => ({
        angle: f.angle,
        text: f.name,
        active: activeName === f.name,
      }));
    }
```

- [ ] **Step 5: `Luopan.vue` — 定向模式 3° 吸附**

将 `onUp` 的吸附改为按模式定步长：

```js
function onUp() {
  if (!dragging.value) return;
  dragging.value = false;
  const step = props.mode === 'ding' ? 3 : 15;
  const snapped = Math.round(rot.value / step) * step;
  rot.value = snapped;
  emit('select', mountainAt(-snapped));
}
```

- [ ] **Step 6: `Luopan.vue` — 位置 watch 优先 fineAngle**

将位置 watch 的依赖数组与分支改为：

```js
watch(
  [
    () => sensorState.value,
    () => heading.value,
    () => props.mountain,
    () => props.fineAngle,
  ],
  () => {
    if (dragging.value) return;
    if (sensorState.value === 'running' && heading.value !== null) {
      rot.value = -heading.value;
    } else if (props.fineAngle !== null) {
      rot.value = -props.fineAngle;
    } else {
      rot.value = -angleOf(props.mountain);
    }
  },
  { immediate: true }
);
```

- [ ] **Step 7: 校验 + Prettier + 提交**

Run: `node scripts/verify-fengshui.mjs`（圈配置断言应通过：`'fenjin' in RING_TYPES`）
Run: `npx prettier --write src/data/luopanRings.js src/components/fengshui/Luopan.vue`
Run: `pnpm build`（应构建成功）
```bash
git add src/data/luopanRings.js src/components/fengshui/Luopan.vue
git commit -m "feat: 定向模式 48 旺相分金圈 + 3° 吸附 + fine-angle 精度定位"
```

---

### Task 4: 读数面板 + 分金吉凶判断区

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `judgeFenjin`（Task 2）；Luopan 新 prop `fine-angle`（Task 3）；现有 `selectedDir`、`shan`、`xiang`、`readout`、`luopanMode`、`stopCompass`/`lockCompass`。
- Produces: 定向模式读数面板含坐/向分金名+吉凶；fs-fenjin 判断区；`fineAngle` 状态与 Luopan 联动。

- [ ] **Step 1: `FengShuiView.vue` — import judgeFenjin**

在现有 import 块（`import { judgeZeri } from '@/utils/zeri';` 之后）追加：

```js
import { judgeFenjin } from '@/utils/fenjin';
```

- [ ] **Step 2: `FengShuiView.vue` — 给 Luopan 传 `:fine-angle`**

在模板 Luopan 元素上追加 prop：

```html
        <Luopan
          :mountain="selectedDir"
          :mode="luopanMode"
          :fine-angle="luopanMode === 'ding' ? fineAngle : null"
          @select="selectedDir = $event"
          @readout="readout = $event"
        />
```

- [ ] **Step 3: `FengShuiView.vue` — 新增 fineAngle 状态 + 分金 computed**

在 `const readout = ref(null);` 之后、`const shan = computed(...)` 之前插入：

```js
// —— 分金（定向模式立向精度）——
// 十字线实时角度作为分金定位源；传感运行/拖拽/锁定都经 readout.angle 同步
const fineAngle = ref(null);
watch(
  () => readout.value?.angle,
  (a) => {
    if (luopanMode.value === 'ding' && a !== undefined) fineAngle.value = a;
  }
);
// 离开定向模式归位山中心，不污染其他模式
watch(
  () => luopanMode.value,
  (m) => {
    if (m !== 'ding') fineAngle.value = null;
  }
);
// 分金判断：坐 = 十字线角度，向 = +180°
const fenjin = computed(() =>
  readout.value?.angle !== undefined
    ? judgeFenjin(readout.value.angle)
    : null
);
```

- [ ] **Step 4: `FengShuiView.vue` — 定向读数面板含分金**

将读数面板 `ding` 分支改为：

```html
          <template v-if="luopanMode === 'ding'"
            >坐{{ shan }}·{{ fenjin?.shan.name ?? '骑缝' }}({{
              fenjin?.shan.level ?? '–'
            }}) 朝{{ xiang }}·{{ fenjin?.xiang.name ?? '骑缝' }}({{
              fenjin?.xiang.level ?? '–'
            }})</template
          >
```

- [ ] **Step 5: `FengShuiView.vue` — 新增「分金吉凶」判断区**

在定向模式 `<template v-if="luopanMode === 'ding'">` 内、`<section class="fs-pan">` 的 `</section>` 之后、`<section class="fs-reading">` 之前插入：

```html
        <section class="fs-fenjin">
          <h2>分金吉凶</h2>
          <p class="fj-hint">点按居中即正向·龟甲，拖拽微调至旺相分金</p>
          <template v-if="fenjin">
            <p class="fj-row">
              坐分金：<b>{{ fenjin.shan.name }}</b>（{{ fenjin.shan.nian || '—' }}）·
              <span
                class="fj-level"
                :class="fenjin.shan.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                >{{ fenjin.shan.level }}</span
              >
              · {{ fenjin.shan.ji }}
            </p>
            <p class="fj-text">{{ fenjin.shan.text }}</p>
            <p class="fj-row">
              向分金：<b>{{ fenjin.xiang.name }}</b>（{{ fenjin.xiang.nian || '—' }}）·
              <span
                class="fj-level"
                :class="fenjin.xiang.ji === '吉' ? 'fj-gold' : 'fj-bad'"
                >{{ fenjin.xiang.level }}</span
              >
              · {{ fenjin.xiang.ji }}
            </p>
            <p class="fj-text">{{ fenjin.xiang.text }}</p>
          </template>
          <p class="fs-disclaimer">一百二十分金 · 文化参考</p>
        </section>
```

- [ ] **Step 6: `FengShuiView.vue` — 传感取消时归位山中心**

将 `stopSensor` 改为（取消传感 = 放弃本次微调，回到已锁定坐向的山中心）：

```js
function stopSensor() {
  stopCompass();
  fineAngle.value = null; // 取消传感：归位已锁定山中心
}
```

`lockCompass` 保持现状（`fineAngle` 已由 readout watch 同步为传感最终角度，锁定后保持分金朝向）。

- [ ] **Step 7: `FengShuiView.vue` — 分金区样式**

在 `<style scoped>` 中、`.fs-disclaimer` 规则之前追加：

```css
.fs-fenjin {
  border-top: 1px solid var(--gold);
  padding: 14px 2px;
}
.fs-fenjin h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.fj-hint {
  font-size: 12px;
  color: var(--ink-light);
}
.fj-row {
  font-size: 14px;
  color: var(--deep-ink);
  margin-top: 8px;
}
.fj-row b {
  color: var(--cinnabar);
}
.fj-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  margin-top: 2px;
}
.fj-level {
  font-size: 12px;
  letter-spacing: 0.05em;
}
.fj-gold {
  color: var(--gold);
}
.fj-bad {
  color: var(--ink-light);
}
```

- [ ] **Step 8: Prettier + 构建 + 提交**

```bash
npx prettier --write src/components/fengshui/FengShuiView.vue
pnpm build
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 定向模式读数面板分金 + 分金吉凶判断区"
```

---

### Task 5: 全量验证 + UI 走查

**Files:**
- 无源码改动（验证与走查任务）

**Interfaces:**
- Consumes: Task 1-4 全部产物。

- [ ] **Step 1: verify + prettier + build 全量**

```bash
node scripts/verify-fengshui.mjs
npx prettier --check src/data/fenjin.js src/data/fenjin.d.ts src/utils/fenjin.js src/utils/fenjin.d.ts src/data/luopanRings.js src/components/fengshui/Luopan.vue src/components/fengshui/FengShuiView.vue scripts/verify-fengshui.mjs
pnpm build
```

Expected: verify 全绿、prettier --check 无报错、build 成功。

- [ ] **Step 2: 浏览器走查（chrome-devtools MCP，`pnpm dev` 起服）**

1. 打开首页 → 进入「风水·罗盘宅运」→ 定向模式。
2. **48 旺相圈**：确认地盘正针（r≈198）与度数圈（r≈220）之间多一圈细字分金标签，共 48 个、只含丙丁庚辛字头。
3. **3° 吸附**：拖拽转盘松手，确认 `readout.deg` 为 3 的倍数（15° 的倍数不再恒成立）。
4. **龟甲**：点按选「子」山（或拖到 0°），读数面板应显示 `坐子·戊子(龟甲) 朝午·戊午(龟甲)`，判断区「分金吉凶」两行均为 戊子/戊午 · 龟甲 · 凶 + 断语。
5. **旺相**：拖拽到 357°（或 3°），读数面板显示 `坐子·丙子(旺相)` / `坐子·庚子(旺相)`，对应分金标签高亮，判断区为 丙子（涧下水）/庚子（壁上土）· 旺相 · 吉。
6. **实时联动**：持续拖拽，读数面板与判断区随十字线实时更新（不必松手）。
7. **切换模式**：切到消砂/纳水/择日/易卦再切回定向，盘面归位山中心（fineAngle 已置空），分金读数回到龟甲。
8. **移动端 390px**：`resize_page` 至 390 宽，盘面与判断区无水平溢出。

（手机朝向传感分金锁定路径无法在桌面浏览器真实触发，走查标注「传感路径以代码审查 + 逻辑断言为准」，不阻塞。）

- [ ] **Step 3: 提交走查修复（如有）**

若有走查发现的问题，按问题归属任务修复并单独提交（格式 `fix: …`）。无问题则本任务无提交。

---

## 范围边界（本版不做）

1. 分金配**仙命纳音生克**（阴宅立穴按仙命断刺穴煞）——需生辰输入，不做。
2. 分金对玄空**兼向/替卦**的影响——玄空仍按山名（15°）算，分金为并列判断（用户已确认）。
3. 其他立向体系——七十二穿山虎、六十透地龙，不做。
4. 分金与易卦抽爻结合（P4 spec 已记）——留后续。
