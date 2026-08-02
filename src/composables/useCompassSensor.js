// 手机方向传感器（指南针）封装 —— 模块级单例，供风水罗盘「手机朝向对准」使用
import { ref, computed } from 'vue';

// 能力检测：需 DeviceOrientationEvent 且为触屏设备（桌面无磁力计，自动隐藏入口）
const canUse = () =>
  typeof window !== 'undefined' &&
  typeof window.DeviceOrientationEvent === 'function' &&
  (navigator.maxTouchPoints ?? 0) > 0;

// 模块级单例状态
const supported = ref(canUse());
const state = ref('idle'); // 'idle' | 'running' | 'denied'
const heading = ref(null); // 平滑后的实时朝向 0-360（null = 尚无读数）

let listener = null;
let buf = [];

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

const WINDOW = 5; // 平滑窗口（滑动平均）

// 事件 → 当前屏顶朝向（度，0=北，顺时针）
function headingFrom(e) {
  let alpha;
  if (typeof e.webkitCompassHeading === 'number') {
    alpha = e.webkitCompassHeading; // iOS 旧式：已是北向基准的绝对朝向
  } else {
    if (typeof e.alpha !== 'number') return null;
    alpha = e.alpha;
    // 横竖屏修正：屏顶朝向 = alpha + 屏幕顺时针旋转角
    const orient =
      typeof screen !== 'undefined'
        ? (screen.orientation?.angle ?? window.orientation ?? 0)
        : 0;
    alpha += orient;
  }
  return ((alpha % 360) + 360) % 360;
}

// 循环均值（避免 0/360 交界处跳变）
function smooth(deg) {
  const r = (deg * Math.PI) / 180;
  buf.push([Math.cos(r), Math.sin(r)]);
  if (buf.length > WINDOW) buf.shift();
  const x = buf.reduce((s, v) => s + v[0], 0) / buf.length;
  const y = buf.reduce((s, v) => s + v[1], 0) / buf.length;
  const out = (Math.atan2(y, x) * 180) / Math.PI;
  return (out + 360) % 360;
}

function onOrientation(e) {
  if (typeof e.beta === 'number') beta.value = e.beta;
  if (typeof e.gamma === 'number') gamma.value = e.gamma;
  const h = headingFrom(e);
  if (h === null) return;
  heading.value = smooth(h);
}

export async function startCompass() {
  if (!supported.value || state.value === 'running' || listener) return;
  const DOE = window.DeviceOrientationEvent;
  const granted =
    typeof DOE.requestPermission === 'function'
      ? (await DOE.requestPermission()) === 'granted' // iOS 13+：须在用户手势内调用
      : true; // Android/其余：直接监听
  if (!granted) {
    state.value = 'denied';
    return;
  }
  listener = onOrientation;
  window.addEventListener('deviceorientation', listener);
  state.value = 'running';
}

export function stopCompass() {
  if (listener) {
    window.removeEventListener('deviceorientation', listener);
    listener = null;
  }
  buf = [];
  heading.value = null;
  beta.value = null;
  gamma.value = null;
  if (state.value === 'running') state.value = 'idle';
}

export function useCompassSensor() {
  return { supported, state, heading, beta, gamma, level, startCompass, stopCompass };
}
