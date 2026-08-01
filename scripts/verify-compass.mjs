// 校验 useCompassSensor：在 import 前布置浏览器假全局，再模拟 deviceorientation 事件
// 运行：node scripts/verify-compass.mjs
// 注意：supported 在模块加载时求值，故必须先布置全局再动态 import

let failed = false;
const check = (cond, msg) => {
  if (!cond) {
    console.error('✗ ' + msg);
    failed = true;
  } else {
    console.log('✓ ' + msg);
  }
};

// —— 布置假浏览器全局（触屏手机形态）——
// Node ≥21 自带只读 navigator，需 defineProperty 覆盖
const listeners = {}; // 事件名 → 处理器列表
let permissionResult = 'granted'; // 可变，用于测试拒绝路径
const defineGlobal = (name, value) =>
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
function MockDOE() {}
MockDOE.requestPermission = async () => permissionResult;
defineGlobal('window', {
  orientation: 0,
  DeviceOrientationEvent: MockDOE,
  addEventListener: (name, fn) => {
    (listeners[name] ??= []).push(fn);
  },
  removeEventListener: (name, fn) => {
    if (listeners[name])
      listeners[name] = listeners[name].filter((f) => f !== fn);
  },
});
defineGlobal('navigator', { maxTouchPoints: 5 });
defineGlobal('screen', { orientation: { angle: 0 } });

const { useCompassSensor } = await import(
  '../src/composables/useCompassSensor.js'
);
const { mountainAt } = await import('../src/utils/fengShui.js');
const sensor = useCompassSensor();

const fire = (evt) =>
  (listeners.deviceorientation ?? []).forEach((fn) => fn(evt));
const fireAlpha = (alpha) => fire({ alpha });
const fireMany = (alphas) => alphas.forEach(fireAlpha);
const fresh = async () => {
  sensor.stopCompass();
  await sensor.startCompass();
  check(sensor.state.value === 'running', 'start 后应进入 running');
};

// —— 1. 能力检测 ——
check(
  sensor.supported.value === true,
  '触屏+DeviceOrientationEvent 环境 supported=true'
);

// —— 2. 授权 + 监听 ——
await sensor.startCompass();
check(sensor.state.value === 'running', '授权通过后进入 running');
check(
  typeof listeners.deviceorientation === 'object',
  '已注册 deviceorientation 监听'
);

// —— 3. 平滑 + 0/360 交界 ——
fireMany([350, 355, 358, 2, 4]);
const h = sensor.heading.value;
check(h !== null, '收到事件后 heading 有值');
check(h < 5 || h > 355, `交界读数平滑后应贴近 0°（实为 ${h.toFixed(1)}°）`);
check(mountainAt(h) === '子', `平滑后应落 子 山（实为 ${mountainAt(h)}）`);

// —— 4. 屏旋转修正：横屏 90° 时 alpha=0 应指向东（卯 90°）——
screen.orientation.angle = 90;
await fresh();
fireMany([0, 0, 0, 0, 0]);
check(
  mountainAt(sensor.heading.value) === '卯',
  `横屏修正：alpha=0 → 卯（实为 ${mountainAt(sensor.heading.value)}）`
);
screen.orientation.angle = 0;

// —— 5. 停止：清空读数与监听 ——
sensor.stopCompass();
check(sensor.state.value === 'idle', 'stop 后回到 idle');
check(sensor.heading.value === null, 'stop 后 heading 清空');
check(!(listeners.deviceorientation ?? []).length, 'stop 后监听已移除');

// —— 6. 拒绝路径 ——
permissionResult = 'denied';
sensor.stopCompass();
await sensor.startCompass();
check(sensor.state.value === 'denied', 'requestPermission 拒绝 → denied');
// 恢复授权后可重试
permissionResult = 'granted';
await sensor.startCompass();
check(sensor.state.value === 'running', '恢复授权后重试可进入 running');
sensor.stopCompass();

// —— 7. 桌面降级（触屏数 = 0）—— 子进程验证，避免污染本进程模块状态 ——
const { execFileSync } = await import('node:child_process');
const sub = `
  const listeners = {};
  function MockDOE() {}
  Object.defineProperty(globalThis, 'window', { value: {
    DeviceOrientationEvent: MockDOE,
    addEventListener: (n, f) => { (listeners[n] ??= []).push(f); },
    removeEventListener: () => {},
  }, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'navigator', { value: { maxTouchPoints: 0 }, configurable: true, writable: true });
  const { useCompassSensor } = await import('./src/composables/useCompassSensor.js');
  process.stdout.write(String(useCompassSensor().supported.value));
`;
const out = execFileSync(process.execPath, ['--input-type=module', '-e', sub], {
  encoding: 'utf8',
});
check(
  out.trim() === 'false',
  '桌面（maxTouchPoints=0）supported=false，入口自动隐藏'
);

if (failed) process.exit(1);
console.log('✓ 方向传感器组合式 校验通过');
