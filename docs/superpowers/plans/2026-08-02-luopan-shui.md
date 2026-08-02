# 罗盘纳水（P3b）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「纳水」模式判断区从占位变真断语：坐山定局（三合双山五行）+ 十二长生 + 阳顺阴逆 + 来水/去水双读数判断。

**Architecture:** 数据层新增 `shuiData.js`（双山五行/四局长生位/十二长生/吉凶断语）+ 算法层新增 `shui.js` 纯函数（双山定位/定局/长生顺逆/判断）+ UI 在 `FengShuiView.vue` 纳水模式替换 `fs-pending` 占位为真判断区（水流方向切换 + 来水/去水锁定 + 断语 + 总评）。

**Tech Stack:** Vue 3 `<script setup lang="ts">`、纯 CSS、`@/` 路径别名、`pnpm`、node 校验脚本（无测试框架）。

## Global Constraints

- **无测试框架**（Vitest 未配置）。逻辑 TDD 用 node 脚本 `scripts/verify-fengshui.mjs` 承载断言；组件验证用 `pnpm build` + `npx prettier --check <涉及文件>`。
- **eslint 仓库级损坏（既存基建问题）**：本计划一律用 `npx prettier` 替代 `npx eslint`。
- **格式化**：仓库 `.prettierrc` 为 `semi: true`。写完 `npx prettier --write <涉及文件>`（仅格式），验证 `npx prettier --check <涉及文件>`，不要对全仓 `--check .`。
- 界面文案一律中文；代码注释用中文。
- JS 实现 + 兄弟 `.d.ts` 类型声明。
- **新数据/工具用相对导入**（`../data/…`、`./luopanRead.js`）而非 `@/`，保证 node 脚本可直接 import 校验。组件可用 `@/`。
- 不新增任何依赖。
- 不改动 `fengShui.js`、`flyingStars.js`、`useCompassSensor.js`、`luopanRead.js`、`sha.js`、`shaData.js` 等既有文件（本次需求不涉及）。复用 `luopanRead.js` 的 `itemAt` 只 import 不改动。
- 双山五行用**三合五行**口径（与局一一对应：水局=水、火局=火、金局=金、木局=木）。

---

### Task 1: 纳水数据 `shuiData.js`

**Files:**
- Create: `src/data/shuiData.js`
- Create: `src/data/shuiData.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Produces:
  - `shuangshan: { name; wuxing; angle }[]`（12 双山，中心角 = 地支宫中心 0/30/60…330，五行 = 三合五行）。
  - `JUS: { name; sanhe; changsheng; diwang; muku }[]`（四局）。
  - `CHANGSHENG_ORDER: string[]`（12 位序）。
  - `CHANGSHENG_JUDGE: Record<位, { lai; qu; text }>`（吉凶断语，文化参考）。
- 供 Task 2 的 `shui.js` 消费。

- [ ] **Step 1: 创建 `src/data/shuiData.js`**

```js
// 纳水数据：双山五行（三合口径）+ 四大局长生位 + 十二长生 + 吉凶断语（文化参考）
// 双山 = 天盘 24 山并 12 组；中心角 = 地支宫中心（子0° 丑30° 寅60°…每 30°，壬子=0°）

// 12 双山（中心角每 30°；五行 = 三合五行，与四局一一对应）
export const shuangshan = [
  { name: '壬子', wuxing: '水', angle: 0 },
  { name: '癸丑', wuxing: '金', angle: 30 },
  { name: '艮寅', wuxing: '火', angle: 60 },
  { name: '甲卯', wuxing: '木', angle: 90 },
  { name: '乙辰', wuxing: '水', angle: 120 },
  { name: '巽巳', wuxing: '金', angle: 150 },
  { name: '丙午', wuxing: '火', angle: 180 },
  { name: '丁未', wuxing: '木', angle: 210 },
  { name: '坤申', wuxing: '水', angle: 240 },
  { name: '庚酉', wuxing: '金', angle: 270 },
  { name: '辛戌', wuxing: '火', angle: 300 },
  { name: '乾亥', wuxing: '木', angle: 330 },
];

// 四大局（三合五行即局名；长生/帝旺/墓库 = 双山名）
export const JUS = [
  { name: '木', sanhe: '亥卯未', changsheng: '乾亥', diwang: '甲卯', muku: '丁未' },
  { name: '火', sanhe: '寅午戌', changsheng: '艮寅', diwang: '丙午', muku: '辛戌' },
  { name: '水', sanhe: '申子辰', changsheng: '坤申', diwang: '壬子', muku: '乙辰' },
  { name: '金', sanhe: '巳酉丑', changsheng: '巽巳', diwang: '庚酉', muku: '癸丑' },
];

// 十二长生序（顺布/逆布均按此序取位名）
export const CHANGSHENG_ORDER = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养',
];

// 吉凶断语（lai = 来水档位，qu = 去水档位：吉/凶/慎）
export const CHANGSHENG_JUDGE = {
  长生: { lai: '吉', qu: '忌', text: '来水主文人功名、人丁兴旺；去水破生旺忌。' },
  沐浴: { lai: '慎', qu: '慎', text: '沐浴桃花，来去皆宜慎。' },
  冠带: { lai: '吉', qu: '忌', text: '来水出聪明人；去水不利儿童。' },
  临官: { lai: '吉', qu: '忌', text: '来水少年得志、主发财；去水凶。' },
  帝旺: { lai: '吉', qu: '忌', text: '来水出富贵之人；去水破旺冲生忌。' },
  衰: { lai: '吉', qu: '吉', text: '衰位水来去皆吉，最宜弯曲有情。' },
  病: { lai: '凶', qu: '吉', text: '来水防病；去水纳福。' },
  死: { lai: '凶', qu: '吉', text: '来水有祸；去水纳福。' },
  墓: { lai: '凶', qu: '吉', text: '来水不宜；去水半吉，墓库为水口。' },
  绝: { lai: '凶', qu: '吉', text: '忌来水；去水吉。' },
  胎: { lai: '慎', qu: '吉', text: '来水无儿；去水可生财。' },
  养: { lai: '吉', qu: '忌', text: '来水主初年发财；去水凶。' },
};
```

- [ ] **Step 2: 创建 `src/data/shuiData.d.ts`**

```ts
export interface Shuangshan {
  name: string;
  wuxing: string;
  angle: number;
}
export const shuangshan: Shuangshan[];
export interface Ju {
  name: string;
  sanhe: string;
  changsheng: string;
  diwang: string;
  muku: string;
}
export const JUS: Ju[];
export const CHANGSHENG_ORDER: string[];
export interface ChangshengJudge {
  lai: '吉' | '凶' | '慎';
  qu: '吉' | '凶' | '慎';
  text: string;
}
export const CHANGSHENG_JUDGE: Record<string, ChangshengJudge>;
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { shuangshan, JUS, CHANGSHENG_ORDER, CHANGSHENG_JUDGE } from '../src/data/shuiData.js';
```

在 `if (failed)` 之前追加：

```js
// —— 纳水数据 ——
check(shuangshan.length === 12, `双山应 12 组，实为 ${shuangshan.length}`);
check(
  shuangshan.every((s, i) => s.angle === i * 30),
  '双山中心角应每 30° 连续'
);
// 三合五行 → 局归属：水局=坤申壬子乙辰、火局=艮寅丙午辛戌、金局=巽巳庚酉癸丑、木局=乾亥甲卯丁未
const JU_GROUP = {
  水: ['坤申', '壬子', '乙辰'],
  火: ['艮寅', '丙午', '辛戌'],
  金: ['巽巳', '庚酉', '癸丑'],
  木: ['乾亥', '甲卯', '丁未'],
};
for (const [ju, names] of Object.entries(JU_GROUP)) {
  check(
    names.every((n) => shuangshan.find((s) => s.name === n)?.wuxing === ju),
    `${ju}局双山五行应全部为 ${ju}`
  );
}
const allShuangshan = Object.values(JU_GROUP).flat();
check(new Set(allShuangshan).size === 12, '四局应覆盖 12 双山且不重复');
check(JUS.length === 4, `应 4 局，实为 ${JUS.length}`);
const JU_ANCHOR = {
  木: { changsheng: '乾亥', diwang: '甲卯', muku: '丁未' },
  火: { changsheng: '艮寅', diwang: '丙午', muku: '辛戌' },
  水: { changsheng: '坤申', diwang: '壬子', muku: '乙辰' },
  金: { changsheng: '巽巳', diwang: '庚酉', muku: '癸丑' },
};
check(
  JUS.every((j) => {
    const a = JU_ANCHOR[j.name];
    return a && j.changsheng === a.changsheng && j.diwang === a.diwang && j.muku === a.muku;
  }),
  '四局长生/帝旺/墓库应与权威表一致'
);
check(
  CHANGSHENG_ORDER.length === 12 &&
    CHANGSHENG_ORDER[0] === '长生' &&
    CHANGSHENG_ORDER[11] === '养',
  '十二长生序应 12 位（长生起养止）'
);
check(
  CHANGSHENG_ORDER.every((p) => CHANGSHENG_JUDGE[p]),
  '十二长生每位都应有吉凶断语'
);
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（既有 + 消砂 + 纳水数据断言）。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/data/shuiData.js src/data/shuiData.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/data/shuiData.js src/data/shuiData.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 纳水数据 —— 双山五行/四局长生位/十二长生/吉凶断语"
```

---

### Task 2: 纳水算法 `utils/shui.js`

**Files:**
- Create: `src/utils/shui.js`
- Create: `src/utils/shui.d.ts`
- Modify: `scripts/verify-fengshui.mjs`

**Interfaces:**
- Consumes: `shuangshan`/`JUS`/`CHANGSHENG_ORDER`/`CHANGSHENG_JUDGE`（`../data/shuiData.js`）、`mountains`（`../data/luopan.js`）、`itemAt`（`./luopanRead.js`）。
- Produces:
  - `shuangshanAt(deg): string`（角度 → 双山名）。
  - `judgeJu(shanDeg): { ju; changshengName }`（坐山定局）。
  - `changshengMap(ju, flow): Record<string, string>`（双山名 → 十二长生位）。
  - `positionAt(map, deg): string | null`。
  - `judgeShui(shanDeg, inDeg, outDeg, flow): object`。
- 供 Task 3 的 `FengShuiView.vue` 消费。

- [ ] **Step 1: 创建 `src/utils/shui.js`**

```js
// 纳水纯逻辑（不触碰 DOM，node 脚本可直接 import 校验）
// 三合水法：坐山定局 → 十二长生阳顺阴逆 → 来水/去水吉凶判断
import { itemAt } from './luopanRead.js';
import { shuangshan, JUS, CHANGSHENG_ORDER, CHANGSHENG_JUDGE } from '../data/shuiData.js';

// 角度 → 双山（按双山中心角循环距离取最近）
// 注：双山 = 地支宫（30° 一宫），天盘缝针 +7.5° 与地盘在此口径下落在同一宫，定局结果一致，
// 故直接用「角度 → 地支宫中心」判定，不依赖天/地盘偏移。坐山取地盘角，来水/去水取十字线角度。
export function shuangshanAt(deg) {
  return itemAt(deg, shuangshan).name;
}

// 坐山 → 双山 → 五行 → 定局（双山五行即局名：水/金/火/木）
export function judgeJu(shanDeg) {
  const ss = shuangshan.find((s) => s.name === shuangshanAt(shanDeg));
  const ju = JUS.find((j) => j.name === ss.wuxing);
  return { ju: ss.wuxing, changshengName: ju.changsheng };
}

// 局 + 顺逆 → 双山名 → 十二长生位 map
// flow: 'left'（左水倒右，阳局顺排）| 'right'（右水倒左，阴局逆排）
// 顺排 = 从长生位沿地支宫 +30° 递增；逆排 = −30° 递减
export function changshengMap(ju, flow) {
  const juInfo = JUS.find((j) => j.name === ju);
  const startAngle = shuangshan.find((s) => s.name === juInfo.changsheng).angle;
  const map = {};
  CHANGSHENG_ORDER.forEach((pos, k) => {
    const angle = (startAngle + (flow === 'left' ? k : -k) * 30 + 360) % 360;
    map[shuangshan.find((s) => s.angle === angle).name] = pos;
  });
  return map;
}

// 角度 → 十二长生位（按双山 map）
export function positionAt(map, deg) {
  const name = shuangshanAt(deg);
  return map[name] || null;
}

// 纳水判断：定局 → 来水/去水长生位 → 各自吉凶 + 总评
// flow: 'left' | 'right'
export function judgeShui(shanDeg, inDeg, outDeg, flow) {
  const { ju, changshengName } = judgeJu(shanDeg);
  const map = changshengMap(ju, flow);
  const inPos = positionAt(map, inDeg);
  const outPos = positionAt(map, outDeg);
  const inInfo = inPos ? CHANGSHENG_JUDGE[inPos] : null;
  const outInfo = outPos ? CHANGSHENG_JUDGE[outPos] : null;
  const goodLai = ['长生', '冠带', '临官', '帝旺'].includes(inPos);
  const goodQu = ['衰', '病', '死', '墓'].includes(outPos);
  const summary = goodLai && goodQu
    ? '迎生接旺，水归墓库，来去皆吉。'
    : goodLai
      ? '来水合局吉，去水方位欠佳，宜择吉口。'
      : goodQu
        ? '去水合局吉，来水方位欠佳，宜收生旺。'
        : '来去水方位均欠合局，宜谨慎。';
  return {
    ju,
    changshengName,
    inDeg: Math.round(inDeg) % 360,
    outDeg: Math.round(outDeg) % 360,
    inPos,
    outPos,
    inLai: inInfo ? inInfo.lai : null,
    inText: inInfo ? inInfo.text : '',
    outQu: outInfo ? outInfo.qu : null,
    outText: outInfo ? outInfo.text : '',
    summary,
  };
}
```

- [ ] **Step 2: 创建 `src/utils/shui.d.ts`**

```ts
export function shuangshanAt(deg: number): string;
export function judgeJu(shanDeg: number): { ju: string; changshengName: string };
export function changshengMap(ju: string, flow: 'left' | 'right'): Record<string, string>;
export function positionAt(map: Record<string, string>, deg: number): string | null;
export interface ShuiResult {
  ju: string;
  changshengName: string;
  inDeg: number;
  outDeg: number;
  inPos: string | null;
  outPos: string | null;
  inLai: '吉' | '凶' | '慎' | null;
  inText: string;
  outQu: '吉' | '凶' | '慎' | null;
  outText: string;
  summary: string;
}
export function judgeShui(
  shanDeg: number,
  inDeg: number,
  outDeg: number,
  flow: 'left' | 'right'
): ShuiResult;
```

- [ ] **Step 3: verify 追加断言**

在 `scripts/verify-fengshui.mjs` 顶部 import 追加：

```js
import { shuangshanAt, judgeJu, changshengMap, positionAt, judgeShui } from '../src/utils/shui.js';
```

在 `if (failed)` 之前追加：

```js
// —— 纳水算法 ——
check(shuangshanAt(0) === '壬子', '0° 应在壬子双山');
check(shuangshanAt(240) === '坤申', '240° 应在坤申双山');
check(judgeJu(0).ju === '水', '坐壬子应定水局');
check(judgeJu(0).changshengName === '坤申', '水局长生应为坤申');
// 水局顺排（左水倒右）：长生坤申 帝旺壬子 墓库乙辰
const leftMap = changshengMap('水', 'left');
check(leftMap['坤申'] === '长生', '水局左倒右坤申应为长生');
check(leftMap['壬子'] === '帝旺', '水局左倒右壬子应为帝旺');
check(leftMap['乙辰'] === '墓', '水局左倒右乙辰应为墓');
// 水局逆排（右水倒左）：长生坤申 逆布，沐浴在丁未
const rightMap = changshengMap('水', 'right');
check(rightMap['坤申'] === '长生', '水局右倒左坤申仍为长生');
check(rightMap['丁未'] === '沐浴', '水局右倒左丁未应为沐浴（逆布）');
check(leftMap['丁未'] !== rightMap['丁未'], '阳顺阴逆排布应有差异');
check(positionAt(leftMap, 240) === '长生', '240° 水局顺排应为长生');
// 完整用例：坐壬子水局 左倒右 来水坤申(长生吉) 去水乙辰(墓库吉)
const r = judgeShui(0, 240, 120, 'left');
check(r.ju === '水' && r.inPos === '长生' && r.outPos === '墓', '坐壬子来坤申去乙辰 应为 长生/墓');
check(r.inLai === '吉' && r.outQu === '吉', '长生来水吉 墓库去水吉');
check(r.summary.includes('迎生接旺'), '总评应含迎生接旺');
```

- [ ] **Step 4: 运行校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS。

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/utils/shui.js src/utils/shui.d.ts scripts/verify-fengshui.mjs && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/utils/shui.js src/utils/shui.d.ts scripts/verify-fengshui.mjs
git commit -m "feat: 纳水算法 —— 双山定位/坐山定局/十二长生顺逆/来去水判断"
```

---

### Task 3: `FengShuiView.vue` 纳水判断区

**Files:**
- Modify: `src/components/fengshui/FengShuiView.vue`

**Interfaces:**
- Consumes: `judgeJu`/`judgeShui`（`@/utils/shui`）、既有 `readout` ref、`mountains`。
- 纳水模式（`luopanMode === 'na'`）判断区从 `fs-pending` 占位换成真判断区；`ze`/`gua` 仍显示占位。

- [ ] **Step 1: script 区 import 追加**

在 `<script setup>` import 区（`import { mountains } …` 或 `import { MODES } …` 旁）追加：

```js
import { judgeJu, judgeShui } from '@/utils/shui';
```

- [ ] **Step 2: script 区纳水状态 + computed 追加**

在消砂 computed（`currentSha` 之后）追加：

```js
// —— 纳水判断 ——
const flow = ref('left'); // 'left' 左水倒右 | 'right' 右水倒左
const inAngle = ref(null); // 锁定来水角度
const outAngle = ref(null); // 锁定去水角度
const shuiJu = computed(() => judgeJu(shanAngle.value));
const shuiInfo = computed(() =>
  inAngle.value !== null && outAngle.value !== null
    ? judgeShui(shanAngle.value, inAngle.value, outAngle.value, flow.value)
    : null
);
```

- [ ] **Step 3: 模板 —— 纳水判断区**

将 `fs-pending` 占位前的消砂 `</template>` 之后、`fs-pending` 之前，插入纳水分支（在 `<template v-else-if="luopanMode === 'xiao'">…</template>` 与 `<section v-else class="fs-pending">` 之间）：

```html
      <template v-else-if="luopanMode === 'na'">
        <section class="fs-shui">
          <h2>纳水判断</h2>
          <p class="shui-shan">
            坐山 {{ selectedDir }} → {{ shuiJu.ju }}局（长生
            {{ shuiJu.changshengName }}）
          </p>
          <div class="flow-switch" role="group" aria-label="水流方向">
            <button
              type="button"
              :class="{ active: flow === 'left' }"
              @click="flow = 'left'"
            >
              左水倒右
            </button>
            <button
              type="button"
              :class="{ active: flow === 'right' }"
              @click="flow = 'right'"
            >
              右水倒左
            </button>
          </div>
          <div class="shui-lock">
            <button type="button" @click="inAngle = readout?.angle ?? null">
              锁定来水
            </button>
            <button type="button" @click="outAngle = readout?.angle ?? null">
              锁定去水
            </button>
            <span v-if="inAngle !== null" class="shui-locked">来水 {{ inAngle }}°</span>
            <span v-if="outAngle !== null" class="shui-locked">去水 {{ outAngle }}°</span>
          </div>
          <template v-if="shuiInfo">
            <p class="shui-pos">
              来水 <b>{{ shuiInfo.inPos }}</b
              >（{{ shuiInfo.inLai }}）· {{ shuiInfo.inText }}
            </p>
            <p class="shui-pos">
              去水 <b>{{ shuiInfo.outPos }}</b
              >（{{ shuiInfo.outQu }}）· {{ shuiInfo.outText }}
            </p>
            <p class="shui-summary">{{ shuiInfo.summary }}</p>
          </template>
          <p v-else class="shui-hint">请先锁定来水与去水方位</p>
          <p class="fs-disclaimer">三合水法 · 文化参考</p>
        </section>
      </template>
```

> 说明：`readout?.angle` 来自 Luopan `@readout` emit（P1 已实现），用户先转盘对准来水→点「锁定来水」存角，再转盘对准去水→点「锁定去水」。`inAngle`/`outAngle` 存的是 FengShuiView 的 ref。

- [ ] **Step 4: 样式补充**

在 `<style scoped>` 内追加（仿消砂判断区风格）：

```css
.fs-shui {
  max-width: 560px;
  margin: 0 auto;
}
.fs-shui h2 {
  font-size: 16px;
  color: var(--ink);
  border-bottom: 1px dashed var(--gold);
  padding-bottom: 6px;
  letter-spacing: 0.12em;
  margin: 20px 0 10px;
}
.shui-shan {
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 10px;
}
.flow-switch,
.shui-lock {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 auto 10px;
}
.flow-switch button,
.shui-lock button {
  padding: 7px 14px;
  font-size: 13px;
  color: var(--ink);
  background: var(--scroll);
  border: 1px solid var(--gold);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.flow-switch button.active {
  background: var(--cinnabar);
  color: #faf3e8;
}
.shui-locked {
  font-size: 13px;
  color: var(--cinnabar);
  align-self: center;
}
.shui-pos {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0 0 6px;
}
.shui-pos b {
  color: var(--cinnabar);
}
.shui-summary {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink);
  border: 1px solid var(--gold-light);
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--scroll);
  margin: 0 0 10px;
}
.shui-hint {
  font-size: 13px;
  color: var(--ink-light);
  margin: 0 0 10px;
}
```

- [ ] **Step 5: 格式化 + 构建**

Run: `npx prettier --write src/components/fengshui/FengShuiView.vue && pnpm build`
Expected: 构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/components/fengshui/FengShuiView.vue
git commit -m "feat: 纳水模式判断区 —— 定局/水流方向/来去水双锁定 + 断语 + 总评（替换占位）"
```

---

### Task 4: 全量验证 + 走查

**Files:**
- Modify: 无（验证 + 走查）

- [ ] **Step 1: 数据与逻辑校验**

Run: `node scripts/verify-fengshui.mjs`
Expected: PASS（含既有玄空 + 消砂 + 纳水数据 + 纳水算法断言）。

- [ ] **Step 2: 格式化检查 + 构建**

Run: `npx prettier --check src/data/shuiData.js src/data/shuiData.d.ts src/utils/shui.js src/utils/shui.d.ts src/components/fengshui/FengShuiView.vue scripts/verify-fengshui.mjs && pnpm build`
Expected: 全过、构建成功。

- [ ] **Step 3: UI 走查清单（`pnpm dev`）**

1. 风水页切「纳水」模式：盘面 = 后天八卦 + 天盘缝针 + 度数（P1 已定圈集）；判断区显示 坐山→局→长生 + 水流方向切换 + 锁定按钮 + 来去水断语。
2. 锁定交互：转盘对准某角 → 点「锁定来水」→ 显示来水 N°；再转盘对准 → 点「锁定去水」→ 来去水断语实时出现。
3. 切换水流方向（左倒右/右倒左）：来去水长生位随之顺/逆变化，断语联动。
4. 切换坐山（点按天盘 24 山或拖拽吸附）：定局/长生/断语联动。
5. 未锁定时显示「请先锁定来水与去水方位」占位提示；已锁定一个显示对应已锁角。
6. 切「定向/消砂/择日/易卦」模式：纳水判断区隐藏、各自内容正常（回归）。
7. 移动端 ≤600px 判断区不破版、按钮可点。
8. 浏览器 console 无报错。

- [ ] **Step 4: 确认工作区状态**

Run: `git status --short`
Expected: 无未提交改动。

## 自审记录（写作时内联完成）

- **Spec 覆盖**：双山五行/四局长生位/十二长生/断语数据（Task 1）、纳水算法（Task 2）、判断区 UI（Task 3）、验证走查（Task 4）——设计文档「实施步骤」1-4 全对应。
- **占位符扫描**：无 TBD/TODO；所有代码步骤含实际代码。
- **类型一致性**：`shuangshanAt`/`judgeJu`/`changshengMap`/`positionAt`/`judgeShui` 签名 Task 2 定义、Task 3 消费一致；`ShuiResult` 的 `ju`/`changshengName`/`inPos`/`outPos`/`inLai`/`inText`/`outQu`/`outText`/`summary` 字段 Task 2 定义、Task 3 消费一致；`shuangshan`/`JUS`/`CHANGSHENG_ORDER`/`CHANGSHENG_JUDGE` 命名 Task 1/2 一致。
- **口径说明**：双山五行用三合五行（水局=水…）；双山中心角 = 地支宫中心（0/30/60…）；坐山/来水/去水均按「角度→地支宫」判定，不依赖天盘 +7.5° 偏移（同一宫内定局结果一致）。
