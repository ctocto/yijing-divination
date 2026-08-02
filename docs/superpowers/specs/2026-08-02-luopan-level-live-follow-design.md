# 风水罗盘：盘心水平气泡 + 盘面实时跟随手机朝向

日期：2026-08-02
状态：已批准（待实施）

## 背景

「手机朝向对准」当前只在锁定时才更新罗盘，且用户无法感知手机是否放平。真实罗盘需要平端测量，手机倾斜时磁航向读数会失真。目标是让「转手机 → 罗盘跟随 → 放平 → 锁定」成为一个连贯的实体罗盘体验。

## 目标 / 非目标

**目标**
- 运行传感期间，罗盘内盘实时跟随手机朝向（heading）平滑转动
- 盘心（天池位置）显示圆气泡水平仪，反映手机前后/左右倾斜
- 未水平时纯提示，不拦截锁定

**非目标**
- 不引入兼向/分金等精细读数（当前仍是 15° 一山粒度）
- 不做磁偏角修正
- 不在桌面端模拟水平仪（无传感器入口本就隐藏）

## 决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 水平指示位置 | 罗盘盘心（天池）固定层 | 用户选定；不随内盘转，倾斜相对手机屏幕 |
| 盘面跟随 | 平滑跟随 heading（`rot = -heading`） | 更好对准；锁定后再吸附 15° |
| 水平约束 | 纯提示不拦截 | 用户选定 |
| 数据传递 | 扩展 `useCompassSensor` 单例 | 项目既有单例模式（useCompass 同款） |
| 运行中交互 | 禁拖、禁点选山 | 传感器驱动盘面，避免冲突 |

## 改动

### 1. `src/composables/useCompassSensor.js`

- `onOrientation(e)` 中新增 `beta`、`gamma` 两个 ref，从同一事件对象读取（平放时 beta≈90、gamma≈0）
- 新增常量 `LEVEL_TOLERANCE = 8`（°）
- 新增 computed `level = |beta − 90| ≤ 8 && |gamma| ≤ 8`
- `stopCompass()` 中一并清空 beta/gamma
- `useCompassSensor()` 返回值新增 `beta`、`gamma`、`level`

### 2. `src/components/fengshui/Luopan.vue`

- import `useCompassSensor()`，取 `state: sensorState`、`heading`、`beta`、`gamma`、`level`
- **盘面跟随**：将现有 `watch(() => props.mountain)` 改为单一 watch `[sensorState, heading, props.mountain]`：
  - `dragging` 时跳过（拖动直接写 `rot`，`onUp` 里吸附并 emit）
  - running 且 `heading !== null` → `rot = -heading`（平滑）
  - 否则 → `rot = -angleOf(props.mountain)`（回落/吸附）
- **守卫**：`onDown` 与 `select()` 开头加 `if (sensorState.value === 'running') return`（禁拖、禁点选山）
- **盘心气泡**（固定层，天池位置 C,C）：
  - 外圈 r≈28、内点 r≈4；气泡偏移 `dx = clamp(gamma / TOL, -1, 1) * 14`，`dy = clamp((beta - 90) / TOL, -1, 1) * 14`（符号按"气泡向低处滚"调）
  - 颜色：level 时内点朱砂色，否则墨淡色
  - 仅 `sensorState === 'running'` 时渲染

### 3. `src/composables/useCompassSensor.d.ts`

- 接口新增 `beta: { value: number | null }`、`gamma: { value: number | null }`、`level: { value: boolean }`

### 4. `src/components/fengshui/FengShuiView.vue`

- 在 compass-live 旁加小字「已水平 / 请放平」，读同一单例 `level`
- 锁定逻辑不变：`selectedDir = mountainAt(heading)`

## 数据流

```
deviceorientation 事件
  → useCompassSensor 单例（beta/gamma/heading + 滑动平均）
  → Luopan：heading→rot（盘面跟随）；beta/gamma→气泡偏移、level→颜色
  → FengShuiView：level→「已水平/请放平」文字
锁定 → selectedDir = mountainAt(heading) → 盘面吸附 → 飞星盘更新
```

## 边界与错误处理

- heading/beta/gamma 为 null（尚无读数）：气泡不渲染内点或置于中心，`level` 为 false
- 授权被拒（denied）：流程不变，无气泡
- 锁定/取消后：sensorState 回到 idle，盘面回落 `rot = -angleOf(props.mountain)`
- 运行中拖动/点选山：被守卫拦截，无响应

## 验证

- 无测试脚本，手动在触屏设备（iOS/Android）验证：
  - 转手机 → 盘面平滑跟随，红针指向手机朝向
  - 前后/左右倾斜 → 气泡对应偏移，放平居中变色
  - 锁定 → 盘面吸附整 15° 山，坐/向与飞星盘正确
  - 取消 → 盘面回到传感前状态
- `pnpm build` 通过；桌面端（无传感器）入口仍隐藏，无回归
