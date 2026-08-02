<template>
  <div class="luopan">
    <svg
      ref="svgEl"
      class="luopan-svg"
      viewBox="0 0 540 540"
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

      <!-- 固定指针（红针标坐山/朝向）——置于旋转内盘之下，度数大字压在针体上方不被遮挡 -->
      <path :d="pointerPath" :fill="theme.cinnabar" />

      <!-- 旋转内盘：圈配置驱动 -->
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

        <!-- 模式圈集 -->
        <g :transform="`translate(${C} ${C})`">
          <RingLayer
            v-for="rid in activeRings"
            :key="rid"
            :type="RING_TYPES[rid].type"
            :radius="RING_TYPES[rid].radius"
            :items="ringItems(rid)"
            :interactive="interactiveRings.includes(rid)"
            :label-size="RING_TYPES[rid].labelSize || 0"
            @item-tap="onItemTap"
          />
        </g>
      </g>

      <!-- 天心十道（固定，压圈之上：旋转内盘之后、天池之前） -->
      <line :x1="C - 224" :y1="C" :x2="C + 224" :y2="C" class="crosshair" />
      <line :x1="C" :y1="C - 224" :x2="C" :y2="C + 224" class="crosshair" />

      <!-- 天池（盘心，固定） -->
      <g class="tianchi" aria-hidden="true">
        <circle
          :cx="C"
          :cy="C"
          r="64"
          fill="#fffdf6"
          :stroke="theme.goldLight"
          stroke-width="0.8"
        />
        <circle
          :cx="C"
          :cy="C"
          r="58"
          fill="none"
          :stroke="theme.goldLight"
          stroke-width="0.5"
          stroke-dasharray="1 4"
        />
        <line :x1="C" :y1="C - 58" :x2="C" :y2="C + 58" class="needle-line" />
        <circle :cx="C" :cy="C" r="4" :fill="theme.cinnabar" />
      </g>

      <!-- 盘心水平气泡（仅传感运行中；覆盖天池上方） -->
      <g
        v-if="sensorState === 'running' && beta !== null && gamma !== null"
        aria-hidden="true"
      >
        <circle
          :cx="C"
          :cy="C"
          r="26"
          fill="#fffdf6"
          :stroke="theme.goldLight"
          stroke-width="1"
        />
        <circle
          :cx="C"
          :cy="C"
          r="21"
          fill="none"
          :stroke="theme.goldLight"
          stroke-width="0.6"
          stroke-dasharray="1 4"
        />
        <circle
          :cx="C + bubbleDx"
          :cy="C + bubbleDy"
          r="4.5"
          :fill="level ? theme.cinnabar : theme.inkLight"
        />
      </g>

      <!-- 对宫金点/山名（固定）——金点出圈外，如红针般标在对宫方位 -->
      <circle :cx="C" :cy="C + 246" r="4" :fill="theme.gold" />
      <text
        class="opposite-name"
        :x="C"
        :y="C + 260"
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
import RingLayer from './RingLayer.vue';
import { RING_TYPES, modeRings } from '@/data/luopanRings';
import {
  mountains,
  humanMountains,
  heavenMountains,
  solarTerms,
  degreeTicks,
} from '@/data/luopan';
import { mansions } from '@/data/mansions';
import { jiazi } from '@/data/jiazi';
import { wangXiang48 } from '@/data/fenjin';
import { fuXiRing } from '@/utils/fuXiOrder';
import { fenjinAt } from '@/utils/fenjin';
import { mountainAt, oppositeMountain } from '@/utils/fengShui';
import {
  termAt,
  jiaziAt,
  hexagramAt,
  mansionAt,
  plateMountainAt,
} from '@/utils/luopanRead';
import { theme } from '@/styles/theme';
import {
  useCompassSensor,
  LEVEL_TOLERANCE,
} from '@/composables/useCompassSensor';

const props = defineProps({
  mountain: { type: String, default: '子' },
  mode: { type: String, default: 'ding' },
  fineAngle: { type: Number, default: null },
});
const emit = defineEmits(['select', 'readout']);

const C = 270;
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

watch(readout, (r) => emit('readout', r), { immediate: true, flush: 'post' });

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
  gamma.value === null
    ? 0
    : clamp01(-gamma.value / LEVEL_TOLERANCE) * BUBBLE_MAX
);
const bubbleDy = computed(() =>
  beta.value === null ? 0 : clamp01(beta.value / LEVEL_TOLERANCE) * BUBBLE_MAX
);

// 红针：基部在刻度圈内侧（r≈224）、针尖伸出外圈（r≈256），度数大字可压过针体
const pointerPath = `M ${C} 14 L ${C + 8} 46 L ${C} 30 L ${C - 8} 46 Z`;

// 旋转来源：传感运行中跟随手机朝向（平滑），否则吸附到选中山
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
      return trigramAngles.map((t) => ({
        angle: t.angle,
        glyph: t.trigram,
        sub: `${t.name}·${t.num}`,
      }));
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
  const step = props.mode === 'ding' ? 3 : 15;
  const snapped = Math.round(rot.value / step) * step;
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
  font-size: 12px;
  fill: var(--gold);
  pointer-events: none;
}
</style>
