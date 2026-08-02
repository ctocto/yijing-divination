<template>
  <div class="luopan">
    <svg
      ref="svgEl"
      class="luopan-svg"
      viewBox="0 0 520 520"
      :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
    >
      <!-- 外装饰环（固定） -->
      <circle
        :cx="C"
        :cy="C"
        :r="228"
        fill="none"
        :stroke="theme.gold"
        stroke-width="1.6"
      />
      <circle
        :cx="C"
        :cy="C"
        :r="222"
        fill="none"
        :stroke="theme.goldLight"
        stroke-width="0.7"
        stroke-dasharray="2 5"
      />
      <circle
        :cx="C"
        :cy="C"
        :r="92"
        fill="none"
        :stroke="theme.goldLight"
        stroke-width="0.7"
      />

      <!-- 旋转内盘：24 山 + 八卦方位 -->
      <g :transform="`rotate(${rot} ${C} ${C})`">
        <!-- 拖拽命中圈（透明整圆） -->
        <circle
          :cx="C"
          :cy="C"
          :r="220"
          fill="transparent"
          @pointerdown="onDown"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
        />

        <!-- 24 山 -->
        <g
          v-for="m in mountains"
          :key="m.name"
          :transform="`translate(${pos(m.angle, 196).x}, ${pos(m.angle, 196).y}) rotate(${m.angle})`"
          @pointerdown.stop.prevent="select(m.name)"
        >
          <rect
            x="-16"
            y="-14"
            width="32"
            height="30"
            rx="3"
            :fill="
              m.name === props.mountain ? 'rgba(178,58,46,0.14)' : 'transparent'
            "
          />
          <text
            class="mountain-name"
            :class="{ active: m.name === props.mountain }"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ m.name }}
          </text>
        </g>

        <!-- 八卦方位：卦符 + 卦名·洛书数 -->
        <g
          v-for="t in trigramAngles"
          :key="t.name"
          :transform="`translate(${pos(t.angle, 150).x}, ${pos(t.angle, 150).y})`"
          text-anchor="middle"
        >
          <text class="tri-glyph" dominant-baseline="central" y="-8">
            {{ t.trigram }}
          </text>
          <text class="tri-sub" y="16">{{ t.name }}·{{ t.num }}</text>
        </g>
      </g>

      <!-- 盘心水平气泡（仅传感运行中；固定层，倾斜相对手机屏幕） -->
      <g
        v-if="sensorState === 'running' && beta !== null && gamma !== null"
        aria-hidden="true"
      >
        <circle :cx="C" :cy="C" r="26" fill="#fffdf6" :stroke="theme.goldLight" stroke-width="1" />
        <circle :cx="C" :cy="C" r="21" fill="none" :stroke="theme.goldLight" stroke-width="0.6" stroke-dasharray="1 4" />
        <circle :cx="C + bubbleDx" :cy="C + bubbleDy" r="4.5" :fill="level ? theme.cinnabar : theme.inkLight" />
      </g>

      <!-- 固定指针（红针标坐山/朝向） -->
      <path :d="pointerPath" :fill="theme.cinnabar" />
      <!-- 对宫金点 + 对宫山名 -->
      <circle :cx="C" :cy="C + 212" r="5" :fill="theme.gold" />
      <text
        class="opposite-name"
        :x="C"
        :y="C + 230"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {{ opposite }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { mountains } from '@/data/luopan';
import { mountainAt, oppositeMountain } from '@/utils/fengShui';
import { theme } from '@/styles/theme';
import { useCompassSensor, LEVEL_TOLERANCE } from '@/composables/useCompassSensor';

const props = defineProps({
  mountain: { type: String, default: '子' },
});
const emit = defineEmits(['select']);

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

const angleOf = (name) => mountains.find((m) => m.name === name)?.angle ?? 0;
// computed 而非普通函数：模板 `{{ opposite }}` 会自动取 .value，普通函数会被渲染成源码字符串
const opposite = computed(() => oppositeMountain(props.mountain));

const pos = (a, r) => ({
  x: C + r * Math.sin((a * Math.PI) / 180),
  y: C - r * Math.cos((a * Math.PI) / 180),
});

// 气泡偏移：倾斜度/容差 归一化后按像素钳制（符号待真机验证，必要时 dx 取反）
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
.mountain-name {
  font-size: 17px;
  fill: var(--ink);
  pointer-events: none;
}
.mountain-name.active {
  fill: var(--cinnabar);
  font-size: 19px;
  font-weight: 700;
}
.tri-glyph {
  font-size: 26px;
  fill: var(--ink-light);
  pointer-events: none;
}
.tri-sub {
  font-size: 11px;
  fill: var(--ink-light);
  pointer-events: none;
}
.opposite-name {
  font-size: 13px;
  fill: var(--gold);
  pointer-events: none;
}
</style>
