# 罗盘消砂（P3a）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「消砂」模式判断区从占位变真断语：坐山线度五行为主、八方砂峰宿主五行为宾的赖公砂法，含八煞提示与三元龙分房。

**Architecture:** 数据层扩展 `mansions.js`（增宿主五行）+ 新增 `shaData.js`（线度五行起度/八煞/三元龙/断语）；算法层新增 `sha.js` 纯函数（宿定位/五行取度/生克断砂/八方/八煞/分房）；UI 在 `FengShuiView.vue` 消砂模式替换 `fs-pending` 占位为真判断区。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、纯 CSS、`@/` 路径别名、`pnpm`、node 校验脚本（无测试框架）。

## Global Constraints

- **无测试框架**（Vitest 未配置）。逻辑 TDD 用 node 脚本 `scripts/verify-fengshui.mjs` 承载断言；组件验证用 `pnpm build` + `npx prettier --check <涉及文件>`。
- **eslint 仓库级损坏（既存基建问题）**：本计划一律用 `npx prettier` 替代 `npx eslint`。
- **格式化**：仓库 `.prettierrc` 为 `semi: true`。写完 `npx prettier --write <涉及文件>`（仅格式），验证 `npx prettier --check <涉及文件>`，不要对全仓 `--check .`。
- 界面文案一律中文；代码注释用中文。
- JS 实现 + 兄弟 `.d.ts` 类型声明。
- **`mansions.js` 是既有数据文件**：本次为**追加字段**（每宿增 `sheng`），既有 `name`/`xiang`/`wuxing`/`degree` 字段**一字不改**。
- **新数据/工具用相对导入**（`../data/…`）而非 `@/`，保证 node 脚本可直接 import 校验。组件可用 `@/`。
- 不新增任何依赖。
- 不改动 `fengShui.js`、`flyingStars.js`、`useCompassSensor.js`、`luopanRead.js` 等既有文件（本次需求不涉及）。
- 二十八宿度数保留现行 366 度表，不改归一逻辑。

---

### Task 1: `mansions.js` 增宿主五行 `sheng`

**Files:**
- Modify: `src/data/mansions.js`（追加 `sheng` 字段）
- Modify: `src/data/mansions.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces: `mansions` 每条增 `sheng: string`（宿主五行，`wuxing` 七曜中 日/月 → 火）。

- [ ] **Step 1: `mansions.js` 每条追加 `sheng`**

在每条对象末尾追加 `sheng` 字段。宿主五行 = 七曜 日/月 → 火，其余同 `wuxing`：

```js
// 二十八宿（古度制，含闰度；和 366°，盘面按比例归一至 360°）
// 五行 = 七曜（木金土日月火水 依序循环）
// sheng = 宿主五行（消砂用）：七曜中 日/月 → 火（房虚昴星君火、张心危毕相火）
export const mansions = [
  { name: '角', xiang: '东方青龙', wuxing: '木', degree: 12, sheng: '木' },
  { name: '亢', xiang: '东方青龙', wuxing: '金', degree: 9, sheng: '金' },
  { name: '氐', xiang: '东方青龙', wuxing: '土', degree: 15, sheng: '土' },
  { name: '房', xiang: '东方青龙', wuxing: '日', degree: 5, sheng: '火' },
  { name: '心', xiang: '东方青龙', wuxing: '月', degree: 5, sheng: '火' },
  { name: '尾', xiang: '东方青龙', wuxing: '火', degree: 18, sheng: '火' },
  { name: '箕', xiang: '东方青龙', wuxing: '水', degree: 11, sheng: '水' },
  { name: '斗', xiang: '北方玄武', wuxing: '木', degree: 25, sheng: '木' },
  { name: '牛', xiang: '北方玄武', wuxing: '金', degree: 7, sheng: '金' },
  { name: '女', xiang: '北方玄武', wuxing: '土', degree: 11, sheng: '土' },
  { name: '虚', xiang: '北方玄武', wuxing: '日', degree: 10, sheng: '火' },
  { name: '危', xiang: '北方玄武', wuxing: '月', degree: 16, sheng: '火' },
  { name: '室', xiang: '北方玄武', wuxing: '火', degree: 18, sheng: '火' },
  { name: '壁', xiang: '北方玄武', wuxing: '水', degree: 9, sheng: '水' },
  { name: '奎', xiang: '西方白虎', wuxing: '木', degree: 18, sheng: '木' },
  { name: '娄', xiang: '西方白虎', wuxing: '金', degree: 12, sheng: '金' },
  { name: '胃', xiang: '西方白虎', wuxing: '土', degree: 15, sheng: '土' },
  { name: '昴', xiang: '西方白虎', wuxing: '日', degree: 11, sheng: '火' },
  { name: '毕', xiang: '西方白虎', wuxing: '月', degree: 16, sheng: '火' },
  { name: '觜', xiang: '西方白虎', wuxing: '火', degree: 2, sheng: '火' },
  { name: '参', xiang: '西方白虎', wuxing: '水', degree: 9, sheng: '水' },
  { name: '井', xiang: '南方朱雀', wuxing: '木', degree: 33, sheng: '木' },
  { name: '鬼', xiang: '南方朱雀', wuxing: '金', degree: 4, sheng: '金' },
  { name: '柳', xiang: '南方朱雀', wuxing: '土', degree: 15, sheng: '土' },
  { name: '星', xiang: '南方朱雀', wuxing: '日', degree: 7, sheng: '火' },
  { name: '张', xiang: '南方朱雀', wuxing: '月', degree: 18, sheng: '火' },
  { name: '翼', xiang: '南方朱雀', wuxing: '火', degree: 18, sheng: '火' },
  { name: '轸', xiang: '南方朱雀', wuxing: '水', degree: 17, sheng: '水' },
];
```

- [ ] **Step 2: 更新 `mansions.d.ts`**

```ts
export interface Mansion {
  name: string;
  xiang: '东方青龙' | '南方朱雀' | '西方白虎' | '北方玄武';
  wuxing: string;
  sheng: string; // 宿主五行（消砂用，七曜中 日/月 → 火）
  degree: number;
}
export const mansions: Mansion[];
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { mansions } from '../src/data/mansions.js';
```

（若已存在该 import 则跳过；下面 28 宿断言块若已存在 `mansions.length === 28` 断言，可保留。）

在 `if (failed) process.exit(1);` 之前追加：

```js
// —— 宿主五行（消砂）——
check(mansions.length === 28 && mansions.every((m) => m.sheng), '二十八宿应全部有宿主五行');
const HOST = {
  角: '木', 亢: '金', 氐: '土', 房: '火', 心: '火', 尾: '火', 箕: '水',
  斗: '木', 牛: '金', 女: '土', 虚: '火', 危: '火', 室: '火', 壁: '水',
  奎: '木', 娄: '金', 胃: '土', 昴: '火', 毕: '火', 觜: '火', 参: '水',
  井: '木', 鬼: '金', 柳: '土', 星: '火', 张: '火', 翼: '火', 轸: '水',
};
check(
  mansions.every((m) => m.sheng === HOST[m.name]),
  '宿主五行应满足 木金土火火火水 循环（日/月→火）'
);
// 宿主五行 = 七曜 日/月→火
check(
  mansions.every((m) => (m.wuxing === '日' || m.wuxing === '月') === (m.sheng === '火')),
  '宿主五行 火 应恰来自七曜 日/月（其余同 wuxing）'
);
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（既有断言 + 新增宿主五行断言）。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/data/mansions.js src/data/mansions.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/data/mansions.js src/data/mansions.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 二十八宿增宿主五行 sheng（七曜 日/月→火，消砂用）"
```

---

### Task 2: 消砂数据 `shaData.js`

**Files:**
- Create: `src/data/shaData.js`
- Create: `src/data/shaData.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces:
  - `LINE_CYCLE: string[]`（金木水火土循环序）、`lineStart: Record<string, number>`（28 宿每宿起度五行索引）。
  - `baSha: Record<string, string>`（坐山卦 → 煞曜地支）、`BRANCH_ANGLE: Record<string, number>`（12 地支 → 方位角）。
  - `sanYuanLong: Record<string, { dirs: string; fang: number[] }>`（三元龙应房）。
  - `shaJudgments: Record<Relation, { name; level; text }>`、`baShaText: string`。
- 新数据文件用相对导入。

- [ ] **Step 1: 创建 `src/data/shaData.js`**

```js
// 消砂数据：线度五行起度 / 八煞 / 三元龙分房 / 断语（文化参考）
// 线度五行 = 每宿第 1 度起某五行，逐度按 金→木→水→火→土 循环（主流传本，见设计文档）

// 金木水火土 循环序（索引 0..4）
export const LINE_CYCLE = ['金', '木', '水', '火', '土'];

// 28 宿每宿起度五行索引（井鬼室参娄亢虚氐箕斗 金起；心星房 木起；张奎胃昴牛尾 水起；
// 角壁毕柳 火起；翼轸觜危女 土起）。星属木组、虚属金组（主流传本，verify 钉住）。
export const lineStart = {
  井: 0, 鬼: 0, 室: 0, 参: 0, 娄: 0, 亢: 0, 虚: 0, 氐: 0, 箕: 0, 斗: 0, // 金组
  心: 1, 星: 1, 房: 1, // 木组
  张: 2, 奎: 2, 胃: 2, 昴: 2, 牛: 2, 尾: 2, // 水组
  角: 3, 壁: 3, 毕: 3, 柳: 3, // 火组
  翼: 4, 轸: 4, 觜: 4, 危: 4, 女: 4, // 土组
};

// 坐山八煞曜：坐山卦 → 煞曜地支（坎龙坤兔震山猴，艮虎离猪兑蛇头，巽鸡乾马为煞曜）
export const baSha = {
  坎: '辰', 坤: '卯', 震: '申', 艮: '寅', 离: '亥', 兑: '巳', 巽: '酉', 乾: '午',
};

// 十二地支方位角（0°=子/北，顺时针每 30°）——八煞煞曜换算方位角用
export const BRANCH_ANGLE = {
  子: 0, 丑: 30, 寅: 60, 卯: 90, 辰: 120, 巳: 150,
  午: 180, 未: 210, 申: 240, 酉: 270, 戌: 300, 亥: 330,
};

// 三元龙应房：天元龙应 1/4/7 房，地元龙应 2/5/8 房，人元龙应 3/6/9 房
export const sanYuanLong = {
  天元: { dirs: '子午卯酉乾坤艮巽', fang: [1, 4, 7] },
  地元: { dirs: '甲庚丙壬辰戌丑未', fang: [2, 5, 8] },
  人元: { dirs: '寅申巳亥乙辛丁癸', fang: [3, 6, 9] },
};

// 五种砂断语（关系 key → 断语）
export const shaJudgments = {
  sheng: { name: '生砂', level: '吉', text: '宾生我，福寿双全、财源大发，主催官科甲、人丁聪明。' },
  wang: { name: '旺砂', level: '吉', text: '宾我比和，丁财两旺、贵人相助，主文章出众、家业兴隆。' },
  cai: { name: '财砂', level: '吉', text: '我克宾为财，劳碌生财、爵禄进益，主救贫致富。' },
  xie: { name: '泄砂', level: '凶', text: '我生宾为泄，损丁短寿、破财生病，主家业渐衰、徒有虚名。' },
  sha: { name: '煞砂', level: '凶', text: '宾克我为煞，丁财两败、血光灾病，主颠沛流离、须化解。' },
};

// 八煞提示文案
export const baShaText = '煞曜方逢砂为凶，主血光灾病、宅墓不宜，宜以化解。';
```

- [ ] **Step 2: 创建 `src/data/shaData.d.ts`**

```ts
export const LINE_CYCLE: string[];
export const lineStart: Record<string, number>;
export const baSha: Record<string, string>;
export const BRANCH_ANGLE: Record<string, number>;
export interface SanYuanLong {
  dirs: string;
  fang: number[];
}
export const sanYuanLong: Record<string, SanYuanLong>;
export type ShaRelation = 'sheng' | 'wang' | 'cai' | 'xie' | 'sha';
export interface ShaJudgment {
  name: string;
  level: '吉' | '凶';
  text: string;
}
export const shaJudgments: Record<ShaRelation, ShaJudgment>;
export const baShaText: string;
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { LINE_CYCLE, lineStart, baSha, BRANCH_ANGLE, sanYuanLong, shaJudgments, baShaText } from '../src/data/shaData.js';
```

在 `if (failed)` 之前追加：

```js
// —— 消砂数据 ——
check(LINE_CYCLE.join('') === '金木水火土', '线度五行循环应为 金木水火土');
check(Object.keys(lineStart).length === 28, `线度五行起度应覆盖 28 宿，实为 ${Object.keys(lineStart).length}`);
check(
  mansions.every((m) => m.name in lineStart),
  '每宿都应有线度五行起度'
);
// 五组起度五行核对（星属木组、虚属金组）
const startWuxing = { 金: 0, 木: 1, 水: 2, 火: 3, 土: 4 };
const GROUP = {
  金: ['井', '鬼', '室', '参', '娄', '亢', '虚', '氐', '箕', '斗'],
  木: ['心', '星', '房'],
  水: ['张', '奎', '胃', '昴', '牛', '尾'],
  火: ['角', '壁', '毕', '柳'],
  土: ['翼', '轸', '觜', '危', '女'],
};
for (const [wx, names] of Object.entries(GROUP)) {
  check(
    names.every((n) => lineStart[n] === startWuxing[wx]),
    `${wx}组起度应为 ${wx}`
  );
}
const allStart = Object.values(GROUP).flat();
check(new Set(allStart).size === 28, '五组应覆盖 28 宿且不重复');
check(Object.keys(baSha).length === 8, `八煞应 8 卦，实为 ${Object.keys(baSha).length}`);
check(Object.keys(BRANCH_ANGLE).length === 12, '地支方位应 12 支');
check(
  Object.values(BRANCH_ANGLE).sort((a, b) => a - b).every((a, i) => a === i * 30),
  '十二地支应每 30° 连续'
);
const sanYuanDirs = [...sanYuanLong.天元.dirs, ...sanYuanLong.地元.dirs, ...sanYuanLong.人元.dirs];
check(new Set(sanYuanDirs).size === 24, '三元龙应覆盖 24 山');
check(
  ['sheng', 'wang', 'cai', 'xie', 'sha'].every((k) => shaJudgments[k] && shaJudgments[k].text),
  '五种砂断语应齐全'
);
check(baShaText.length > 0, '八煞提示文案不应为空');
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/data/shaData.js src/data/shaData.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/data/shaData.js src/data/shaData.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 消砂数据 —— 线度五行起度/八煞/三元龙/五种砂断语"
```

---

### Task 3: 消砂算法 `utils/sha.js`

**Files:**
- Create: `src/utils/sha.js`
- Create: `src/utils/sha.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Consumes: `mansions`（`../data/mansions.js`）、`mountains`（`../data/luopan.js`）、`mountainAt`（`./fengShui.js`）、`shaData`（`../data/shaData.js`）。
- Produces:
  - `mansionAtDetail(deg): { mansion, offset }`——角度 → 宿对象 + 宿内古度偏移。
  - `mansionShengAt(deg): string`、`lineWuxingAt(deg): string`。
  - `judgeSha(shanWx, shaWx): 'sheng'|'wang'|'cai'|'xie'|'sha'`。
  - `SHA_DIRECTIONS: { deg; name }[]`（8 卦方位）、`judgeAllSha(shanDeg): ShaRow[]`。
  - `baShaAt(shanDeg): { branch; angle } | null`、`fenFang(deg): number[]`。
- 新算法文件用相对导入，node 可直接 import 校验。

- [ ] **Step 1: 创建 `src/utils/sha.js`**

```js
// 消砂纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
// 赖公砂法：坐山线度五行为主（我），八方砂峰宿主五行为宾，五行生克断五种砂
import { mansions } from '../data/mansions.js';
import { mountains } from '../data/luopan.js';
import { mountainAt } from './fengShui.js';
import { LINE_CYCLE, lineStart, baSha, BRANCH_ANGLE, sanYuanLong, shaJudgments } from '../data/shaData.js';

const normalize = (a) => ((a % 360) + 360) % 360;

// 角度 → 所在宿 + 宿内古度偏移（古度 366 按比例归一 360）
export function mansionAtDetail(deg) {
  const total = mansions.reduce((s, m) => s + m.degree, 0);
  const scaled = (normalize(deg) / 360) * total;
  let acc = 0;
  for (const m of mansions) {
    if (scaled < acc + m.degree) {
      return { mansion: m, offset: scaled - acc };
    }
    acc += m.degree;
  }
  return { mansion: mansions[mansions.length - 1], offset: mansions[mansions.length - 1].degree };
}

// 角度 → 宿主五行（砂峰用）
export function mansionShengAt(deg) {
  return mansionAtDetail(deg).mansion.sheng;
}

// 角度 → 线度五行（坐山用）：宿内第 n 度 = LINE_CYCLE[(起度 + n - 1) % 5]
export function lineWuxingAt(deg) {
  const { mansion, offset } = mansionAtDetail(deg);
  const n = Math.min(mansion.degree, Math.floor(offset) + 1);
  return LINE_CYCLE[(lineStart[mansion.name] + n - 1) % 5];
}

// 坐山五行 vs 一方砂五行 → 五种砂 key
// SHENG[x]=y 表示 x生y；KE[x]=y 表示 x克y
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

export function judgeSha(shanWuxing, shaWuxing) {
  if (shanWuxing === shaWuxing) return 'wang'; // 宾同我 → 旺砂
  if (SHENG[shaWuxing] === shanWuxing) return 'sheng'; // 宾生我 → 生砂
  if (KE[shanWuxing] === shaWuxing) return 'cai'; // 我克宾 → 财砂
  if (SHENG[shanWuxing] === shaWuxing) return 'xie'; // 我生宾 → 泄砂
  return 'sha'; // 剩者：宾克我 → 煞砂
}

// 8 卦方位（坎艮震巽离坤兑乾，每 45°，0°=坎/北）
export const SHA_DIRECTIONS = [
  { deg: 0, name: '坎·北' },
  { deg: 45, name: '艮·东北' },
  { deg: 90, name: '震·东' },
  { deg: 135, name: '巽·东南' },
  { deg: 180, name: '离·南' },
  { deg: 225, name: '坤·西南' },
  { deg: 270, name: '兑·西' },
  { deg: 315, name: '乾·西北' },
];

// 八方砂：坐山 vs 8 方位砂，各断一次
// 注意：方位名用 dir（避免与 ...shaJudgments 的 name=砂名 冲突）
export function judgeAllSha(shanDeg) {
  const shanLine = lineWuxingAt(shanDeg);
  return SHA_DIRECTIONS.map(({ deg, name }) => {
    const shaWx = mansionShengAt(deg);
    const relation = judgeSha(shanLine, shaWx);
    return {
      deg,
      dir: name, // 方位名（坎·北）
      mansion: mansionAtDetail(deg).mansion.name,
      shaWx,
      relation,
      ...shaJudgments[relation], // name=砂名、level、text
    };
  });
}

// 坐山八煞曜：坐山卦 → 煞曜地支 → 方位角
export function baShaAt(shanDeg) {
  const m = mountains.find((x) => x.name === mountainAt(shanDeg));
  if (!m || !baSha[m.palace]) return null;
  const branch = baSha[m.palace];
  return { branch, angle: BRANCH_ANGLE[branch] };
}

// 方位 → 三元龙 → 应房
export function fenFang(deg) {
  const name = mountainAt(deg);
  for (const { dirs, fang } of Object.values(sanYuanLong)) {
    if (dirs.includes(name)) return fang;
  }
  return [];
}
```

- [ ] **Step 2: 创建 `src/utils/sha.d.ts`**

```ts
import type { Mansion } from '../data/mansions';

export interface MansionDetail {
  mansion: Mansion;
  offset: number;
}
export function mansionAtDetail(deg: number): MansionDetail;
export function mansionShengAt(deg: number): string;
export function lineWuxingAt(deg: number): string;
export function judgeSha(shanWuxing: string, shaWuxing: string): 'sheng' | 'wang' | 'cai' | 'xie' | 'sha';
export interface ShaDirection {
  deg: number;
  name: string;
}
export const SHA_DIRECTIONS: ShaDirection[];
export interface ShaRow {
  deg: number;
  dir: string; // 方位名（坎·北）
  mansion: string;
  shaWx: string;
  relation: string;
  name: string; // 砂名（生砂/旺砂/…）
  level: '吉' | '凶';
  text: string;
}
export function judgeAllSha(shanDeg: number): ShaRow[];
export function baShaAt(shanDeg: number): { branch: string; angle: number } | null;
export function fenFang(deg: number): number[];
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { mansionShengAt, lineWuxingAt, judgeSha, judgeAllSha, baShaAt, fenFang, mansionAtDetail } from '../src/utils/sha.js';
```

在 `if (failed)` 之前追加：

```js
// —— 消砂算法 ——
// 宿度边界按古度 366 比例归一至 360°：角0-11.8 亢11.8-20.7 …（verify 断言按归一后边界取角）
check(mansionAtDetail(0).mansion.name === '角', '0° 应在角宿');
check(mansionAtDetail(180).mansion.name === '奎', '180° 归一后应在奎宿（古度 168-186）');
check(mansionShengAt(0) === '木', '0°（角宿）宿主五行应为木');
check(mansionShengAt(45) === '火', '45° 归一后在心宿（40-45°），宿主五行应为火');
check(lineWuxingAt(0) === '火', '坐子（角宿第 1 度）线度五行应为火（角属火组起度火）');
check(judgeSha('木', '木') === 'wang', '同我 → 旺砂');
check(judgeSha('木', '水') === 'sheng', '水生木 → 生砂');
check(judgeSha('木', '土') === 'cai', '木克土 → 财砂');
check(judgeSha('木', '火') === 'xie', '木生火 → 泄砂');
check(judgeSha('木', '金') === 'sha', '金克木 → 煞砂');
const allSha = judgeAllSha(0);
check(allSha.length === 8, `八方砂应 8 条，实为 ${allSha.length}`);
check(allSha.every((s) => s.dir && s.name && s.text), '每条砂应含 方位/砂名/断语');
check(baShaAt(0) && baShaAt(0).branch === '辰', '坐坎八煞应为辰');
check(fenFang(0).length === 3, '子方应属天元龙（应 3 房）');
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/utils/sha.js src/utils/sha.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/utils/sha.js src/utils/sha.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 消砂算法 —— 宿定位/线度五行/生克断砂/八方/八煞/分房"
```

---

### Task 4: `FengShuiView.vue` 消砂判断区

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `judgeAllSha`/`lineWuxingAt`/`mansionShengAt`/`baShaAt`/`fenFang`/`mansionAtDetail`（`@/utils/sha`）、`mountains`（`@/data/luopan`）。
- 消砂模式（`luopanMode === 'xiao'`）判断区从 `fs-pending` 占位换成真判断区；`na`/`ze`/`gua` 仍显示占位。

- [ ] **Step 1: script 区 import 追加**

在 `<script setup>` import 区（`import { MODES } …` 旁）追加：

```js
import {
  judgeAllSha,
  lineWuxingAt,
  mansionShengAt,
  baShaAt,
  fenFang,
} from '@/utils/sha';
import { mountains } from '@/data/luopan';
```

- [ ] **Step 2: script 区消砂 computed 追加**

在 `const pendingText = computed(() => { … });` 之后追加：

```js
// —— 消砂判断 ——
const shanAngle = computed(() => {
  const m = mountains.find((x) => x.name === selectedDir.value);
  return m ? m.angle : 0;
});
// 坐山宿主五行 + 线度五行（读面板用）
const shanSheng = computed(() => mansionShengAt(shanAngle.value));
const shanLine = computed(() => lineWuxingAt(shanAngle.value));
// 八方砂：坐山线度五行为主，八方砂宿主五行为宾
const shaRows = computed(() =>
  judgeAllSha(shanAngle.value).map((s) => ({ ...s, fang: fenFang(s.deg) }))
);
// 坐山八煞
const baShaInfo = computed(() => baShaAt(shanAngle.value));
// 当前十字线所指方位（吸附 45°）
const currentDir = computed(() => (Math.round((readout.value?.angle ?? 0) / 45) * 45) % 360);
```

> 注：`readout.value?.angle` 为 Luopan 顶参考线读值；消砂交互沿用「十字线所指即坐山」（P1 交互不变），判断区以 `selectedDir` 为坐山。

- [ ] **Step 3: 模板 —— 消砂判断区**

将 `fs-pending` 占位（`<section v-else class="fs-pending">` 整块）替换为消砂判断区，`na`/`ze`/`gua` 仍显示占位：

```html
      <template v-else-if="luopanMode === 'xiao'">
        <section class="fs-sha">
          <h2>消砂判断</h2>
          <p class="sha-shan">
            坐山 {{ selectedDir }}（{{ shanSheng }}） · 线度五行 {{ shanLine }}
          </p>
          <p v-if="baShaInfo" class="sha-basha">
            ⚠ 八煞：{{ baShaInfo.branch }}方（{{ baShaInfo.angle }}°）逢砂须忌
          </p>
          <table class="sha-table">
            <thead>
              <tr>
                <th>方位</th>
                <th>砂宿·五行</th>
                <th>砂名</th>
                <th>吉凶</th>
                <th>应房</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in shaRows"
                :key="s.deg"
                :class="{ current: s.deg === currentDir }"
              >
                <td>{{ s.dir }}</td>
                <td>{{ s.mansion }}·{{ s.shaWx }}</td>
                <td>{{ s.name }}</td>
                <td class="lvl" :class="`lv-${s.level}`">{{ s.level }}</td>
                <td>{{ s.fang.join('/') }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="currentSha" class="sha-detail">
            {{ currentSha.dir }}·{{ currentSha.name }}：{{ currentSha.text }}
          </p>
          <p class="fs-disclaimer">赖公砂法 · 文化参考</p>
        </section>
      </template>

      <section v-else class="fs-pending">
        <h2>判断区</h2>
        <p class="pending-text">
          {{ pendingText }}
        </p>
      </section>
```

- [ ] **Step 4: script 区 `currentSha` computed**

在 `currentDir` computed 之后追加：

```js
const currentSha = computed(() => shaRows.value.find((s) => s.deg === currentDir.value));
```

- [ ] **Step 5: 样式补充**

在 `<style scoped>` 内追加（仿既有 `.fs-pending`/`.fs-reading` 风格）：

```css
.fs-sha {
  max-width: 560px;
  margin: 0 auto;
}
.fs-sha h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.sha-shan {
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 6px;
}
.sha-basha {
  font-size: 13px;
  color: var(--cinnabar);
  margin: 0 0 10px;
}
.sha-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--ink);
  margin: 0 0 10px;
}
.sha-table th,
.sha-table td {
  padding: 6px 8px;
  border-bottom: 1px dotted var(--gold-light);
  text-align: center;
}
.sha-table th {
  color: var(--ink-light);
  font-weight: normal;
  font-size: 12px;
  letter-spacing: 0.1em;
}
.sha-table tr.current {
  background: rgba(178, 58, 46, 0.08);
}
.sha-detail {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--scroll);
  margin: 0 0 10px;
}
```

- [ ] **Step 6: 格式化 + 构建**

Run: `npx prettier --write src/components/fengshui/FengShuiView.vue && pnpm build`
Expected: 构建成功。

- [ ] **Step 7: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 消砂模式判断区 —— 八方砂表 + 八煞提示（替换占位）"
```

---

### Task 5: 全量验证 + 走查

**Files:**
- Modify: 无（验证 + 走查）

- [ ] **Step 1: 数据与逻辑校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（含既有玄空 + 三盘 + 宿主五行 + 消砂数据 + 消砂算法断言）。

- [ ] **Step 2: 格式化检查 + 构建**

Run: `npx prettier --check src/data/mansions.js src/data/mansions.d.ts src/data/shaData.js src/data/shaData.d.ts src/utils/sha.js src/utils/sha.d.ts src/components/fengshui/FengShuiView.vue scripts/verify-fengshui.mjs && pnpm build`
Expected: 全过、构建成功。

- [ ] **Step 3: UI 走查清单（`pnpm dev`）**

1. 风水页切「消砂」模式：盘面 = 后天八卦 + 人盘中针 + 二十八宿 + 度数（P1 已定圈集）；判断区显示 坐山五行/线度五行 + 八煞提示 + 八方砂表 8 行。
2. 切换坐山（点按人盘 24 山或拖拽吸附）：八方砂表、八煞提示、坐山五行随之联动。
3. 十字线所指方位所在行高亮；拖拽时高亮行实时切换。
4. 当前坐山行断语详情（`sha-detail`）正常显示。
5. 切「定向/纳水/择日/易卦」模式：消砂判断区隐藏、各自内容（定向飞星/其余占位）正常。
6. 移动端 ≤600px 判断区表格不破版、可滚动。
7. 浏览器 console 无报错。

- [ ] **Step 4: 确认工作区状态**

Run: `git status --short`
Expected: 无未提交改动。

## 自审记录（写作时内联完成）

- **Spec 覆盖**：宿主五行（Task 1）、线度五行/八煞/三元龙/断语数据（Task 2）、消砂算法（Task 3）、判断区 UI（Task 4）、验证走查（Task 5）——设计文档「实施步骤」1-5 全对应。
- **占位符扫描**：无 TBD/TODO；所有代码步骤含实际代码。
- **类型一致性**：`mansionAtDetail`/`mansionShengAt`/`lineWuxingAt`/`judgeSha`/`judgeAllSha`/`baShaAt`/`fenFang` 签名在 Task 3/4 一致；`ShaRow` 的 `dir`/`name`/`level`/`text`/`fang` 字段 Task 3 定义、Task 4 消费一致；`LINE_CYCLE`/`lineStart`/`baSha`/`BRANCH_ANGLE`/`sanYuanLong`/`shaJudgments` 命名 Task 2/3 一致。
