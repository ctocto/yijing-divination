# 多圈罗盘读盘地基（P1）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有风水罗盘 Luopan 升级为多圈旋转内盘：模式驱动圈集（定向/消砂/纳水/择日/易卦）、天心十道十字线读盘、读数面板；「定向」模式接线现有玄空飞星，其余模式 P1 只读数不判断（判断区占位）。

**Architecture:** 数据层扩展 `luopan.js`（三盘三针/节气/度数）+ 新增 `mansions.js`（二十八宿）、`jiazi.js`（六十甲子）、`luopanRings.js`（圈配置+模式映射）、`utils/fuXiOrder.js`（先天卦序，从挂图抽共享）、`utils/luopanRead.js`（按角度读数）。UI 新增 `RingLayer.vue` 通用圈渲染器，`Luopan.vue` 重构为圈配置驱动（十字线/天池/读数 emit，交互保留），`FengShuiView.vue` 加模式开关 + 读数面板。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、纯 CSS、`@/` 路径别名、`pnpm`、node 校验脚本（无测试框架）。

## Global Constraints

- **无测试框架**（Vitest 未配置）。逻辑 TDD 用 node 脚本 `scripts/verify-fengshui.mjs` 承载断言；组件验证用 `pnpm build` + `npx prettier --check <涉及文件>`。
- **eslint 仓库级损坏（既存基建问题）**：本计划一律用 `npx prettier` 替代 `npx eslint`。
- **格式化**：仓库 `.prettierrc` 为 `semi: true`。写完 `npx prettier --write <涉及文件>`（仅格式），验证 `npx prettier --check <涉及文件>`，不要对全仓 `--check .`。
- 界面文案一律中文；代码注释用中文。
- JS 实现 + 兄弟 `.d.ts` 类型声明。
- **`luopan.js` 是既有数据文件**：本次为**追加导出**（三盘/节气/度数），既有 `mountains`/`yunPeriods` 及字段结构**一字不改**。
- **新数据/工具用相对导入**（`../data/…`）而非 `@/`，保证 node 脚本可直接 import 校验。组件可用 `@/`。
- 不新增任何依赖。
- 不改动 `fengShui.js`、`flyingStars.js`、`useCompassSensor.js` 等既有文件（本次需求不涉及）。

---

### Task 1: 抽共享先天卦序 `utils/fuXiOrder.js` + 挂图改用

**Files:**
- Create: `src/utils/fuXiOrder.js`
- Create: `src/utils/fuXiOrder.d.ts`
- Modify: `src/components/chart/HexagramSquareCircle.vue:72-122`（`fuXi`/`circleItems` 改用共享序）

**Interfaces:**
- Produces: `fuXiRing: { name: string; binary: string; angle: number }[]`——先天圆环 64 卦，角度为本应用约定（0°顶、顺时针增）：乾 0°，左半（夬→复，负角归一）到 坤 180°，右半（姤→剥）到 近顶。供卦环渲染与 `luopanRead.hexagramAt` 读数。
- Consumes: `hexagrams`（`../data/hexagrams.js`）。

- [ ] **Step 1: 创建 `src/utils/fuXiOrder.js`**

```js
// 先天六十四卦圆环（共享卦序，供挂图与罗盘卦环使用）
// 角度约定：0° 顶、顺时针增加；乾(顶0°) → 左半(负角) → 坤(底180°) → 右半(正角) → 近顶
import { hexagrams } from '../data/hexagrams.js';

// 先天六十四卦序：binary 数值升序（parseInt 视二进制串自下而上为从高位到低位）
const fuXi = [...hexagrams].sort(
  (a, b) => parseInt(a.binary, 2) - parseInt(b.binary, 2)
);

const STEP = 360 / 64; // 5.625°

export const fuXiRing = (() => {
  const items = [];
  const push = (h, deg) =>
    items.push({
      name: h.name,
      binary: h.binary,
      angle: ((deg % 360) + 360) % 360,
    });
  push(fuXi[63], 0); // 乾
  for (let k = 1; k <= 31; k++) push(fuXi[63 - k], -k * STEP); // 左半 夬..复
  push(fuXi[0], 180); // 坤
  for (let j = 1; j <= 31; j++) push(fuXi[32 - j], j * STEP); // 右半 姤..剥
  return items;
})();
```

- [ ] **Step 2: 创建 `src/utils/fuXiOrder.d.ts`**

```ts
export interface FuXiRingItem {
  name: string
  binary: string
  angle: number
}
export const fuXiRing: FuXiRingItem[]
```

- [ ] **Step 3: `HexagramSquareCircle.vue` 改用共享序（渲染行为不变）**

在 `<script setup>` 顶部 import 区（`import { theme } …` 之后）追加：

```js
import { fuXiRing } from '@/utils/fuXiOrder';
```

删除原 `fuXi` 定义与 `circleItems` 的排序/循环逻辑（现 `:72-89` 的 `byBinary` 保留、`fuXi` 删除、`circleItems` 重写）：

将原：

```js
// 先天六十四卦序：binary 数值升序（parseInt 视二进制串自下而上为从高位到低位）
const fuXi = [...hexagrams].sort((a, b) => parseInt(a.binary, 2) - parseInt(b.binary, 2))
```

删除整段（由顶部 import 取代；`byBinary` 函数保留，不要误删）。

将原 `circleItems` 整段（`// 圆环 64 卦：乾(顶0°) → …` 到数组结束）：

```js
const circleItems = (() => {
  const STEP = Math.PI / 32
  const items = []
  const push = (h, ang) =>
    items.push({
      name: h.name,
      binary: h.binary,
      x: C + R_CIRCLE * Math.sin(ang),
      y: C - R_CIRCLE * Math.cos(ang),
    })
  push(fuXi[63], 0)
  for (let k = 1; k <= 31; k++) push(fuXi[63 - k], -k * STEP)
  push(fuXi[0], Math.PI)
  for (let j = 1; j <= 31; j++) push(fuXi[32 - j], j * STEP)
  return items
})()
```

替换为：

```js
// 圆环 64 卦：从共享先天卦序取角度，换算 SVG 坐标（sin/cos 周期，行为与原实现一致）
const circleItems = fuXiRing.map((h) => ({
  name: h.name,
  binary: h.binary,
  x: C + R_CIRCLE * Math.sin((h.angle * Math.PI) / 180),
  y: C - R_CIRCLE * Math.cos((h.angle * Math.PI) / 180),
}));
```

> 模板、交互、样式均不动。若 `hexagrams` import 因不再直接使用而报 lint，确认后保留（`byBinary` 仍用）。

- [ ] **Step 4: 校验共享序**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { fuXiRing } from '../src/utils/fuXiOrder.js';
```

在 `if (failed) process.exit(1);` 之前追加：

```js
// —— 先天六十四卦圆环 ——
check(fuXiRing.length === 64, `先天卦环应为 64 卦，实为 ${fuXiRing.length}`);
check(new Set(fuXiRing.map((x) => x.name)).size === 64, '先天卦环卦名不应重复');
const g0 = fuXiRing.find((x) => x.angle === 0);
check(g0 && g0.name === '乾', '先天卦环 0° 应为乾');
const g180 = fuXiRing.find((x) => x.angle === 180);
check(g180 && g180.name === '坤', '先天卦环 180° 应为坤');
const angles = fuXiRing.map((x) => x.angle).sort((a, b) => a - b);
check(
  angles.every((a, i) => a === i * (360 / 64)),
  '先天卦环角度应每 5.625° 连续'
);
```

- [ ] **Step 5: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: 新增断言 PASS（含既有断言不回归）。

- [ ] **Step 6: 格式化 + 构建**

Run: `npx prettier --write src/utils/fuXiOrder.js src/utils/fuXiOrder.d.ts src/components/chart/HexagramSquareCircle.vue scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功，挂图圆环渲染位置与原实现一致（`pnpm dev` 肉眼核对：64 卦圆环位置无变化）。

- [ ] **Step 7: 提交**

```bash
git add src/utils/fuXiOrder.js src/utils/fuXiOrder.d.ts src/components/chart/HexagramSquareCircle.vue scripts/verify-fengshui.mjs
git commit -m "refactor: 先天六十四卦圆环排序抽为共享 fuXiOrder（挂图改用）"
```

---

### Task 2: 数据层 —— 三盘/节气/度数（扩展 `luopan.js`）

**Files:**
- Modify: `src/data/luopan.js`（追加导出，不改既有结构）
- Modify: `src/data/luopan.d.ts`
- Modify: `scripts/verify-fengshui.mjs`（追加断言）

**Interfaces:**
- Produces:
  - `humanMountains: Mountain[]`（人盘中针，偏移 −7.5°）、`heavenMountains: Mountain[]`（天盘缝针，偏移 +7.5°）——与 `mountains` 同字段结构。
  - `solarTerms: { name: string; angle: number }[]`（24 条，每 15°，冬至 0°）。
  - `degreeTicks: { angle: number; major: boolean; big: boolean; label: string }[]`（360 条）。
- 偏移方向口径：**人盘中针逆时针偏 −7.5°、天盘缝针顺时针偏 +7.5°**（以三合盘标准口径为准；若对照权威盘式发现符号相反，仅改本文件两处符号并同步 verify 断言）。

- [ ] **Step 1: `luopan.js` 追加三盘**

在 `src/data/luopan.js` 末尾追加：

```js
// 三盘三针：地盘正针 = 上表 mountains；人盘中针/天盘缝针 为 24 山整体偏移
// 人盘中针（消砂用）相对地盘逆时针偏 7.5°；天盘缝针（纳水用）相对地盘顺时针偏 7.5°
export const humanMountains = mountains.map((m) => ({
  ...m,
  angle: (m.angle - 7.5 + 360) % 360,
}));

export const heavenMountains = mountains.map((m) => ({
  ...m,
  angle: (m.angle + 7.5) % 360,
}));
```

- [ ] **Step 2: `luopan.js` 追加节气与度数**

在末尾继续追加：

```js
// 二十四节气：每 15°，冬至在 0°（子位），顺时针
export const solarTerms = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明',
  '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋',
  '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
].map((name, i) => ({ name, angle: i * 15 }));

// 周天度数：每 1° 刻度，15° 主刻度，90° 大字标注
export const degreeTicks = Array.from({ length: 360 }, (_, i) => ({
  angle: i,
  major: i % 15 === 0,
  big: i % 90 === 0,
  label: i % 90 === 0 ? String(i) : '',
}));
```

- [ ] **Step 3: 更新 `luopan.d.ts`**

追加：

```ts
export interface SolarTerm {
  name: string
  angle: number
}
export interface DegreeTick {
  angle: number
  major: boolean
  big: boolean
  label: string
}
export const humanMountains: Mountain[]
export const heavenMountains: Mountain[]
export const solarTerms: SolarTerm[]
export const degreeTicks: DegreeTick[]
```

- [ ] **Step 4: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { humanMountains, heavenMountains, solarTerms, degreeTicks } from '../src/data/luopan.js';
```

在 `if (failed)` 之前追加：

```js
// —— 三盘三针 ——
check(humanMountains.length === 24, `人盘中针应 24 山，实为 ${humanMountains.length}`);
check(heavenMountains.length === 24, `天盘缝针应 24 山，实为 ${heavenMountains.length}`);
check(
  humanMountains.every((m) => m.name === mountains[humanMountains.indexOf(m)].name),
  '人盘中针山名应与地盘一致'
);
check(
  humanMountains[0].angle === 352.5,
  `人盘中针子山应为 352.5°（-7.5），实为 ${humanMountains[0].angle}`
);
check(
  heavenMountains[0].angle === 7.5,
  `天盘缝针子山应为 7.5°（+7.5），实为 ${heavenMountains[0].angle}`
);

// —— 二十四节气 ——
check(solarTerms.length === 24, `二十四节气应为 24 条，实为 ${solarTerms.length}`);
check(solarTerms[0].name === '冬至' && solarTerms[0].angle === 0, '冬至应在 0°');
check(
  solarTerms.every((t, i) => t.angle === i * 15),
  '二十四节气应每 15° 连续'
);

// —— 周天度数 ——
check(degreeTicks.length === 360, `周天度数应为 360 刻度，实为 ${degreeTicks.length}`);
check(degreeTicks[0].big && degreeTicks[0].label === '0', '0° 应为大字标注');
```

- [ ] **Step 5: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 6: 格式化 + 构建**

Run: `npx prettier --write src/data/luopan.js src/data/luopan.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 7: 提交**

```bash
git add src/data/luopan.js src/data/luopan.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 罗盘三盘三针（人盘/天盘偏移）、二十四节气、周天度数数据"
```

---

### Task 3: 数据层 —— 二十八宿 `mansions.js`

**Files:**
- Create: `src/data/mansions.js`
- Create: `src/data/mansions.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces: `mansions: Mansion[]`（28 条，`{ name, xiang, wuxing, degree }`，七曜五行，古度制）。供消砂读数（P1）与消砂判断（P3）。
- 度数和口径：古度合 366（含闰度）。盘面/读数按比例归一至 360°（见 Task 5 的 `mansionAt`）。起始锚点：**角宿在 0°**（P3 消砂前需对照权威盘式核对锚点，本计划先固定角宿 0°）。

- [ ] **Step 1: 创建 `src/data/mansions.js`**

```js
// 二十八宿（古度制，含闰度；和 366°，盘面按比例归一至 360°）
// 五行 = 七曜（木金土日月火水 依序循环）
export const mansions = [
  { name: '角', xiang: '东方青龙', wuxing: '木', degree: 12 },
  { name: '亢', xiang: '东方青龙', wuxing: '金', degree: 9 },
  { name: '氐', xiang: '东方青龙', wuxing: '土', degree: 15 },
  { name: '房', xiang: '东方青龙', wuxing: '日', degree: 5 },
  { name: '心', xiang: '东方青龙', wuxing: '月', degree: 5 },
  { name: '尾', xiang: '东方青龙', wuxing: '火', degree: 18 },
  { name: '箕', xiang: '东方青龙', wuxing: '水', degree: 11 },
  { name: '斗', xiang: '北方玄武', wuxing: '木', degree: 25 },
  { name: '牛', xiang: '北方玄武', wuxing: '金', degree: 7 },
  { name: '女', xiang: '北方玄武', wuxing: '土', degree: 11 },
  { name: '虚', xiang: '北方玄武', wuxing: '日', degree: 10 },
  { name: '危', xiang: '北方玄武', wuxing: '月', degree: 16 },
  { name: '室', xiang: '北方玄武', wuxing: '火', degree: 18 },
  { name: '壁', xiang: '北方玄武', wuxing: '水', degree: 9 },
  { name: '奎', xiang: '西方白虎', wuxing: '木', degree: 18 },
  { name: '娄', xiang: '西方白虎', wuxing: '金', degree: 12 },
  { name: '胃', xiang: '西方白虎', wuxing: '土', degree: 15 },
  { name: '昴', xiang: '西方白虎', wuxing: '日', degree: 11 },
  { name: '毕', xiang: '西方白虎', wuxing: '月', degree: 16 },
  { name: '觜', xiang: '西方白虎', wuxing: '火', degree: 2 },
  { name: '参', xiang: '西方白虎', wuxing: '水', degree: 9 },
  { name: '井', xiang: '南方朱雀', wuxing: '木', degree: 33 },
  { name: '鬼', xiang: '南方朱雀', wuxing: '金', degree: 4 },
  { name: '柳', xiang: '南方朱雀', wuxing: '土', degree: 15 },
  { name: '星', xiang: '南方朱雀', wuxing: '日', degree: 7 },
  { name: '张', xiang: '南方朱雀', wuxing: '月', degree: 18 },
  { name: '翼', xiang: '南方朱雀', wuxing: '火', degree: 18 },
  { name: '轸', xiang: '南方朱雀', wuxing: '水', degree: 17 },
];
```

- [ ] **Step 2: 创建 `src/data/mansions.d.ts`**

```ts
export interface Mansion {
  name: string
  xiang: '东方青龙' | '南方朱雀' | '西方白虎' | '北方玄武'
  wuxing: string
  degree: number
}
export const mansions: Mansion[]
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { mansions } from '../src/data/mansions.js';
```

在 `if (failed)` 之前追加：

```js
// —— 二十八宿 ——
check(mansions.length === 28, `二十八宿应为 28 条，实为 ${mansions.length}`);
const xiangSet = new Set(mansions.map((m) => m.xiang));
check(xiangSet.size === 4, `二十八宿应分四象，实为 ${xiangSet.size} 象`);
const sumDeg = mansions.reduce((s, m) => s + m.degree, 0);
check(sumDeg >= 355 && sumDeg <= 370, `二十八宿古度和应约 360（含闰度），实为 ${sumDeg}`);
const names = mansions.map((m) => m.name);
check(new Set(names).size === 28, '二十八宿宿名不应重复');
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/data/mansions.js src/data/mansions.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/data/mansions.js src/data/mansions.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 二十八宿数据（七曜五行/古度，含结构校验）"
```

---

### Task 4: 数据层 —— 六十甲子 `jiazi.js`

**Files:**
- Create: `src/data/jiazi.js`
- Create: `src/data/jiazi.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces: `jiazi: Jiazi[]`（60 条，`{ name, nian, angle }`，每 6°，甲子 0°，含纳音五行）。供择日读数（P1）与分金（P2）。

- [ ] **Step 1: 创建 `src/data/jiazi.js`**

```js
// 六十甲子（每 6°，甲子 0°）+ 纳音五行（每两柱共用一纳音）
const JIAZI_NAMES = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

const NAYIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土',
  '白蜡金', '杨柳木', '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金',
  '山下火', '平地木', '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
];

export const jiazi = JIAZI_NAMES.map((name, i) => ({
  name,
  nian: NAYIN[Math.floor(i / 2)],
  angle: i * 6,
}));
```

- [ ] **Step 2: 创建 `src/data/jiazi.d.ts`**

```ts
export interface Jiazi {
  name: string
  nian: string
  angle: number
}
export const jiazi: Jiazi[]
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { jiazi } from '../src/data/jiazi.js';
```

在 `if (failed)` 之前追加：

```js
// —— 六十甲子 ——
check(jiazi.length === 60, `六十甲子应为 60 条，实为 ${jiazi.length}`);
check(jiazi[0].name === '甲子' && jiazi[0].angle === 0, '甲子应在 0°');
check(jiazi.every((j, i) => j.angle === i * 6), '六十甲子应每 6° 连续');
check(jiazi.every((j) => j.nian && j.nian.length > 0), '每柱应有纳音');
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/data/jiazi.js src/data/jiazi.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/data/jiazi.js src/data/jiazi.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 六十甲子数据（纳音五行，含结构校验）"
```

---

### Task 5: 读数工具 `utils/luopanRead.js` + 圈配置 `data/luopanRings.js`

**Files:**
- Create: `src/utils/luopanRead.js`
- Create: `src/utils/luopanRead.d.ts`
- Create: `src/data/luopanRings.js`
- Create: `src/data/luopanRings.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces:
  - `itemAt(deg, items, angleKey?)`: 按最近角度取项（通用，循环距离）。
  - `termAt(deg): string`、`jiaziAt(deg): string`、`plateMountainAt(deg, plate): string`、`hexagramAt(deg): string`、`mansionAt(deg): string`——读数入口，Task 6 的 Luopan 读数 emit 依赖。
  - `RING_TYPES: Record<RingId, { type; radius }>`、`MODES: { id; label }[]`、`modeRings: Record<ModeId, RingId[]>`——圈配置与模式映射。
- 本任务新建的 `luopanRead.js` 用相对导入，node 可直接 import 校验。

- [ ] **Step 1: 创建 `src/utils/luopanRead.js`**

```js
// 罗盘按角度读数（纯函数，不触碰 DOM，node 脚本可直接 import 校验）
import { humanMountains, heavenMountains, solarTerms } from '../data/luopan.js';
import { mansions } from '../data/mansions.js';
import { jiazi } from '../data/jiazi.js';
import { fuXiRing } from './fuXiOrder.js';

function normalize(a) {
  return ((a % 360) + 360) % 360;
}

// 通用最近角度取项（循环距离）
export function itemAt(deg, items, angleKey = 'angle') {
  const d = normalize(deg);
  let best = items[0];
  let bestDiff = Infinity;
  for (const it of items) {
    let diff = Math.abs(normalize(it[angleKey]) - d);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = it;
    }
  }
  return best;
}

export const termAt = (deg) => itemAt(deg, solarTerms).name;
export const jiaziAt = (deg) => itemAt(deg, jiazi).name;
export const plateMountainAt = (deg, plate) => itemAt(deg, plate).name;
export const hexagramAt = (deg) => itemAt(deg, fuXiRing).name;

// 二十八宿：按古度比例归一至 360° 后做区间查找（角宿 0° 起）
export function mansionAt(deg) {
  const total = mansions.reduce((s, m) => s + m.degree, 0);
  const scaled = (normalize(deg) / 360) * total;
  let acc = 0;
  for (const m of mansions) {
    acc += m.degree;
    if (scaled < acc) return m.name;
  }
  return mansions[mansions.length - 1].name;
}
```

- [ ] **Step 2: 创建 `src/utils/luopanRead.d.ts`**

```ts
import type { Mountain } from '../data/luopan';

export function itemAt<T extends { [k: string]: unknown }>(
  deg: number,
  items: T[],
  angleKey?: string
): T
export function termAt(deg: number): string
export function jiaziAt(deg: number): string
export function plateMountainAt(deg: number, plate: Mountain[]): string
export function hexagramAt(deg: number): string
export function mansionAt(deg: number): string
```

- [ ] **Step 3: 创建 `src/data/luopanRings.js`**

```js
// 罗盘圈配置 + 模式→圈集映射（数据驱动；半径按可读性可调）
export const RING_TYPES = {
  trigram: { type: 'glyphs', radius: 148 },   // 后天八卦（常驻）
  terms: { type: 'labels', radius: 176 },      // 二十四节气
  mansions: { type: 'labels', radius: 176 },   // 二十八宿
  hexagrams: { type: 'glyphs', radius: 184 },  // 六十四卦（先天圆环）
  earth: { type: 'labels', radius: 198 },      // 地盘正针
  human: { type: 'labels', radius: 198 },      // 人盘中针
  heaven: { type: 'labels', radius: 198 },     // 天盘缝针
  jiazi: { type: 'labels', radius: 198 },      // 六十甲子
  degrees: { type: 'ticks', radius: 220 },     // 周天度数
};

export const MODES = [
  { id: 'ding', label: '定向' },
  { id: 'xiao', label: '消砂' },
  { id: 'na', label: '纳水' },
  { id: 'ze', label: '择日' },
  { id: 'gua', label: '易卦' },
];

export const modeRings = {
  ding: ['trigram', 'terms', 'earth', 'degrees'],
  xiao: ['trigram', 'mansions', 'human', 'degrees'],
  na: ['trigram', 'heaven', 'degrees'],
  ze: ['trigram', 'terms', 'jiazi'],
  gua: ['trigram', 'hexagrams', 'degrees'],
};
```

- [ ] **Step 4: 创建 `src/data/luopanRings.d.ts`**

```ts
export type RingType = 'ticks' | 'labels' | 'glyphs'
export type RingId =
  | 'trigram'
  | 'terms'
  | 'mansions'
  | 'hexagrams'
  | 'earth'
  | 'human'
  | 'heaven'
  | 'jiazi'
  | 'degrees'
export interface RingSpec {
  type: RingType
  radius: number
}
export type ModeId = 'ding' | 'xiao' | 'na' | 'ze' | 'gua'
export interface ModeSpec {
  id: ModeId
  label: string
}
export const RING_TYPES: Record<RingId, RingSpec>
export const MODES: ModeSpec[]
export const modeRings: Record<ModeId, RingId[]>
```

- [ ] **Step 5: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import {
  termAt,
  jiaziAt,
  hexagramAt,
  mansionAt,
  plateMountainAt,
} from '../src/utils/luopanRead.js';
import { humanMountains } from '../src/data/luopan.js';
import { RING_TYPES, MODES, modeRings } from '../src/data/luopanRings.js';
```

在 `if (failed)` 之前追加：

```js
// —— 读数工具 ——
check(termAt(0) === '冬至', '0° 节气应为冬至');
check(termAt(90) === '春分', '90° 节气应为春分');
check(jiaziAt(0) === '甲子', '0° 甲子应为甲子');
check(jiaziAt(12) === '丙寅', '12° 甲子应为丙寅');
check(hexagramAt(0) === '乾', '0° 卦应为乾');
check(hexagramAt(180) === '坤', '180° 卦应为坤');
check(mansionAt(0) === '角', '0° 宿应为角');
check(plateMountainAt(352.5, humanMountains) === '子', '人盘 352.5° 应为子');

// —— 圈配置与模式映射 ——
check(MODES.length === 5, `应 5 个模式，实为 ${MODES.length}`);
check(new Set(MODES.map((m) => m.id)).size === 5, '模式 id 不应重复');
for (const m of MODES) {
  const rings = modeRings[m.id];
  check(rings && rings.length > 0, `模式 ${m.id} 应有圈集`);
  for (const r of rings) {
    check(r in RING_TYPES, `模式 ${m.id} 引用了未定义圈 ${r}`);
  }
}
check(modeRings.ding.includes('earth'), '定向模式应含地盘正针');
check(modeRings.gua.includes('hexagrams'), '易卦模式应含六十四卦');
```

- [ ] **Step 6: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 7: 格式化 + 构建**

Run: `npx prettier --write src/utils/luopanRead.js src/utils/luopanRead.d.ts src/data/luopanRings.js src/data/luopanRings.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 8: 提交**

```bash
git add src/utils/luopanRead.js src/utils/luopanRead.d.ts src/data/luopanRings.js src/data/luopanRings.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 罗盘按角度读数工具 + 圈配置/模式映射数据"
```

---

### Task 6: 通用圈渲染器 `RingLayer.vue`

**Files:**
- Create: `src/components/fengshui/RingLayer.vue`

**Interfaces:**
- Props: `type: 'ticks'|'labels'|'glyphs'`、`radius: number`、`items: RingItem[]`（`{ angle, text?, glyph?, sub?, binary?, active? }`）、`interactive?: boolean`。
- Emits: `itemTap(item)`——label/glyph 项被点按（`interactive` 时）。
- Consumes: `HexLines`（`@components/chart/HexLines.vue`，卦爻符号）、`theme`（`@/styles/theme`）。
- 不感知模式/选中态，纯渲染；「哪个圈、哪条数据、是否可点」由 Luopan 传入。

- [ ] **Step 1: 创建 `RingLayer.vue`**

```vue
<template>
  <g>
    <!-- ticks：1° 细线、15° 主刻度、90° 大字 -->
    <template v-if="type === 'ticks'">
      <line
        v-for="(it, i) in items"
        :key="'l' + i"
        :x1="pos(it.angle, radius - tickLen(it)).x"
        :y1="pos(it.angle, radius - tickLen(it)).y"
        :x2="pos(it.angle, radius).x"
        :y2="pos(it.angle, radius).y"
        :stroke="it.big ? theme.gold : theme.goldLight"
        :stroke-width="it.big ? 1.2 : 0.6"
      />
      <text
        v-for="(it, i) in bigItems"
        :key="'t' + i"
        :x="pos(it.angle, radius - 16).x"
        :y="pos(it.angle, radius - 16).y"
        text-anchor="middle"
        dominant-baseline="central"
        class="deg-label"
      >{{ it.label }}</text>
    </template>

    <!-- labels：文字 + 选中高亮 -->
    <template v-else-if="type === 'labels'">
      <g
        v-for="(it, i) in items"
        :key="'L' + i"
        :transform="`translate(${pos(it.angle, radius).x}, ${pos(it.angle, radius).y}) rotate(${it.angle})`"
        text-anchor="middle"
        dominant-baseline="central"
        @pointerdown.stop="interactive && $emit('itemTap', it)"
      >
        <rect
          v-if="it.active"
          x="-16"
          y="-14"
          width="32"
          height="30"
          rx="3"
          :fill="activeFill"
        />
        <text :class="['label', { active: it.active }]">{{ it.text }}</text>
      </g>
    </template>

    <!-- glyphs：卦爻符号（binary）或 单字符号（glyph + 可选 sub） -->
    <template v-else>
      <g
        v-for="(it, i) in items"
        :key="'G' + i"
        :transform="`translate(${pos(it.angle, radius).x}, ${pos(it.angle, radius).y})`"
        text-anchor="middle"
        @pointerdown.stop="interactive && $emit('itemTap', it)"
      >
        <HexLines v-if="it.binary" :binary="it.binary" :size="GLYPH_SIZE" />
        <template v-else>
          <text :y="-8" class="glyph" dominant-baseline="central">{{ it.glyph }}</text>
          <text v-if="it.sub" :y="16" class="glyph-sub" dominant-baseline="central">{{ it.sub }}</text>
        </template>
      </g>
    </template>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HexLines from '../chart/HexLines.vue';
import { theme } from '@/styles/theme';

const props = defineProps({
  type: { type: String, required: true }, // 'ticks' | 'labels' | 'glyphs'
  radius: { type: Number, required: true },
  items: { type: Array, default: () => [] },
  interactive: { type: Boolean, default: false },
});
defineEmits(['itemTap']);

const GLYPH_SIZE = 14; // 卦爻符号总宽（64 卦环用）

const pos = (a, r) => ({
  x: Math.sin((a * Math.PI) / 180) * r,
  y: -Math.cos((a * Math.PI) / 180) * r,
});

const tickLen = (it) => (it.big ? 10 : it.major ? 6 : 3);
const bigItems = computed(() => props.items.filter((it) => it.label));
const activeFill = 'rgba(178,58,46,0.14)';
</script>

<style scoped>
.label {
  font-size: 17px;
  fill: var(--ink);
  pointer-events: none;
}
.label.active {
  fill: var(--cinnabar);
  font-size: 19px;
  font-weight: 700;
}
.deg-label {
  font-size: 11px;
  fill: var(--gold);
  pointer-events: none;
}
.glyph {
  font-size: 26px;
  fill: var(--ink-light);
  pointer-events: none;
}
.glyph-sub {
  font-size: 11px;
  fill: var(--ink-light);
  pointer-events: none;
}
</style>
```

> 说明：`pos` 返回相对盘心的偏移（RingLayer 渲染在已 `translate(C,C)` 的组内，由 Luopan 提供上下文）；`@pointerdown.stop` 阻断与拖拽命中圈的冲突。

- [ ] **Step 2: 格式化 + 构建**

Run: `npx prettier --write src/components/fengshui/RingLayer.vue && pnpm build`
Expected: 构建成功。

- [ ] **Step 3: 提交**

```bash
git add src/components/fengshui/RingLayer.vue
git commit -m "feat: RingLayer 通用圈渲染器 —— ticks/labels/glyphs 三型"
```

---

### Task 7: `Luopan.vue` 重构 —— 圈配置驱动 + 十字线 + 天池 + 读数

**Files:**
- Rewrite: `src/components/fengshui/Luopan.vue`

**Interfaces:**
- Props: `mountain: string`（保留，默认 '子'）、`mode: string`（新增，默认 'ding'）。
- Emits: `select(name)`（保留，`mountainAt(-rot)` 吸附后上报）、`readout(readoutObj)`（新增）。
- Consumes: `RING_TYPES`/`MODES` 无关、`modeRings`（`@/data/luopanRings`）、`mountains`/`humanMountains`/`heavenMountains`/`solarTerms`/`degreeTicks`（`@/data/luopan`）、`mansions`（`@/data/mansions`）、`jiazi`（`@/data/jiazi`）、`fuXiRing`（`@/utils/fuXiOrder`）、`mountainAt`/`oppositeMountain`（`@/utils/fengShui`）、`termAt`/`jiaziAt`/`hexagramAt`/`mansionAt`/`plateMountainAt`（`@/utils/luopanRead`）、`useCompassSensor`（`@/composables/useCompassSensor`）。
- Produces: `readout` 对象 `{ angle, degree, mountain, term, human, heaven, mansion, jiazi, hexagram }`（角度为顶参考线读值，连续，不吸附）。
- **交互不变**：拖拽转盘、点按选山、手机传感跟随、水平气泡，全部保留。

- [ ] **Step 1: 重写 `Luopan.vue`**

```vue
<template>
  <div class="luopan">
    <svg
      ref="svgEl"
      class="luopan-svg"
      viewBox="0 0 520 520"
      :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
    >
      <!-- 外装饰环（固定） -->
      <circle :cx="C" :cy="C" :r="228" fill="none" :stroke="theme.gold" stroke-width="1.6" />
      <circle :cx="C" :cy="C" :r="222" fill="none" :stroke="theme.goldLight" stroke-width="0.7" stroke-dasharray="2 5" />

      <!-- 天心十道（固定，压圈之上） -->
      <line :x1="C - 224" :y1="C" :x2="C + 224" :y2="C" class="crosshair" />
      <line :x1="C" :y1="C - 224" :x2="C" :y2="C + 224" class="crosshair" />

      <!-- 旋转内盘：圈配置驱动 -->
      <g :transform="`rotate(${rot} ${C} ${C})`">
        <!-- 拖拽命中圈（透明整圆） -->
        <circle :cx="C" :cy="C" :r="220" fill="transparent" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />

        <!-- 模式圈集 -->
        <g :transform="`translate(${C} ${C})`">
          <RingLayer
            v-for="rid in activeRings"
            :key="rid"
            :type="RING_TYPES[rid].type"
            :radius="RING_TYPES[rid].radius"
            :items="ringItems(rid)"
            :interactive="interactiveRings.includes(rid)"
            @item-tap="onItemTap"
          />
        </g>
      </g>

      <!-- 天池（盘心，固定） -->
      <g class="tianchi" aria-hidden="true">
        <circle :cx="C" :cy="C" r="64" fill="#fffdf6" :stroke="theme.goldLight" stroke-width="0.8" />
        <circle :cx="C" :cy="C" r="58" fill="none" :stroke="theme.goldLight" stroke-width="0.5" stroke-dasharray="1 4" />
        <line :x1="C" :y1="C - 58" :x2="C" :y2="C + 58" class="needle-line" />
        <circle :cx="C" :cy="C" r="4" :fill="theme.cinnabar" />
      </g>

      <!-- 盘心水平气泡（仅传感运行中；覆盖天池上方） -->
      <g v-if="sensorState === 'running' && beta !== null && gamma !== null" aria-hidden="true">
        <circle :cx="C" :cy="C" r="26" fill="#fffdf6" :stroke="theme.goldLight" stroke-width="1" />
        <circle :cx="C" :cy="C" r="21" fill="none" :stroke="theme.goldLight" stroke-width="0.6" stroke-dasharray="1 4" />
        <circle :cx="C + bubbleDx" :cy="C + bubbleDy" r="4.5" :fill="level ? theme.cinnabar : theme.inkLight" />
      </g>

      <!-- 固定指针（红针标坐山/朝向）+ 对宫金点/山名 -->
      <path :d="pointerPath" :fill="theme.cinnabar" />
      <circle :cx="C" :cy="C + 212" r="5" :fill="theme.gold" />
      <text class="opposite-name" :x="C" :y="C + 230" text-anchor="middle" dominant-baseline="central">{{ opposite }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import RingLayer from './RingLayer.vue';
import { RING_TYPES, modeRings } from '@/data/luopanRings';
import { mountains, humanMountains, heavenMountains, solarTerms, degreeTicks } from '@/data/luopan';
import { mansions } from '@/data/mansions';
import { jiazi } from '@/data/jiazi';
import { fuXiRing } from '@/utils/fuXiOrder';
import { mountainAt, oppositeMountain } from '@/utils/fengShui';
import { termAt, jiaziAt, hexagramAt, mansionAt, plateMountainAt } from '@/utils/luopanRead';
import { theme } from '@/styles/theme';
import { useCompassSensor, LEVEL_TOLERANCE } from '@/composables/useCompassSensor';

const props = defineProps({
  mountain: { type: String, default: '子' },
  mode: { type: String, default: 'ding' },
});
const emit = defineEmits(['select', 'readout']);

const C = 260;
const svgEl = ref(null);
const dragging = ref(false);
const rot = ref(0);
const { state: sensorState, heading, beta, gamma, level } = useCompassSensor();
let startAngle = 0;
let startRot = 0;

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
];

// 顶参考线读值（连续角度，不吸附）
const readAngle = computed(() => ((-rot.value % 360) + 360) % 360);
const readout = computed(() => ({
  angle: Math.round(readAngle.value) % 360,
  degree: Math.round(readAngle.value) % 360,
  mountain: mountainAt(readAngle.value),
  term: termAt(readAngle.value),
  human: plateMountainAt(readAngle.value, humanMountains),
  heaven: plateMountainAt(readAngle.value, heavenMountains),
  mansion: mansionAt(readAngle.value),
  jiazi: jiaziAt(readAngle.value),
  hexagram: hexagramAt(readAngle.value),
}));

watch(
  readout,
  (r) => emit('readout', r),
  { flush: 'post' }
);

const activeRings = computed(() => modeRings[props.mode] || modeRings.ding);
// 可点按的圈：三盘 24 山（点按即选定方向）
const interactiveRings = ['earth', 'human', 'heaven'];

const angleOf = (name) => mountains.find((m) => m.name === name)?.angle ?? 0;
const opposite = computed(() => oppositeMountain(props.mountain));

const pos = (a, r) => ({
  x: C + r * Math.sin((a * Math.PI) / 180),
  y: C - r * Math.cos((a * Math.PI) / 180),
});

// 气泡偏移（保留既有实现）
const BUBBLE_MAX = 14;
const clamp01 = (v) => Math.max(-1, Math.min(1, v));
const bubbleDx = computed(() =>
  gamma.value === null ? 0 : clamp01(-gamma.value / LEVEL_TOLERANCE) * BUBBLE_MAX
);
const bubbleDy = computed(() =>
  beta.value === null ? 0 : clamp01(beta.value / LEVEL_TOLERANCE) * BUBBLE_MAX
);

const pointerPath = `M ${C} 14 L ${C + 9} 34 L ${C} 27 L ${C - 9} 34 Z`;

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

// 圈内容构建；高亮只在地盘（selectedDir 是地盘概念，人盘/天盘同山名不同位置不应高亮）
function plateItems(plate, highlight) {
  return plate.map((m) => ({
    angle: m.angle,
    text: m.name,
    active: highlight && m.name === props.mountain,
  }));
}
function ringItems(id) {
  switch (id) {
    case 'trigram':
      return trigramAngles.map((t) => ({ angle: t.angle, glyph: t.trigram, sub: `${t.name}·${t.num}` }));
    case 'terms':
      return solarTerms.map((t) => ({ angle: t.angle, text: t.name }));
    case 'mansions':
      return mansions.map((m) => ({ angle: mansionAngle(m), text: m.name }));
    case 'hexagrams':
      return fuXiRing.map((h) => ({ angle: h.angle, binary: h.binary }));
    case 'earth':
      return plateItems(mountains, true);
    case 'human':
      return plateItems(humanMountains, false);
    case 'heaven':
      return plateItems(heavenMountains, false);
    case 'jiazi':
      return jiazi.map((j) => ({ angle: j.angle, text: j.name }));
    case 'degrees':
      return degreeTicks;
    default:
      return [];
  }
}

// 二十八宿：古度比例归一至 360°，宿内居中放置标签
function mansionAngle(m) {
  const total = mansions.reduce((s, x) => s + x.degree, 0);
  let before = 0;
  for (const x of mansions) {
    if (x === m) return ((before + x.degree / 2) / total) * 360;
    before += x.degree;
  }
  return 0;
}

function onItemTap(item) {
  if (sensorState.value === 'running') return;
  if (item.text && mountains.some((m) => m.name === item.text)) {
    select(item.text);
  }
}

// 指针事件 → 山角坐标（0° 顶、顺时针）
function angleOfPoint(e) {
  const rect = svgEl.value.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  return (Math.atan2(x, -y) * 180) / Math.PI;
}

function onDown(e) {
  if (sensorState.value === 'running') return;
  dragging.value = true;
  startAngle = angleOfPoint(e);
  startRot = rot.value;
  e.currentTarget.setPointerCapture(e.pointerId);
}
function onMove(e) {
  if (!dragging.value) return;
  let delta = angleOfPoint(e) - startAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  rot.value = startRot + delta;
}
function onUp() {
  if (!dragging.value) return;
  dragging.value = false;
  const snapped = Math.round(rot.value / 15) * 15;
  rot.value = snapped;
  emit('select', mountainAt(-snapped));
}

function select(name) {
  if (sensorState.value === 'running') return;
  rot.value = -angleOf(name);
  emit('select', name);
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
.crosshair {
  stroke: var(--gold);
  stroke-opacity: 0.45;
  stroke-width: 0.6;
  pointer-events: none;
}
.needle-line {
  stroke: var(--cinnabar);
  stroke-width: 1;
  pointer-events: none;
}
.opposite-name {
  font-size: 13px;
  fill: var(--gold);
  pointer-events: none;
}
</style>
```

> 说明：读数 emit 用 `watch(readout, …, { flush: 'post' })`——拖拽期间 `rot` 逐帧变化触发重渲染，`flush: 'post'` 保证在 DOM 更新后 emit，面板读数平滑跟随。

- [ ] **Step 2: 格式化 + 构建**

Run: `npx prettier --write src/components/fengshui/Luopan.vue && pnpm build`
Expected: 构建成功。

- [ ] **Step 3: dev 走查（定向模式行为回归）**

Run: `pnpm dev`
逐项核对：
1. 定向模式默认盘面：后天八卦 + 节气 + 地盘 24 山 + 度数刻度；十字线压盘；天池在盘心。
2. 拖拽转盘 → 读数 emit、吸附 15°、`select` 上报；点按山名 → 选中高亮；传感跟随 → 盘面实时转。
3. 切 `mode="xiao"/"na"/"ze"/"gua"`（DevTools 手动改 prop 或临时在父组件改）→ 圈集随之更换、后天八卦常驻。
4. 浏览器 console 无报错。

- [ ] **Step 4: 提交**

```bash
git add src/components/fengshui/Luopan.vue
git commit -m "feat: Luopan 重构 —— 圈配置驱动多圈 + 天心十道/天池 + 读数 emit（交互保留）"
```

---

### Task 8: `FengShuiView.vue` —— 模式开关 + 读数面板 + 判断区占位

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `Luopan`（新增 `mode` 绑定与 `@readout`）、`MODES`（`@/data/luopanRings`）。
- Produces: `luopanMode` ref；模式开关；读数面板（按模式显示对应圈值）；「定向」模式保留现有 坐山/朝向、元运、飞星盘、解读区，其余模式显示判断区占位。

- [ ] **Step 1: script 区改造**

在 `<script setup>` import 区（`import Luopan from './Luopan.vue'` 旁）追加：

```js
import { MODES } from '@/data/luopanRings';
```

在 `const period = ref(9);` 之后追加：

```js
const luopanMode = ref('ding'); // 定向 | 消砂 | 纳水 | 择日 | 易卦
const readout = ref(null);      // Luopan 读数
```

- [ ] **Step 2: 模板改造 —— Luopan 绑定 + 模式开关 + 读数面板**

将 `<section class="fs-luopan">` 内的：

```html
<Luopan :mountain="selectedDir" @select="selectedDir = $event" />
```

替换为：

```html
<Luopan :mountain="selectedDir" :mode="luopanMode" @select="selectedDir = $event" @readout="readout = $event" />
```

在 `<section class="fs-controls">` 开头（`mode-toggle` 之前）插入模式开关：

```html
<div class="mode-switch" role="group" aria-label="罗盘模式">
  <button
    v-for="m in MODES"
    :key="m.id"
    type="button"
    :class="{ active: luopanMode === m.id }"
    @click="luopanMode = m.id"
  >{{ m.label }}</button>
</div>
```

将现有读句：

```html
<p class="readout">坐{{ shan }}朝{{ xiang }}</p>
```

替换为按模式分组的读数面板（保留定向读句，其他模式显示对应圈值）：

```html
<p class="readout">
  <template v-if="luopanMode === 'ding'">坐{{ shan }}朝{{ xiang }}</template>
  <template v-else-if="luopanMode === 'xiao'">人盘 {{ readout?.human ?? '–' }} · 宿 {{ readout?.mansion ?? '–' }}</template>
  <template v-else-if="luopanMode === 'na'">天盘 {{ readout?.heaven ?? '–' }} · {{ readout?.degree ?? '–' }}°</template>
  <template v-else-if="luopanMode === 'ze'">{{ readout?.term ?? '–' }} · {{ readout?.jiazi ?? '–' }}</template>
  <template v-else-if="luopanMode === 'gua'">卦 {{ readout?.hexagram ?? '–' }}</template>
  <span v-if="luopanMode !== 'ding'" class="readout-deg"> {{ readout?.degree ?? '' }}°</span>
</p>
```

在 `overall-banner` 之后（或紧随读数面板）插入精确读数行：

```html
<p class="readout-detail">
  <template v-if="luopanMode === 'ding'">{{ readout?.degree ?? '–' }}° · {{ readout?.term ?? '–' }}</template>
  <template v-else-if="luopanMode === 'gua'">先天圆环 · 坐向卦读数</template>
</p>
```

- [ ] **Step 3: 模板改造 —— 定向专属控制/内容条件渲染 + 判断区占位**

将「坐山/朝向」开关、元运段选、元运年份、大局 banner（即 `mode-toggle` 到 `overall-banner` 整块，`compass-row` 除外）包进 `v-if="luopanMode === 'ding'"`——这些只对定向判断有意义；`compass-row`（手机传感对准）保留在所有模式。

将：

```html
        <div class="mode-toggle" role="group" aria-label="坐向口径">
          <button
            type="button"
            :class="{ active: mode === '坐山' }"
            @click="mode = '坐山'"
          >
            坐山
          </button>
          <button
            type="button"
            :class="{ active: mode === '朝向' }"
            @click="mode = '朝向'"
          >
            朝向
          </button>
        </div>

        <div class="period-row" role="group" aria-label="元运">
          <button
            v-for="p in 9"
            :key="p"
            type="button"
            class="period-btn"
            :class="{ active: period === p }"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
        <p class="period-range">{{ periodInfo }}</p>
```

替换为（外层套 `<template v-if>`）：

```html
        <template v-if="luopanMode === 'ding'">
          <div class="mode-toggle" role="group" aria-label="坐向口径">
            <button
              type="button"
              :class="{ active: mode === '坐山' }"
              @click="mode = '坐山'"
            >
              坐山
            </button>
            <button
              type="button"
              :class="{ active: mode === '朝向' }"
              @click="mode = '朝向'"
            >
              朝向
            </button>
          </div>

          <div class="period-row" role="group" aria-label="元运">
            <button
              v-for="p in 9"
              :key="p"
              type="button"
              class="period-btn"
              :class="{ active: period === p }"
              @click="period = p"
            >
              {{ p }}
            </button>
          </div>
          <p class="period-range">{{ periodInfo }}</p>
        </template>
```

将大局 banner 也包进同一 `v-if`（`overall-banner` 是定向专属）：

```html
        <p class="overall-banner">
          <b>{{ overallInfo.name }}</b> —— {{ overallInfo.text }}
        </p>
```

替换为：

```html
        <template v-if="luopanMode === 'ding'">
          <p class="overall-banner">
            <b>{{ overallInfo.name }}</b> —— {{ overallInfo.text }}
          </p>
        </template>
```

再将飞星盘与解读区整段（从 `<section class="fs-pan">` 到 `</section>` 解读区结束）包进 `v-if="luopanMode === 'ding'"`，并追加占位：

将：

```html
      <section class="fs-pan">
        <FlyingStarPan :judges="judges" :special="special" />
      </section>

      <section class="fs-reading">
        <h2>宅运解读</h2>
        …
      </section>
```

替换为：

```html
      <template v-if="luopanMode === 'ding'">
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
      </template>

      <section v-else class="fs-pending">
        <h2>判断区</h2>
        <p class="pending-text">
          {{ pendingText }}
        </p>
      </section>
```

在 script 区追加（`periodInfo` computed 之后）：

```js
const pendingText = computed(() => {
  const map = {
    xiao: '消砂判断 · P3 上线（人盘中针 + 二十八宿 · 赖公砂法）',
    na: '纳水判断 · P3 上线（天盘缝针 + 双山五行）',
    ze: '择日输出 · P4 上线（二十四节气 + 六十甲子）',
    gua: '抽爻换象 · P4 上线（先天六十四卦盘）',
  };
  return map[luopanMode.value] || '';
});
```

- [ ] **Step 4: 样式补充**

在 `<style scoped>` 内（`.mode-toggle` 规则附近）追加：

```css
.mode-switch {
  display: inline-flex;
  border: 1px solid var(--gold);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}
.mode-switch button {
  padding: 7px 14px;
  font-size: 14px;
  color: var(--ink-light);
  background: var(--scroll);
  border: none;
  transition: background-color 0.2s, color 0.2s;
}
.mode-switch button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.readout-deg {
  font-size: 13px;
  color: var(--ink-light);
}
.readout-detail {
  font-size: 13px;
  color: var(--gold);
  margin: -4px 0 10px;
}
.fs-pending {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}
.fs-pending h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.pending-text {
  font-size: 14px;
  color: var(--ink-light);
}
```

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/components/fengshui/FengShuiView.vue && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: dev 走查**

Run: `pnpm dev`
逐项核对：
1. 底部「风水罗盘 ▸」打开全屏页，默认「定向」模式：圈集正确、十字线读数面板显示 坐X朝Y + 度数 + 节气。
2. 切「消砂/纳水/择日/易卦」：盘面圈集随之更换、后天八卦常驻、读数面板换对应内容、坐山/朝向与元运及大局 banner 隐藏（传感对准按钮保留）、下方显示「P3/P4 上线」占位。
3. 拖拽/点按/传感跟随在非定向模式同样工作（转盘 + 读数联动）。
4. 定向模式下原有 坐山/朝向、元运、飞星盘、解读区行为不变（回归）。
5. 移动端 ≤600px 与横屏 ≥820px 布局正常。

- [ ] **Step 7: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 风水页模式开关 + 读数面板 + 判断区占位（定向接线保留）"
```

---

### Task 9: 全量验证 + 收尾

**Files:**
- Modify: 无（验证 + 走查）

- [ ] **Step 1: 数据与逻辑校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（含既有玄空回归 + 新增三盘/节气/度数/28宿/甲子/卦环/读数/圈映射断言）。

- [ ] **Step 2: 格式化检查 + 构建**

Run: `npx prettier --check src/utils/fuXiOrder.js src/data/luopan.js src/data/mansions.js src/data/jiazi.js src/data/luopanRings.js src/utils/luopanRead.js src/components/chart/HexagramSquareCircle.vue src/components/fengshui/RingLayer.vue src/components/fengshui/Luopan.vue src/components/fengshui/FengShuiView.vue && pnpm build`
Expected: 全过、构建成功。

- [ ] **Step 3: UI 走查清单（`pnpm dev`）**

逐项核对设计规格「验证方式」：

1. 五模式切换：圈集随模式换、后天八卦常驻、切换后读数面板与下方判断区同步。
2. 十字线读数随转盘实时更新；传感跟随下读数 = 手机朝向。
3. 定向模式 → 飞星盘/解读区链路不变（坐山/朝向、元运仍生效）。
4. 拖拽/点按选山在三种 24 山圈（地/人/天）均可点选方向。
5. 挂图（Home）圆环卦位置与改造前一致（回归）。
6. 移动端（≤600px）盘面不超宽、圈内文字可辨、正文可滚动；横屏 ≥820px 左右分栏。
7. `prefers-reduced-motion` 下无多余动画（无新增动画）。

- [ ] **Step 4: 确认工作区状态**

Run: `git status --short`
Expected: 无未提交改动（或仅记录既存非相关改动）。

## 自审记录（写作时内联完成）

- **Spec 覆盖**：数据层（Task 2-4）、读数工具 + 圈映射（Task 5）、RingLayer（Task 6）、Luopan 十字线/天池/读数（Task 7）、FengShuiView 模式/读数/占位（Task 8）、验证（Task 9）；先天卦序复用（Task 1）。全部覆盖。
- **占位符扫描**：无 TBD/TODO；所有代码步骤含实际代码。
- **类型一致性**：`RING_TYPES`/`modeRings`/`RingId`/`ModeId` 在各任务一致；`readout` 字段名（angle/degree/mountain/term/human/heaven/mansion/jiazi/hexagram）Task 7 定义、Task 8 消费一致；`itemAt`/`termAt`/`jiaziAt`/`hexagramAt`/`mansionAt`/`plateMountainAt` 签名一致。
