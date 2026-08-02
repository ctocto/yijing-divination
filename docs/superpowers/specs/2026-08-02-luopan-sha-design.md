# 罗盘消砂（P3a）设计文档

日期：2026-08-02
状态：已与用户头脑风暴收敛并批准（用户选定「做全」：八方砂 + 线度五行 + 八煞 + 分房）

## 背景与目标

P1 多圈罗盘已合入 main：五模式圈集、十字线读盘、读数面板、判断区占位。「消砂」模式占位文案为「消砂判断 · P3 上线（人盘中针 + 二十八宿 · 赖公砂法）」。本文档实现 **P3a 消砂全**：把消砂判断区从占位变真断语。

用户对算法口径不熟悉，明确授权**参考最流行的实现**。经查证，采用主流天星/三合消砂口径（《罗经解定》通行版）。

整体分解为 P3a（消砂，本文档）/ P3b（纳水，另行设计文档）。

## 算法口径（已查证，主流版）

### 宿主五行（宿主五行 = 每宿一个固定五行）

宿主五行 = 木金土火火火水 循环（四象每象 7 宿，木金土 然后 日月火火水）。现有 `mansions.wuxing` 存的是**七曜**（木金土日月火水），宿主五行即把 **日/月 → 火**：

| 象 | 宿（宿主五行） |
|---|---|
| 东方青龙 | 角木 亢金 氐土 房火 心火 尾火 箕水 |
| 北方玄武 | 斗木 牛金 女土 虚火 危火 室火 壁水 |
| 西方白虎 | 奎木 娄金 胃土 昴火 毕火 觜火 参水 |
| 南方朱雀 | 井木 鬼金 柳土 星火 张火 翼火 轸水 |

（宿主五行口诀：角奎井斗原属木，轸壁箕参是水神；氐女胃柳土之位，亢牛鬼娄是金神；翼室觜尾火最旺，房虚昴星君火、张心危毕相火。）

### 线度五行（坐山精确到宿内度数）

每宿第 1 度起某五行，逐度按 **金→木→水→火→土** 循环。主流歌诀分组（28 宿全覆盖）：

| 组（起度） | 宿 | 推演示例 |
|---|---|---|
| **金** | 井·鬼·室·参·娄·亢·**虚**·氐·箕·斗（10） | 1金 2木 3水 4火 5土 6金… |
| **木** | 心·**星**·房（3） | 1木 2水 3火 4土 5金… |
| **水** | 张·奎·胃·昴·牛·尾（6） | 1水 2火 3土 4金 5木… |
| **火** | 角·壁·毕·柳（4） | 1火 2土 3金 4木 5水… |
| **土** | 翼·轸·觜·危·女（5） | 1土 2金 3木 4水 5火… |

> 说明：早期版本金组含「星」（"井鬼室参娄亢星"），主流传本为「虚」（"井鬼室参娄亢虚，氐箕斗宿是金逢"），**星属木组**。采用主流传本，verify 断言钉住。
>
> 线度五行**可计算**：仅需存 28 宿每宿的起度五行索引（金木水火土 = 0..4），宿内第 n 度五行 = `cycle[(start + n - 1) % 5]`。不硬编码 366 度。

### 消砂判断（《罗经解定》通行口径）

- **我（主）** = 坐山所在宿的**线度五行**（精确到宿内度；亦展示宿主五行供参考）。
- **宾（客）** = 各方位砂峰所在宿的**宿主五行**。
- 五行生克断五种砂：

| 关系 | 砂名 | 吉凶 | 断语方向 |
|---|---|---|---|
| 宾生我 | 生砂 | 吉 | 福寿双全、财源大发、催官科甲 |
| 宾同我 | 旺砂 | 吉 | 丁财两旺、文章出众、贵人相助 |
| 我克宾 | 财砂 | 吉 | 丁财两旺、劳碌生财、爵禄进益 |
| 我生宾 | 泄砂 | 凶 | 损丁短寿、破财生病、家业渐衰 |
| 宾克我 | 煞砂 | 凶 | 丁财两败、血光牢狱、颠沛流离 |

### 八煞（坐山八煞曜）

八煞歌：坎龙坤兔震山猴，艮虎离猪兑蛇头，巽鸡乾马为煞曜，宅墓逢之一齐休。

| 坐山卦 | 煞曜（地支方） | 属卦方 |
|---|---|---|
| 坎（子） | 辰 | 巽 |
| 坤（未申） | 卯 | 震 |
| 震（卯） | 申 | 坤 |
| 艮（丑寅） | 寅 | 艮 |
| 离（午） | 亥 | 乾 |
| 兑（酉） | 巳 | 巽 |
| 巽（辰巳） | 酉 | 兑 |
| 乾（戌亥） | 午 | 离 |

煞曜方位若逢砂（或水，P3b）即凶。

### 分房（三元龙应房）

- 天元龙（子午卯酉·乾坤艮巽）→ 应 1/4/7 房。
- 地元龙（甲庚丙壬·辰戌丑未）→ 应 2/5/8 房。
- 人元龙（寅申巳亥·乙辛丁癸）→ 应 3/6/9 房。

八方砂每方位按该方位所落山的三元龙标应房。

## 数据设计

### `src/data/mansions.js`（扩展，不动既有字段）

每宿增 `sheng`（宿主五行）字段，= 既有 `wuxing` 中 日/月 → 火：

```js
export const mansions = [
  { name: '角', xiang: '东方青龙', wuxing: '木', degree: 12, sheng: '木' },
  { name: '亢', xiang: '东方青龙', wuxing: '金', degree: 9,  sheng: '金' },
  { name: '氐', xiang: '东方青龙', wuxing: '土', degree: 15, sheng: '土' },
  { name: '房', xiang: '东方青龙', wuxing: '日', degree: 5,  sheng: '火' },
  { name: '心', xiang: '东方青龙', wuxing: '月', degree: 5,  sheng: '火' },
  // … 其余同理（wuxing 日/月 → sheng 火）
];
```

`mansions.d.ts` 的 `Mansion` 增 `sheng: string`。

### `src/data/shaData.js`（新增）

线度五行起度、八煞表、三元龙分房表、断语（文化参考，仿 `flyingStars.js` 风格）：

```js
// —— 线度五行：每宿起度五行索引（金木水火土 = 0..4），逐度按 cycle 循环 ——
export const LINE_CYCLE = ['金', '木', '水', '火', '土'];
export const lineStart = {
  井: 0, 鬼: 0, 室: 0, 参: 0, 娄: 0, 亢: 0, 虚: 0, 氐: 0, 箕: 0, 斗: 0, // 金组
  心: 1, 星: 1, 房: 1,                                                   // 木组
  张: 2, 奎: 2, 胃: 2, 昴: 2, 牛: 2, 尾: 2,                               // 水组
  角: 3, 壁: 3, 毕: 3, 柳: 3,                                             // 火组
  翼: 4, 轸: 4, 觜: 4, 危: 4, 女: 4,                                     // 土组
};

// —— 坐山八煞曜：坐山卦 → 煞曜地支（方位）——
export const baSha = {
  坎: '辰', 坤: '卯', 震: '申', 艮: '寅', 离: '亥', 兑: '巳', 巽: '酉', 乾: '午',
};

// —— 三元龙应房：卦 → 应房序 ——
export const sanYuanLong = {
  天元: { dirs: '子午卯酉乾坤艮巽', fang: [1, 4, 7] },
  地元: { dirs: '甲庚丙壬辰戌丑未', fang: [2, 5, 8] },
  人元: { dirs: '寅申巳亥乙辛丁癸', fang: [3, 6, 9] },
};

// —— 十二地支方位角（0°=子/北，顺时针每 30°）—— 八煞煞曜为地支，换算方位角用
export const BRANCH_ANGLE = {
  子: 0, 丑: 30, 寅: 60, 卯: 90, 辰: 120, 巳: 150,
  午: 180, 未: 210, 申: 240, 酉: 270, 戌: 300, 亥: 330,
};

// —— 五种砂断语 ——
export const shaJudgments = {
  sheng: { name: '生砂', level: '吉', text: '宾生我，福寿双全、财源大发，主催官科甲、人丁聪明。' },
  wang: { name: '旺砂', level: '吉', text: '宾我比和，丁财两旺、贵人相助，主文章出众、家业兴隆。' },
  cai: { name: '财砂', level: '吉', text: '我克宾为财，劳碌生财、爵禄进益，主救贫致富。' },
  xie: { name: '泄砂', level: '凶', text: '我生宾为泄，损丁短寿、破财生病，主家业渐衰、徒有虚名。' },
  sha: { name: '煞砂', level: '凶', text: '宾克我为煞，丁财两败、血光灾病，主颠沛流离、须化解。' },
};

// —— 八煞断语 ——
export const baShaText = '煞曜方逢砂为凶，主血光灾病、宅墓不宜，宜以化解。';
```

`shaData.d.ts` 对应类型。

### 数据换算

- 二十八宿古度 366 → 盘面 360 归一（沿用 P1 `mansionAt`）：`scaled = (deg/360) * 366`。
- 宿内度数：`mansionAtDetail` 定位宿后，`offset = scaled - 该宿起始 scaled`（宿内 0..degree 的古度偏移）；宿内第 n 度 = `Math.min(mansion.degree, Math.floor(offset) + 1)`——第 N 度占 [N-1, N) 区间，宿首 `offset=0` 即第 1 度。与算法段 `lineWuxingAt` 写法一致。

## 算法设计（`src/utils/sha.js` + `.d.ts`，纯函数 node 可校验）

```js
// 角度 → 所在宿（复用 luopanRead.mansionAt 思路，但需返回宿对象+宿内偏移）
export function mansionAtDetail(deg) {
  // 返回 { mansion, offset }：mansion = mansions 条目，offset = 宿内古度偏移(0..degree)
}

// 角度 → 宿主五行
export function mansionShengAt(deg) { return mansionAtDetail(deg).mansion.sheng; }

// 角度 → 线度五行（坐山用）
export function lineWuxingAt(deg) {
  const { mansion, offset } = mansionAtDetail(deg);
  const n = Math.min(mansion.degree, Math.floor(offset) + 1);
  return LINE_CYCLE[(lineStart[mansion.name] + n - 1) % 5];
}

// 坐山 vs 一方砂：五行生克 → 五种砂 key
// 五行关系表（只存单向映射，双向查）
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }; // 木生火…
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };   // 木克土…

export function judgeSha(shanWuxing, shaWuxing) {
  if (shanWuxing === shaWuxing) return 'wang';   // 宾同我 → 旺砂
  if (SHENG[shaWuxing] === shanWuxing) return 'sheng'; // 宾生我 → 生砂
  if (KE[shanWuxing] === shaWuxing) return 'cai';      // 我克宾 → 财砂
  if (SHENG[shanWuxing] === shaWuxing) return 'xie';   // 我生宾 → 泄砂
  return 'sha';                                        // 剩者：宾克我 → 煞砂
}

// 八方砂：8 卦方位（坎艮震巽离坤兑乾，每 45°）各断一次
export const SHA_DIRECTIONS = [0, 45, 90, 135, 180, 225, 270, 315]; // 坎艮震巽离坤兑乾

export function judgeAllSha(shanDeg) {
  const shanLine = lineWuxingAt(shanDeg);
  return SHA_DIRECTIONS.map((deg) => {
    const shaWx = mansionShengAt(deg);
    const key = judgeSha(shanLine, shaWx);
    return { deg, mansion: mansionAtDetail(deg).mansion.name, shaWx, relation: key, ...shaJudgments[key] };
  });
}

// 坐山八煞曜：坐山卦 → 煞曜地支 → 方位角
export function baShaAt(shanDeg) {
  const m = mountains.find((x) => x.name === mountainAt(shanDeg));
  const branch = baSha[m.palace]; // palace 字段是卦名（坎/坤/…）
  const angle = BRANCH_ANGLE[branch]; // 地支 → 方位角（0°=子，每 30°）
  return { branch, angle };
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

- 坐山卦从 `mountains` 既有 `palace` 字段取（现有数据每山带卦名）。
- 八煞煞曜地支经 `BRANCH_ANGLE` 换算方位角。

## 组件设计（`FengShuiView.vue` 扩展）

消砂模式判断区替换占位（`fs-pending` → 真判断区）：

```
┌─ 消砂判断 ────────────────────────┐
│ 坐山 子（角宿·线度五行 火）          │
│ 八煞：辰方（巽）逢砂须忌 ⚠        │
│ ┌ 八方砂 ──────────────────────┐ │
│ │ 方 位 │ 砂宿·五行 │ 砂名 │ 应房 │ │
│ │ 坎(0°) │ 角·木 │ 生砂 吉 │ 1/4/7 │ │
│ │ 艮(45°) │ …    │      │      │ │
│ │ …（共 8 行）                     │ │
│ └───────────────────────────────┘ │
└────────────────────────────────────┘
```

- 高亮当前十字线所指方位所在行（与盘面联动）。
- 读数面板保留 P1「人盘 X · 宿 Y」。

## 验证

1. `scripts/verify-fengshui.mjs` 追加：
   - 28 宿 `sheng` 齐全、每象 7 宿宿主五行符合 木金土火火火水；
   - `lineStart` 覆盖 28 宿、每宿起度五行符合五组歌诀；
   - `judgeSha` 五行生克已知用例（如 我木→砂土 = 财砂；我木→砂金 = 煞砂；我木→砂木 = 旺砂）；
   - 八煞表 8 卦齐全、三元龙三组覆盖 24 山。
2. 现有玄空 + 三盘 + 读数断言不回归。
3. `pnpm build` + `npx prettier --check <涉及文件>`。
4. UI 走查：切消砂模式 → 八方砂表 + 八煞提示；切换坐山 → 联动更新；拖拽/点按在消砂模式正常；移动端布局不破。

## 范围边界（P3a 不做）

- 消砂应期（逢六冲/三合吊照/流年填实）。
- 纳水全（阴阳八局/双读数/黄泉）→ P3b 设计文档。
- 二十八宿度数表保留现行 366 度（用户已确认），不改归一逻辑。

## 实施步骤（概览，详细计划由 writing-plans 产出）

1. `mansions.js` 增 `sheng` + `.d.ts` + verify 断言。
2. `shaData.js`（线度五行起度/八煞/三元龙/断语）+ `.d.ts` + verify 断言。
3. `sha.js` 算法（mansionAtDetail / 宿主/线度五行 / judgeSha / 八方 / 八煞 / 分房）+ `.d.ts` + verify 断言。
4. `FengShuiView.vue` 消砂判断区渲染 + 读数联动。
5. 全量验证 + UI 走查。
