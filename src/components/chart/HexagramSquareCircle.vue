<template>
  <svg
    class="fuxi-chart"
    :viewBox="`0 0 ${SIZE} ${SIZE}`"
    @mouseleave="onLeave"
  >
    <!-- 外圈装饰环 -->
    <circle :cx="C" :cy="C" :r="R_DECOR" fill="none" :stroke="theme.gold" stroke-width="1.4" />
    <circle :cx="C" :cy="C" :r="R_DECOR - 9" fill="none" :stroke="theme.goldLight" stroke-width="0.7" stroke-dasharray="2 5" />

    <!-- 圆环卦：先天卦序，乾上坤下；左半 夬→复，右半 姤→剥 -->
    <g
      v-for="item in circleItems"
      :key="'c-' + item.name"
      class="glyph-slot"
      :transform="`translate(${item.x}, ${item.y})`"
      @click="onClick(item.name)"
      @mouseenter="onEnter(item.name)"
    >
      <HexLines :binary="item.binary" :size="CIRCLE_GLYPH" :state="slotState(item.name)" />
    </g>

    <!-- 方图 8×8：乾左下 → 坤右上（行=上卦，列=下卦） -->
    <g v-for="(row, r) in squareGrid" :key="'row-' + r">
      <g
        v-for="h in row"
        :key="'s-' + h.name"
        class="glyph-slot"
        :transform="`translate(${squareX(h.col)}, ${squareY(h.row)})`"
        @click="onClick(h.name)"
        @mouseenter="onEnter(h.name)"
      >
        <HexLines :binary="h.binary" :size="SQUARE_GLYPH" :state="slotState(h.name)" />
      </g>
    </g>

    <!-- 先天八卦方位标注（顺时针自顶：乾兑离震坤艮坎巽） -->
    <text
      v-for="t in trigramLabels"
      :key="t.name"
      :x="t.x"
      :y="t.y"
      text-anchor="middle"
      dominant-baseline="middle"
      class="trigram-label"
    >{{ t.name }}</text>
  </svg>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import HexLines from './HexLines.vue'
import { hexagrams } from '@/data/hexagrams'
import { theme } from '@/styles/theme'

const props = defineProps({
  selected: { type: String, default: null },  // 选中卦名
  castName: { type: String, default: null },  // 起卦抽中卦名
  casting: { type: Boolean, default: false }, // 起卦点亮阶段
})
const emit = defineEmits(['select', 'hover'])

const SIZE = 900
const C = SIZE / 2
const R_CIRCLE = 320   // 圆环卦半径
const CIRCLE_GLYPH = 24
const R_TRIGRAM = 372  // 八卦方位标注半径
const R_DECOR = 404    // 外装饰环
const SQ_HALF = 168    // 方图半边长
const SQUARE_GLYPH = 34

// 先天八卦：乾兑离震巽坎艮坤（三爻自下而上）
const TRIGRAMS = [
  { name: '乾', bin: '111' },
  { name: '兑', bin: '110' },
  { name: '离', bin: '101' },
  { name: '震', bin: '100' },
  { name: '巽', bin: '011' },
  { name: '坎', bin: '010' },
  { name: '艮', bin: '001' },
  { name: '坤', bin: '000' },
]

function byBinary(bin) {
  return hexagrams.find(h => h.binary === bin)
}

// 先天六十四卦序：binary 数值升序（parseInt 视二进制串自下而上为从高位到低位）
const fuXi = [...hexagrams].sort((a, b) => parseInt(a.binary, 2) - parseInt(b.binary, 2))

// 方图 8×8：行 r=0（底）上卦=乾 … 行 r=7（顶）上卦=坤；列同理下卦 乾…坤
const squareGrid = TRIGRAMS.map((upper, r) =>
  TRIGRAMS.map((lower, c) => {
    const h = byBinary(lower.bin + upper.bin)
    return { name: h.name, binary: h.binary, row: r, col: c }
  })
)

function squareX(c) {
  return C - SQ_HALF + (c + 0.5) * ((2 * SQ_HALF) / 8)
}
function squareY(r) {
  return C + SQ_HALF - (r + 0.5) * ((2 * SQ_HALF) / 8)
}

// 圆环 64 卦：乾(顶0°) → 左半逆时针 夬..复 → 坤(底180°) → 右半顺时针 姤..剥
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

const trigramLabels = TRIGRAMS.map((t, i) => {
  const ang = (i * Math.PI) / 4
  return { name: t.name, x: C + R_TRIGRAM * Math.sin(ang), y: C - R_TRIGRAM * Math.cos(ang) }
})

const hoverName = ref(null)

// —— 起卦扫描动画：高亮在多个随机卦位快速跳动、减速，最后落在抽中的卦上 ——
const sweepName = ref(null)
let sweepTimer = null

watch(
  () => props.casting,
  (casting) => {
    clearTimeout(sweepTimer)
    sweepName.value = null
    if (!casting || !props.castName) return
    const STEPS = 15
    const seq = []
    for (let i = 0; i < STEPS - 1; i++) {
      let n = randomName()
      // 避免相邻重复；最后一个诱饵不能提前等于落点
      while (n === seq[seq.length - 1] || (i === STEPS - 2 && n === props.castName)) {
        n = randomName()
      }
      seq.push(n)
    }
    seq.push(props.castName)
    let step = 0
    const tick = () => {
      if (step >= seq.length) return // 停在抽中的卦上
      sweepName.value = seq[step]
      step += 1
      sweepTimer = setTimeout(tick, 12 + step * 6) // 减速：间隔随步数递增
    }
    tick()
  },
)

onBeforeUnmount(() => clearTimeout(sweepTimer))

function randomName() {
  return hexagrams[Math.floor(Math.random() * hexagrams.length)].name
}

function slotState(name) {
  if (props.selected === name) return 'selected'
  if (props.casting && sweepName.value === name) return 'casting'
  if (hoverName.value === name) return 'hover'
  return 'normal'
}
function onEnter(name) {
  hoverName.value = name
  emit('hover', name)
}
function onLeave() {
  hoverName.value = null
  emit('hover', null)
}
function onClick(name) {
  emit('select', name)
}
</script>

<style scoped>
.fuxi-chart {
  display: block;
  user-select: none;
}
.glyph-slot {
  cursor: pointer;
}
.trigram-label {
  font-family: 'Ma Shan Zheng', 'STKaiti', cursive;
  font-size: 30px;
  fill: var(--ink-light);
  pointer-events: none;
}
</style>
